import { Info, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
import type { QuoteFormData } from '../../lib/types';
import { DEFAULT_TAX_RATE, DEFAULT_ADMIN_OVERHEAD, DEFAULT_PROFIT_MARGIN } from '../../lib/constants';
import { formatCurrency } from '../../lib/formatters';
import { calculatePricing } from '../../lib/estimator';

interface Props {
  data: QuoteFormData;
  onChange: (updates: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepCosts({ data, onChange, onNext, onBack }: Props) {
  const pricing = calculatePricing(data);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Costs & Overhead</h2>
        <p className="text-sm text-gray-500 mt-1">Account for all the real costs of doing business.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Materials Cost ($)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={data.materials_cost || ''}
            onChange={(e) => onChange({ materials_cost: parseFloat(e.target.value) || 0 })}
            placeholder="Total materials not in line items"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
          />
          <p className="text-[11px] text-gray-400 mt-1">Additional materials not listed as line items</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Transportation ($)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={data.transportation_cost || ''}
            onChange={(e) => onChange({ transportation_cost: parseFloat(e.target.value) || 0 })}
            placeholder="e.g. 50"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tool Wear & Tear ($)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={data.tool_wear_cost || ''}
            onChange={(e) => onChange({ tool_wear_cost: parseFloat(e.target.value) || 0 })}
            placeholder="e.g. 25"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax Rate (%)</label>
          <input
            type="number"
            min="0"
            max="30"
            step="0.1"
            value={data.tax_rate || ''}
            onChange={(e) => onChange({ tax_rate: parseFloat(e.target.value) || 0 })}
            placeholder={`Default: ${DEFAULT_TAX_RATE}%`}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Overhead (%)</label>
          <input
            type="number"
            min="0"
            max="50"
            step="1"
            value={data.admin_overhead_pct || ''}
            onChange={(e) => onChange({ admin_overhead_pct: parseFloat(e.target.value) || 0 })}
            placeholder={`Default: ${DEFAULT_ADMIN_OVERHEAD}%`}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
          />
          <p className="text-[11px] text-gray-400 mt-1">Insurance, licensing, bookkeeping, etc.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Profit Margin (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={data.profit_margin_pct || ''}
            onChange={(e) => onChange({ profit_margin_pct: parseFloat(e.target.value) || 0 })}
            placeholder={`Default: ${DEFAULT_PROFIT_MARGIN}%`}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
          />
        </div>
      </div>

      {(pricing.emergencyApplied || pricing.minimumHoursApplied || pricing.minimumVisitApplied) && (
        <div className="space-y-2">
          {pricing.emergencyApplied && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Emergency 1.5x multiplier active -- surcharge: {formatCurrency(pricing.emergencySurcharge)}</span>
            </div>
          )}
          {pricing.minimumHoursApplied && (
            <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Minimum billable hours applied: charging for {pricing.effectiveLaborHours}h instead of {data.labor_hours}h</span>
            </div>
          )}
          {pricing.minimumVisitApplied && (
            <div className="flex items-center gap-2 text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Minimum visit rate applied: {formatCurrency(pricing.minimumVisitRate)}</span>
            </div>
          )}
        </div>
      )}

      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Live Cost Preview</h3>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>
              Labor ({pricing.effectiveLaborHours}h x {formatCurrency(data.labor_rate)}/hr)
              {pricing.emergencyApplied && <span className="text-amber-600 ml-1">x1.5</span>}
            </span>
            <span className="font-medium">{formatCurrency(pricing.baseLaborCost)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Materials</span>
            <span className="font-medium">{formatCurrency(pricing.materialsCost)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Transportation</span>
            <span className="font-medium">{formatCurrency(pricing.transportationCost)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tool Wear</span>
            <span className="font-medium">{formatCurrency(pricing.toolWearCost)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Admin Overhead</span>
            <span className="font-medium">{formatCurrency(pricing.adminOverhead)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax ({data.tax_rate}%)</span>
            <span className="font-medium">{formatCurrency(pricing.taxAmount)}</span>
          </div>
          <div className="border-t border-slate-300 pt-2 mt-2 flex justify-between font-semibold text-gray-900">
            <span>
              Total Cost (before profit)
              {pricing.minimumVisitApplied && <span className="text-teal-600 text-xs font-normal ml-1">(min visit applied)</span>}
            </span>
            <span>{formatCurrency(pricing.totalCost)}</span>
          </div>
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
          onClick={onNext}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-blue-900 text-white text-sm font-semibold rounded-lg hover:from-blue-800 hover:to-blue-950 transition-all shadow-lg shadow-blue-700/25"
        >
          See Pricing
        </button>
      </div>
    </div>
  );
}
