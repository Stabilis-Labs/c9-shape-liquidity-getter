import {
  getComponentData,
  getAllKeyValueStoreKeys,
  fetchKeyValueStoreDataInChunks,
  getGatewayApi,
  getNFTData,
} from "../services/gateway";
import {
  LedgerStateSelector,
  StateEntityDetailsResponseItem,
  StateKeyValueStoreDataResponseItem,
  ProgrammaticScryptoSborValue,
} from "@radixdlt/babylon-gateway-api-sdk";
import { Decimal } from "decimal.js";
import { DataError } from "../types/errors";

interface ComponentField {
  kind: string;
  type_name?: string;
  field_name?: string;
  value?: string;
  fields?: ComponentField[];
  variant_id?: string;
  variant_name?: string;
}

interface ComponentState {
  fields: ComponentField[];
}

interface BinData {
  amount: string;
  total_claim: string;
}

interface C9BinMapData {
  [tick: number]: BinData;
}

interface ScryptoField {
  kind: string;
  field_name?: string;
  value?: string;
}

interface ScryptoValue {
  kind: string;
  fields?: ScryptoField[];
}

interface LiquidityClaim {
  tick: number;
  claim: string;
}

interface LiquidityReceipt {
  liquidity_claims: LiquidityClaim[];
}

interface RedemptionValue {
  amount_x: string;
  amount_y: string;
}

interface NFTDataEntry {
  key: {
    kind: string;
    value: string;
  };
  value: {
    kind: string;
    value: string;
  };
}

interface NFTLiquidityClaims {
  kind: string;
  field_name: string;
  key_kind: string;
  value_kind: string;
  entries: NFTDataEntry[];
}

interface NFTData {
  kind: string;
  type_name: string;
  fields: {
    kind: string;
    field_name: string;
    key_kind: string;
    value_kind: string;
    entries: NFTDataEntry[];
  }[];
}

export async function getC9BinData(
  componentAddress: string,
  stateVersion?: number
): Promise<{
  componentData: StateEntityDetailsResponseItem;
  binMapData: C9BinMapData;
  nftAddress: string;
  currentTick?: number;
  active_x: string;
  active_y: string;
  active_total_claim: string;
  binSpan: number;
} | null> {
  try {
    const api = getGatewayApi();

    // Validate state version before proceeding
    if (stateVersion !== undefined) {
      const currentStateVersion = await api.status
        .getCurrent()
        .then((response) => response.ledger_state.state_version);
      if (stateVersion > currentStateVersion) {
        throw DataError.stateVersionTooHigh(stateVersion);
      }
    }

    const ledgerState: LedgerStateSelector | undefined = stateVersion
      ? { state_version: stateVersion }
      : undefined;

    // 1. Get component data
    const componentData = await getComponentData(
      api,
      componentAddress,
      stateVersion
    );
    if (!componentData) {
      console.error("Component data not found");
      return null;
    }

    // 2. Extract all needed fields from component state
    const state = (componentData.details as any)?.state as ComponentState;
    if (!state?.fields) {
      console.error("Invalid component state");
      return null;
    }

    // Find required fields
    const binMapField = state.fields.find((f) => f.field_name === "bin_map");
    const tickIndexField = state.fields.find(
      (f) => f.field_name === "tick_index"
    );
    const nftManagerField = state.fields.find(
      (f) => f.field_name === "liquidity_receipt_manager"
    );
    const activeXField = state.fields.find((f) => f.field_name === "active_x");
    const activeYField = state.fields.find((f) => f.field_name === "active_y");
    const activeTotalClaimField = state.fields.find(
      (f) => f.field_name === "active_total_claim"
    );
    const binSpanField = state.fields.find((f) => f.field_name === "bin_span");

    if (
      !binMapField?.value ||
      !nftManagerField?.value ||
      !activeXField?.value ||
      !activeYField?.value ||
      !activeTotalClaimField?.value ||
      !binSpanField?.value
    ) {
      console.error("Required fields not found in component state");
      return null;
    }

    // Extract current tick if available
    const currentTickField = tickIndexField?.fields?.find(
      (f) => f.field_name === "current"
    )?.fields?.[0]?.fields?.[0]?.value;
    const currentTick = currentTickField
      ? parseInt(currentTickField)
      : undefined;

    // Extract bin span
    const binSpan = parseInt(binSpanField.value);
    if (isNaN(binSpan)) {
      console.error("Invalid bin span value");
      return null;
    }

    const kvStoreAddress = binMapField.value;

    // 3. Get all keys from the KV store
    const keys = await getAllKeyValueStoreKeys(
      api,
      kvStoreAddress,
      ledgerState
    );

    // 4. Fetch the actual data for all keys
    const rawBinMapData = await fetchKeyValueStoreDataInChunks(
      kvStoreAddress,
      keys,
      api,
      ledgerState
    );

    // 5. Transform the data into a dictionary
    const binMapData: C9BinMapData = {};
    for (const entry of rawBinMapData) {
      const keyJson = entry.key.programmatic_json as ScryptoValue;
      const valueJson = entry.value.programmatic_json as ScryptoValue;

      const tick = keyJson?.fields?.[0]?.value;
      if (tick && valueJson?.fields) {
        const fields = valueJson.fields;
        const amount =
          fields.find((f: ScryptoField) => f.field_name === "amount")?.value ||
          "0";
        const totalClaim =
          fields.find((f: ScryptoField) => f.field_name === "total_claim")
            ?.value || "0";

        binMapData[parseInt(tick)] = {
          amount,
          total_claim: totalClaim,
        };
      }
    }

    return {
      componentData,
      binMapData,
      nftAddress: nftManagerField.value,
      currentTick,
      active_x: activeXField.value,
      active_y: activeYField.value,
      active_total_claim: activeTotalClaimField.value,
      binSpan,
    };
  } catch (error) {
    if (error instanceof DataError) {
      throw error;
    }
    console.error("Error in getC9BinData:", error);
    throw error;
  }
}

