import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';

type Tier = 'recommended' | 'minimum' | 'destructive';

interface PriceTierProps {
  tier: Tier;
  price: number;
  margin: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

const TIER_CONFIG: Record<Tier, {
  label: string;
  description: string;
  icon: typeof CheckCircle2;
  colors: string;
  borderColor: string;
  selectedBg: string;
  iconColor: string;
}> = {
  recommended: {
    label: 'Recommended',
    description: 'Healthy and fair -- protects your business and your trade.',
    icon: CheckCircle2,
    colors: 'border-emerald-200 bg-emerald-50/50',
    borderColor: 'border-emerald-500',
    selectedBg: 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200',
    iconColor: 'text-emerald-600',
  },
  minimum: {
    label: 'Minimum Acceptable',
    description: 'Covers costs with a thin margin. One surprise expense eats your profit.',
    icon: AlertTriangle,
    colors: 'border-amber-200 bg-amber-50/50',
    borderColor: 'border-amber-500',
    selectedBg: 'bg-amber-50 border-amber-500 ring-2 ring-amber-200',
    iconColor: 'text-amber-600',
  },
  destructive: {
    label: 'Destructive',
    description: "You're practically working for free. Hurts you and the market.",
    icon: XCircle,
    colors: 'border-red-200 bg-red-50/50',
    borderColor: 'border-red-500',
    selectedBg: 'bg-red-50 border-red-500 ring-2 ring-red-200',
    iconColor: 'text-red-600',
  },
};

export default function PriceTier({ tier, price, margin, isSelected, onSelect }: PriceTierProps) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        w-full p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200
        ${isSelected ? config.selectedBg : config.colors}
        ${onSelect ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{config.label}</span>
            <span className="text-xs font-medium text-gray-500">{margin.toFixed(0)}% margin</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{formatCurrency(price)}</p>
          <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{config.description}</p>
        </div>
      </div>
    </button>
  );
}
<PriceTier tier="recommended" price={tiers.recommended} margin={35} />
<PriceTier tier="minimum" price={tiers.minimum} margin={15} />
<PriceTier tier="destructive" price={tiers.destructive} margin={5} />
