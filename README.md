# Concentrated Liquidity Calculator

A TypeScript library for calculating redemption values of concentrated liquidity positions on the Radix network.

## Features

- Calculate redemption values (X and Y tokens) for a single NFT position
- Batch calculate redemption values for multiple NFT positions
- Precise decimal calculations using decimal.js
- Full TypeScript support
- Enterprise-grade error handling and logging

## Installation

```bash
npm install @stabilis/conc-liq-calculator
```

## Usage

### Single NFT Position

```typescript
import { getRedemptionValue } from "@stabilis/conc-liq-calculator";

async function example() {
  const input = {
    componentAddress: "component_rdx1...", // Your component address
    nftId: "{your-nft-id}", // Your NFT ID
    stateVersion: 12345678, // Optional: specific state version
  };

  const result = await getRedemptionValue(input);
  if (result) {
    console.log("X Token Amount:", result.xToken);
    console.log("Y Token Amount:", result.yToken);
  }
}
```

### Multiple NFT Positions

```typescript
import { getRedemptionValues } from "@stabilis/conc-liq-calculator";

async function example() {
  const input = {
    componentAddress: "component_rdx1...", // Your component address
    nftIds: [
      // Array of NFT IDs
      "{first-nft-id}",
      "{second-nft-id}",
      "{third-nft-id}",
    ],
    stateVersion: 12345678, // Optional: specific state version
  };

  const results = await getRedemptionValues(input);

  // Results are mapped by NFT ID
  Object.entries(results).forEach(([nftId, values]) => {
    console.log(`NFT ${nftId}:`);
    console.log("  X Token Amount:", values.xToken);
    console.log("  Y Token Amount:", values.yToken);
  });
}
```

## API Reference

### Types

```typescript
interface RedemptionValueInput {
  componentAddress: string;
  nftId: string;
  stateVersion?: number;
}

interface RedemptionValuesInput {
  componentAddress: string;
  nftIds: string[];
  stateVersion?: number;
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

# Run linter
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
