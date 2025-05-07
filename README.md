# C9 Shape Liquidity Getter

A TypeScript library for calculating redemption values of CaviarNine concentrated/shape liquidity positions on the Radix network.

## Features

- Calculate redemption values (X and Y tokens) for a single NFT position
- Batch calculate redemption values for multiple NFT positions
- Precise decimal calculations using decimal.js

## Installation

```bash
npm install @stabilis/c9-shape-liquidity-getter
```

## Usage

```typescript
import {
  getRedemptionValue,
  getRedemptionValues,
} from "@stabilis/c9-shape-liquidity-getter";

// Get redemption value for a single NFT
const result = await getRedemptionValue({
  componentAddress: "component_rdx1...", // C9 pool component address
  nftId: "{...}", // NFT ID
  stateVersion: 123456789,
});

console.log("X Token Amount:", result.xToken);
console.log("Y Token Amount:", result.yToken);

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
  stateVersion: number;
}

interface RedemptionValuesInput {
  componentAddress: string;
  nftIds: string[];
  stateVersion: number;
}

interface RedemptionValueOutput {
  xToken: string;
  yToken: string;
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
