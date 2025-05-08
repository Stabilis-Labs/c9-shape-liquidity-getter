/**
 * Input parameters for calculating redemption value of a single NFT
 */
export interface RedemptionValueInput {
  componentAddress: string;
  nftId: string;
  stateVersion: number;
  priceBounds?: [number, number]; // [lowerPrice, upperPrice]
}

/**
 * Input parameters for calculating redemption values of multiple NFTs
 */
export interface RedemptionValuesInput {
  componentAddress: string;
  nftIds: string[];
  stateVersion: number;
  priceBounds?: [number, number]; // [lowerPrice, upperPrice]
}

/**
 * Output structure for redemption value calculation
 */
export interface RedemptionValueOutput {
  xToken: string;
  yToken: string;
}

/**
 * Output structure for multiple redemption value calculations
 */
export interface RedemptionValuesOutput {
  [nftId: string]: RedemptionValueOutput;
}
