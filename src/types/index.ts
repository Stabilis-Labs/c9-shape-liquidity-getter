/**
 * Input parameters for calculating redemption value of a single NFT
 */
export interface RedemptionValueInput {
  componentAddress: string;
  nftId: string;
  stateVersion: number;
}

/**
 * Input parameters for calculating redemption values of multiple NFTs
 */
export interface RedemptionValuesInput {
  componentAddress: string;
  nftIds: string[];
  stateVersion: number;
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
