import type { TradeType, RegionPreset } from './types';

export const REGION_PRESETS: RegionPreset[] = [
  {
    id: 'montreal',
    name: 'Montreal, QC',
    currency: 'CAD',
    taxRate: 14.975,
    minimumVisitRate: 140,
    emergencyMultiplier: 1.5,
    minimumBillableHours: 1.5,
    rates: {
      masonry: 95,
      plumbing: 135,
      electrical: 135,
      remodeling: 110,
      landscaping: 75,
      roofing: 105,
      painting: 80,
      hvac: 155,
      carpentry: 95,
      general: 95,
    },
  },
];

export const DEFAULT_REGION = REGION_PRESETS[0];

export function getTradeOptions(regionId?: string) {
  const region = REGION_PRESETS.find((r) => r.id === regionId) ?? DEFAULT_REGION;
  return TRADE_OPTION_META.map((t) => ({
    ...t,
    defaultRate: region.rates[t.value],
  }));
}

export const TRADE_OPTION_META: { value: TradeType; label: string; icon: string }[] = [
  { value: 'masonry', label: 'Masonry', icon: 'Blocks' },
  { value: 'plumbing', label: 'Plumbing', icon: 'Pipette' },
  { value: 'electrical', label: 'Electrical', icon: 'Zap' },
  { value: 'remodeling', label: 'Remodeling', icon: 'Hammer' },
  { value: 'landscaping', label: 'Landscaping', icon: 'TreePine' },
  { value: 'roofing', label: 'Roofing', icon: 'Home' },
  { value: 'painting', label: 'Painting', icon: 'Paintbrush' },
  { value: 'hvac', label: 'HVAC', icon: 'Wind' },
  { value: 'carpentry', label: 'Carpentry', icon: 'Axe' },
  { value: 'general', label: 'General', icon: 'Wrench' },
];

export const TRADE_OPTIONS = getTradeOptions();

export const QUALITY_MULTIPLIERS: Record<string, number> = {
  economy: 0.85,
  standard: 1.0,
  premium: 1.35,
};

export const CUSTOMER_MULTIPLIERS: Record<string, number> = {
  residential: 1.0,
  commercial: 1.15,
};

export const UNIT_OPTIONS = [
  'unit',
  'sq ft',
  'sq m',
  'sq yd',
  'linear ft',
  'hour',
  'day',
  'each',
  'lot',
  'gallon',
  'litre',
  'bag',
  'ton',
  'cubic yd',
];

export const DEFAULT_TAX_RATE = DEFAULT_REGION.taxRate;
export const DEFAULT_ADMIN_OVERHEAD = 10;
export const DEFAULT_PROFIT_MARGIN = 25;
export const DEFAULT_MINIMUM_VISIT_RATE = DEFAULT_REGION.minimumVisitRate;
export const DEFAULT_EMERGENCY_MULTIPLIER = DEFAULT_REGION.emergencyMultiplier;
export const DEFAULT_MINIMUM_BILLABLE_HOURS = DEFAULT_REGION.minimumBillableHours;

export const RECOMMENDED_MARGIN_MIN = 25;
export const MINIMUM_MARGIN = 12;
export const DESTRUCTIVE_MARGIN = 3;

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
};
