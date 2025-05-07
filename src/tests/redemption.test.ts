import {
  getRedemptionValue,
  getRedemptionValues,
} from "../services/redemption.service";
import { TEST_CONFIG } from "./test.config";
import { ComponentError, NFTError, DataError } from "../types/errors";

describe("Redemption Service Tests", () => {
  // Set longer timeout for real network calls
  jest.setTimeout(30000);

  describe("getRedemptionValue", () => {
    test("should successfully calculate redemption value with valid inputs", async () => {
      const result = await getRedemptionValue({
        componentAddress: TEST_CONFIG.validComponentAddress,
        nftId: TEST_CONFIG.validNftId,
        stateVersion: TEST_CONFIG.validStateVersion,
      });

      console.log("\nValid inputs result:", result);
      expect(result).not.toBeNull();
      expect(result).toHaveProperty("xToken");
      expect(result).toHaveProperty("yToken");
      expect(typeof result?.xToken).toBe("string");
      expect(typeof result?.yToken).toBe("string");
    });

    test("should handle wrong type component address", async () => {
      await expect(
        getRedemptionValue({
          componentAddress: TEST_CONFIG.wrongTypeComponentAddress,
          nftId: TEST_CONFIG.validNftId,
          stateVersion: TEST_CONFIG.validStateVersion,
        })
      ).rejects.toThrow("Component address must be a string");
    });

    test("should handle random string component address", async () => {
      await expect(
        getRedemptionValue({
          componentAddress: TEST_CONFIG.randomStringComponentAddress,
          nftId: TEST_CONFIG.validNftId,
          stateVersion: TEST_CONFIG.validStateVersion,
        })
      ).rejects.toThrow(ComponentError);
    });

    test("should handle real non-C9 component address", async () => {
      await expect(
        getRedemptionValue({
          componentAddress: TEST_CONFIG.realNonC9ComponentAddress,
          nftId: TEST_CONFIG.validNftId,
          stateVersion: TEST_CONFIG.validStateVersion,
        })
      ).rejects.toThrow(ComponentError);
    });

    test("should handle wrong type NFT ID", async () => {
      await expect(
        getRedemptionValue({
          componentAddress: TEST_CONFIG.validComponentAddress,
          nftId: TEST_CONFIG.wrongTypeNftId,
          stateVersion: TEST_CONFIG.validStateVersion,
        })
      ).rejects.toThrow("NFT ID must be a string");
    });

    test("should handle random string NFT ID", async () => {
      await expect(
        getRedemptionValue({
          componentAddress: TEST_CONFIG.validComponentAddress,
          nftId: TEST_CONFIG.randomStringNftId,
          stateVersion: TEST_CONFIG.validStateVersion,
        })
      ).rejects.toThrow(NFTError);
    });

    test("should handle non-existent NFT ID", async () => {
      await expect(
        getRedemptionValue({
          componentAddress: TEST_CONFIG.validComponentAddress,
          nftId: TEST_CONFIG.nonExistentNftId,
          stateVersion: TEST_CONFIG.validStateVersion,
        })
      ).rejects.toThrow(NFTError);
    });

    test("should handle early state version", async () => {
      await expect(
        getRedemptionValue({
          componentAddress: TEST_CONFIG.validComponentAddress,
          nftId: TEST_CONFIG.validNftId,
          stateVersion: TEST_CONFIG.earlyStateVersion,
        })
      ).rejects.toThrow(ComponentError);
    });

    test("should handle future state version", async () => {
      await expect(
        getRedemptionValue({
          componentAddress: TEST_CONFIG.validComponentAddress,
          nftId: TEST_CONFIG.validNftId,
          stateVersion: TEST_CONFIG.futureStateVersion,
        })
      ).rejects.toThrow(DataError);
    });
  });

  describe("getRedemptionValues", () => {
    test("should successfully calculate redemption values with valid inputs", async () => {
      const result = await getRedemptionValues({
        componentAddress: TEST_CONFIG.validComponentAddress,
        nftIds: TEST_CONFIG.validNftIds,
        stateVersion: TEST_CONFIG.validStateVersion,
      });

      console.log("\nValid inputs batch result:", result);
      expect(result).toBeDefined();
      expect(Object.keys(result).length).toBeGreaterThan(0);

      for (const nftId of TEST_CONFIG.validNftIds) {
        expect(result[nftId]).toBeDefined();
        expect(result[nftId]).toHaveProperty("xToken");
        expect(result[nftId]).toHaveProperty("yToken");
        expect(typeof result[nftId].xToken).toBe("string");
        expect(typeof result[nftId].yToken).toBe("string");
      }
    });

    test("should handle wrong type component address", async () => {
      await expect(
        getRedemptionValues({
          componentAddress: TEST_CONFIG.wrongTypeComponentAddress,
          nftIds: TEST_CONFIG.validNftIds,
          stateVersion: TEST_CONFIG.validStateVersion,
        })
      ).rejects.toThrow("Component address must be a string");
    });

    test("should handle random string component address", async () => {
      await expect(
        getRedemptionValues({
          componentAddress: TEST_CONFIG.randomStringComponentAddress,
          nftIds: TEST_CONFIG.validNftIds,
          stateVersion: TEST_CONFIG.validStateVersion,
        })
      ).rejects.toThrow(ComponentError);
    });

    test("should handle real non-C9 component address", async () => {
      await expect(
        getRedemptionValues({
          componentAddress: TEST_CONFIG.realNonC9ComponentAddress,
          nftIds: TEST_CONFIG.validNftIds,
          stateVersion: TEST_CONFIG.validStateVersion,
        })
      ).rejects.toThrow(ComponentError);
    });

    test("should handle one invalid NFT ID in batch", async () => {
      const result = await getRedemptionValues({
        componentAddress: TEST_CONFIG.validComponentAddress,
        nftIds: TEST_CONFIG.mixedNftIds.oneInvalid,
        stateVersion: TEST_CONFIG.validStateVersion,
      });

      console.log("\nOne invalid NFT ID in batch result:", result);
      expect(result).toBeDefined();
      expect(Object.keys(result).length).toBeLessThan(
        TEST_CONFIG.mixedNftIds.oneInvalid.length
      );

      // Valid NFTs should still have results
      const validNftId = TEST_CONFIG.mixedNftIds.oneInvalid[0];
      expect(result[validNftId]).toBeDefined();
      expect(result[validNftId]).toHaveProperty("xToken");
      expect(result[validNftId]).toHaveProperty("yToken");
    });

    test("should handle all invalid NFT IDs", async () => {
      const result = await getRedemptionValues({
        componentAddress: TEST_CONFIG.validComponentAddress,
        nftIds: TEST_CONFIG.mixedNftIds.allInvalid,
        stateVersion: TEST_CONFIG.validStateVersion,
      });

      console.log("\nAll invalid NFT IDs result:", result);
      expect(result).toEqual({});
    });

    test("should handle early state version", async () => {
      await expect(
        getRedemptionValues({
          componentAddress: TEST_CONFIG.validComponentAddress,
          nftIds: TEST_CONFIG.validNftIds,
          stateVersion: TEST_CONFIG.earlyStateVersion,
        })
      ).rejects.toThrow(ComponentError);
    });

    test("should handle future state version", async () => {
      await expect(
        getRedemptionValues({
          componentAddress: TEST_CONFIG.validComponentAddress,
          nftIds: TEST_CONFIG.validNftIds,
          stateVersion: TEST_CONFIG.futureStateVersion,
        })
      ).rejects.toThrow(DataError);
    });
  });
});
