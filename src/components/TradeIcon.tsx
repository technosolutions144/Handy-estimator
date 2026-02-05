import {
  Blocks,
  Pipette,
  Zap,
  Hammer,
  TreePine,
  Home,
  Paintbrush,
  Wind,
  Axe,
  Wrench,
} from 'lucide-react';
import type { TradeType } from '../lib/types';

const TRADE_ICONS: Record<TradeType, React.ComponentType<{ className?: string }>> = {
  masonry: Blocks,
  plumbing: Pipette,
  electrical: Zap,
  remodeling: Hammer,
  landscaping: TreePine,
  roofing: Home,
  painting: Paintbrush,
  hvac: Wind,
  carpentry: Axe,
  general: Wrench,
};

interface TradeIconProps {
  trade: TradeType;
  className?: string;
}

export default function TradeIcon({ trade, className }: TradeIconProps) {
  const Icon = TRADE_ICONS[trade] ?? Wrench;
  return <Icon className={className} />;
}