export async function calculateRedemptionValue(
  componentAddress: string,
  nftId: string,
  stateVersion: number
): Promise<RedemptionValue | null> {
  try {
    // 1. Get all C9 data
    const c9Data = await getC9BinData(componentAddress, stateVersion);
    if (!c9Data || !c9Data.currentTick) {
      console.error("Failed to get C9 data or current tick not available");
      return null;
    }

    // 2. Get NFT data
    const api = getGatewayApi();
    const nftDataResponse = await getNFTData(
      api,
      c9Data.nftAddress,
      nftId,
      stateVersion
    );
    if (!nftDataResponse?.[0]?.data?.programmatic_json) {
      console.error("Failed to get NFT data");
      return null;
    }

    // 3. Extract liquidity claims from NFT data
    const nftData = nftDataResponse[0].data.programmatic_json as NFTData;
    const liquidityClaimsField = nftData.fields.find(
      (f) => f.field_name === "liquidity_claims"
    );

    if (!liquidityClaimsField?.entries) {
      console.error("No liquidity claims found in NFT data");
      return null;
    }

    // Initialize amounts
    let amount_x = "0";
    let amount_y = "0";

    // 4. Calculate redemption values
    for (const entry of liquidityClaimsField.entries) {
      const tick = parseInt(entry.key.value);
      const claimAmount = entry.value.value;

      if (tick < c9Data.currentTick) {
        // Bin below current tick - only Y tokens
        const bin = c9Data.binMapData[tick];
        if (bin) {
          const share = new Decimal(claimAmount).div(bin.total_claim);
          amount_y = new Decimal(amount_y)
            .plus(share.times(bin.amount))
            .toString();
        }
      } else if (tick > c9Data.currentTick) {
        // Bin above current tick - only X tokens
        const bin = c9Data.binMapData[tick];
        if (bin) {
          const share = new Decimal(claimAmount).div(bin.total_claim);
          amount_x = new Decimal(amount_x)
            .plus(share.times(bin.amount))
            .toString();
        }
      } else {
        // Active bin - both X and Y tokens
        const liquidityShare = new Decimal(claimAmount).div(
          c9Data.active_total_claim
        );
        amount_x = new Decimal(amount_x)
          .plus(new Decimal(c9Data.active_x).times(liquidityShare))
          .toString();
        amount_y = new Decimal(amount_y)
          .plus(new Decimal(c9Data.active_y).times(liquidityShare))
          .toString();
      }
    }

    return {
      amount_x,
      amount_y,
    };
  } catch (error) {
    console.error("Error calculating redemption value:", error);
    throw error;
  }
}
