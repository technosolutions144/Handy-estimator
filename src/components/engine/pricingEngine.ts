export interface PricingInput {
  laborCost: number;
  materialCost: number;
  overheadPct: number;
}

export type Tier = 'recommended' | 'minimum' | 'destructive';

export interface TierPrices {
  destructive: number;
  minimum: number;
  recommended: number;
}

export function calculateTierPrices(input: PricingInput): TierPrices {
  const overheadCost = input.laborCost * input.overheadPct;

  const baseCost =
    input.laborCost +
    input.materialCost +
    overheadCost;

  return {
    destructive: baseCost * 1.05,
    minimum: baseCost * 1.15,
    recommended: baseCost * 1.35,
  };
}
