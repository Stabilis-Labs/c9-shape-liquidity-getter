# C9 Shape Liquidity Getter

A TypeScript library for calculating redemption values of CaviarNine concentrated/shape liquidity positions on the Radix network.

## Features

- Calculate redemption values (X and Y tokens) for a single NFT position
- Determine whether shape liquidity includes liquidity in the active bin
- Batch calculate redemption values for multiple NFT positions
- Optional price bounds to calculate redemption values within specific price ranges relative to current price
- Precise decimal calculations that exactly match Scrypto's on-chain behavior

## Installation

```bash
npm install @stabilis/c9-shape-liquidity-getter
```

## Usage

Without price bounds (see bottom for what those are):

```typescript
import {
  getRedemptionValue,
  getRedemptionValues,
} from "@stabilis/c9-shape-liquidity-getter";

// Get redemption value for a single NFT
const result = await getRedemptionValue({
  componentAddress: "component_rdx1...", // C9 pool component address
  nftId: "{...}", // NFT ID
  stateVersion: 123456789, // Required: State version to query
});

console.log("X Token Amount:", result.xToken);
console.log("Y Token Amount:", result.yToken);
console.log("Liquidity in active bin:", result.isActive);

// Get redemption values for multiple NFTs
const results = await getRedemptionValues({
  componentAddress: "component_rdx1...",
  nftIds: ["{...}", "{...}"],
  stateVersion: 123456789,
});

for (const [nftId, value] of Object.entries(results)) {
  console.log(`NFT ${nftId}:`);
  console.log("X Token Amount:", value.xToken);
  console.log("Y Token Amount:", value.yToken);
  console.log("Liquidity in active bin:", value.isActive);
}
```

## Error Handling

The library throws specific error types:

- `ValidationError`: For invalid input parameters
- `ComponentError`: For issues with the C9 component
- `NFTError`: For Shape Liq NFT-related issues
- `DataError`: For data format issues
- `NetworkError`: For API request failures

## API Reference

### Types

```typescript
interface RedemptionValueInput {
  componentAddress: string;
  nftId: string;
  stateVersion: number; // Required: State version to query
  priceBounds?: [number, number]; // Optional: [lowerMultiplier, upperMultiplier]
  middlePrice?: number; // Optional: Override current price for calculations
}

interface RedemptionValuesInput {
  componentAddress: string;
  nftIds: string[];
  stateVersion: number; // Required: State version to query
  priceBounds?: [number, number]; // Optional: [lowerMultiplier, upperMultiplier]
  middlePrice?: number; // Optional: Override current price for calculations
}

interface RedemptionValueOutput {
  xToken: string;
  yToken: string;
  isActive: boolean; // Indicates if the redemption includes liquidity from the active bin
}

interface RedemptionValuesOutput {
  [nftId: string]: RedemptionValueOutput;
}
```

### Functions

#### getRedemptionValue

```typescript
function getRedemptionValue(
  input: RedemptionValueInput
): Promise<RedemptionValueOutput | null>;
```

Calculates the redemption value for a single NFT position. Returns null if the calculation fails.

#### getRedemptionValues

```typescript
function getRedemptionValues(
  input: RedemptionValuesInput
): Promise<RedemptionValuesOutput>;
```

Calculates redemption values for multiple NFT positions. Returns an object mapping NFT IDs to their redemption values.

## Precision Handling

This library implements a specialized I192 decimal type to match the precision behavior of Scrypto's Decimal type, which is used in the CaviarNine smart contracts. Key features include:

1. **Fixed 18 Decimal Places**: All values are represented with exactly 18 decimal places without rounding.

2. **Truncation Rounding**: After each mathematical operation, the result is truncated toward zero to exactly 18 decimal places. This means:
   - For positive numbers: digits beyond 18 decimal places are truncated (floor)
   - For negative numbers: digits beyond 18 decimal places are truncated (ceiling)

3. **Exact Match**: This approach ensures the library's calculations exactly match the results produced by the on-chain smart contracts. The library uses an enhanced precision model (40 digits) internally to ensure that even complex calculations maintain exact precision.

4. **Value Range**: The I192 type enforces the same value range constraints as Scrypto's Decimal:
   - Max: 3138550867693340381917894711603833208051.177722232017256447
   - Min: -3138550867693340381917894711603833208051.177722232017256448

5. **Precise String Representation**: All output values from the library (xToken and yToken) are provided as strings with exactly 18 decimal places, preserving the exact precision without any rounding. This ensures redemption values match exactly what the on-chain contract would calculate.

When comparing values, keep in mind that the entire 18 decimal places are significant and preserved exactly as calculated on-chain.

## Price Bounds

The library supports calculating redemption values within specific price ranges using the optional `priceBounds` parameter. When provided, the library will:

1. Calculate the current price by:
   - Using the provided `middlePrice` if specified
   - Otherwise, calculating from the current tick + half bin span (this is approximately the current price of the pair according to the shape liquidity pool)
2. Apply the price bound multipliers to get the actual price range:
   - Lower bound = current price \* priceBounds[0]
   - Upper bound = current price \* priceBounds[1]
3. Convert the price bounds to ticks
4. Only include liquidity from bins that fall within the price bounds
5. For bins that partially overlap with the price bounds, calculate the fraction of liquidity to include based on the bin span

Example:

```typescript
// Calculate redemption values for prices between 95% and 105% of current price
const result = await getRedemptionValue({
  componentAddress: "component_rdx1...",
  nftId: "{...}",
  stateVersion: 123456789,
  priceBounds: [0.95, 1.05],
});

// Calculate redemption values for prices between 95% and 105% of a specific price
const result = await getRedemptionValue({
  componentAddress: "component_rdx1...",
  nftId: "{...}",
  stateVersion: 123456789,
  priceBounds: [0.95, 1.05],
  middlePrice: 1.0,
});
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.