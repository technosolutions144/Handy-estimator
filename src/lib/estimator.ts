import type { QuoteFormData, PricingResult } from './types';
import {
  QUALITY_MULTIPLIERS,
  CUSTOMER_MULTIPLIERS,
  RECOMMENDED_MARGIN_MIN,
  MINIMUM_MARGIN,
  DESTRUCTIVE_MARGIN,
  DEFAULT_MINIMUM_VISIT_RATE,
  DEFAULT_EMERGENCY_MULTIPLIER,
  DEFAULT_MINIMUM_BILLABLE_HOURS,
} from './constants';

export function calculatePricing(data: QuoteFormData): PricingResult {
  const qualityMult = QUALITY_MULTIPLIERS[data.quality_level] ?? 1;
  const customerMult = CUSTOMER_MULTIPLIERS[data.customer_type] ?? 1;

  const minimumHoursApplied = data.labor_hours > 0 && data.labor_hours < DEFAULT_MINIMUM_BILLABLE_HOURS;
  const effectiveLaborHours = data.labor_hours > 0
    ? Math.max(data.labor_hours, DEFAULT_MINIMUM_BILLABLE_HOURS)
    : 0;

  let baseLaborCost = effectiveLaborHours * data.labor_rate * qualityMult * customerMult;

  const emergencyApplied = data.is_emergency;
  let emergencySurcharge = 0;
  if (emergencyApplied && baseLaborCost > 0) {
    emergencySurcharge = baseLaborCost * (DEFAULT_EMERGENCY_MULTIPLIER - 1);
    baseLaborCost = baseLaborCost * DEFAULT_EMERGENCY_MULTIPLIER;
  }

  const lineItemMaterials = data.line_items
    .filter((item) => item.category === 'materials')
    .reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const lineItemLabor = data.line_items
    .filter((item) => item.category === 'labor')
    .reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const lineItemOther = data.line_items
    .filter((item) => item.category === 'other')
    .reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const materialsCost = data.materials_cost + lineItemMaterials;
  const transportationCost = data.transportation_cost;
  const toolWearCost = data.tool_wear_cost;

  const directCosts = baseLaborCost + lineItemLabor + materialsCost + transportationCost + toolWearCost + lineItemOther;

  const adminOverhead = directCosts * (data.admin_overhead_pct / 100);
  const subtotal = directCosts + adminOverhead;
  const taxAmount = subtotal * (data.tax_rate / 100);
  let totalCost = subtotal + taxAmount;

  const minimumVisitApplied = totalCost > 0 && totalCost < DEFAULT_MINIMUM_VISIT_RATE;
  if (minimumVisitApplied) {
    totalCost = DEFAULT_MINIMUM_VISIT_RATE;
  }

  const effectiveMargin = Math.max(data.profit_margin_pct, RECOMMENDED_MARGIN_MIN);
  const recommendedPrice = totalCost * (1 + effectiveMargin / 100);
  const minimumPrice = totalCost * (1 + MINIMUM_MARGIN / 100);
  const destructivePrice = totalCost * (1 + DESTRUCTIVE_MARGIN / 100);

  return {
    baseLaborCost: baseLaborCost + lineItemLabor,
    materialsCost,
    transportationCost,
    toolWearCost,
    subtotal: directCosts,
    adminOverhead,
    taxAmount,
    totalCost,
    recommendedPrice: roundTo(recommendedPrice, 2),
    minimumPrice: roundTo(minimumPrice, 2),
    destructivePrice: roundTo(destructivePrice, 2),
    recommendedMargin: effectiveMargin,
    minimumMargin: MINIMUM_MARGIN,
    emergencyApplied,
    minimumVisitApplied,
    minimumHoursApplied,
    effectiveLaborHours,
    emergencySurcharge: roundTo(emergencySurcharge, 2),
    minimumVisitRate: DEFAULT_MINIMUM_VISIT_RATE,
  };
}

export function getPriceWarning(price: number, pricing: PricingResult): string | null {
  if (price < pricing.destructivePrice) {
    return "You're pricing below your total costs. This isn't just low -- you're literally paying to work. Don't give away your work.";
  }
  if (price < pricing.minimumPrice) {
    return "Pricing below this value not only affects your wallet, it also devalues the profession and puts negative pressure on the local market. Don't give away your work.";
  }
  if (price < pricing.recommendedPrice) {
    return "This price covers your costs but leaves a thin margin. One unexpected expense and your profit disappears. Raising your price a little here will protect you all month.";
  }
  return null;
}

export function getPriceTier(price: number, pricing: PricingResult): 'recommended' | 'minimum' | 'destructive' | 'below' {
  if (price >= pricing.recommendedPrice) return 'recommended';
  if (price >= pricing.minimumPrice) return 'minimum';
  if (price >= pricing.destructivePrice) return 'destructive';
  return 'below';
}

function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}
