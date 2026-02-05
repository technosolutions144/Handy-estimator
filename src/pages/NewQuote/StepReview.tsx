import { useState } from 'react';
import { DollarSign, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
import type { QuoteFormData, PricingResult } from '../../lib/types';
import { formatCurrency } from '../../lib/formatters';
import { getPriceWarning, getPriceTier } from '../../lib/estimator';
import PriceTier from '../../components/PriceTier';
import WarningBanner from '../../components/WarningBanner';

interface Props {
  data: QuoteFormData;
  pricing: PricingResult;
  onBack: () => void;
  onSave: (finalPrice: number) => void;
  saving: boolean;
}

export default function StepReview({ data, pricing, onBack, onSave, saving }: Props) {
  const [selectedTier, setSelectedTier] = useState<'recommended' | 'minimum' | 'destructive'>('recommended');
  const [customPrice, setCustomPrice] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const tierPrices = {
    recommended: pricing.recommendedPrice,
    minimum: pricing.minimumPrice,
    destructive: pricing.destructivePrice,
  };

  const finalPrice = useCustom ? parseFloat(customPrice) || 0 : tierPrices[selectedTier];
  const warning = getPriceWarning(finalPrice, pricing);
  const tier = getPriceTier(finalPrice, pricing);
  const hasAppliedRules = pricing.emergencyApplied || pricing.minimumHoursApplied || pricing.minimumVisitApplied;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your Pricing</h2>
        <p className="text-sm text-gray-500 mt-1">
          Three clear levels. Pick what's right for this job -- but don't undercut yourself.
        </p>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="font-semibold text-gray-700">{data.project_name}</span>
          <span className="text-gray-500 capitalize">{data.trade_type} -- {data.quality_level}</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-gray-500 mb-1">Labor</p>
            <p className="font-bold text-gray-900">{formatCurrency(pricing.baseLaborCost)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-gray-500 mb-1">Materials</p>
            <p className="font-bold text-gray-900">{formatCurrency(pricing.materialsCost)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-gray-500 mb-1">Total Cost</p>
            <p className="font-bold text-gray-900">{formatCurrency(pricing.totalCost)}</p>
          </div>
        </div>

        {hasAppliedRules && (
          <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
            {pricing.emergencyApplied && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-[11px] font-medium">
                <AlertTriangle className="w-3 h-3" /> Emergency 1.5x
              </span>
            )}
            {pricing.minimumHoursApplied && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-[11px] font-medium">
                <Clock className="w-3 h-3" /> Min {pricing.effectiveLaborHours}h billed
              </span>
            )}
            {pricing.minimumVisitApplied && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-teal-100 text-teal-700 text-[11px] font-medium">
                <ShieldCheck className="w-3 h-3" /> Min visit {formatCurrency(pricing.minimumVisitRate)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <PriceTier
          tier="recommended"
          price={pricing.recommendedPrice}
          margin={pricing.recommendedMargin}
          isSelected={!useCustom && selectedTier === 'recommended'}
          onSelect={() => { setSelectedTier('recommended'); setUseCustom(false); }}
        />
        <PriceTier
          tier="minimum"
          price={pricing.minimumPrice}
          margin={pricing.minimumMargin}
          isSelected={!useCustom && selectedTier === 'minimum'}
          onSelect={() => { setSelectedTier('minimum'); setUseCustom(false); }}
        />
        <PriceTier
          tier="destructive"
          price={pricing.destructivePrice}
          margin={3}
          isSelected={!useCustom && selectedTier === 'destructive'}
          onSelect={() => { setSelectedTier('destructive'); setUseCustom(false); }}
        />
      </div>

      <div
        className={`rounded-xl border-2 p-4 transition-all ${
          useCustom ? 'border-blue-700 bg-blue-50/30 ring-2 ring-blue-200' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-900">Custom Price</label>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customPrice}
                onChange={(e) => { setCustomPrice(e.target.value); setUseCustom(true); }}
                onFocus={() => setUseCustom(true)}
                placeholder="Enter your price"
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
              />
            </div>
          </div>
        </div>
      </div>

      {warning && (
        <WarningBanner
          message={warning}
          severity={tier === 'below' || tier === 'destructive' ? 'danger' : 'warning'}
        />
      )}

      <div className="bg-gray-900 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Final Quote Price</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(finalPrice)}</p>
          </div>
          {finalPrice > 0 && pricing.totalCost > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Your Profit</p>
              <p className="text-lg font-bold text-emerald-400">
                {formatCurrency(finalPrice - pricing.totalCost)}
              </p>
              <p className="text-xs text-gray-400">
                {((finalPrice - pricing.totalCost) / pricing.totalCost * 100).toFixed(1)}% margin
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onSave(finalPrice)}
          disabled={saving || finalPrice <= 0}
          className="px-8 py-2.5 bg-gradient-to-r from-blue-700 to-blue-900 text-white text-sm font-semibold rounded-lg hover:from-blue-800 hover:to-blue-950 transition-all shadow-lg shadow-blue-700/25 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Quote'}
        </button>
      </div>
    </div>
  );
}
