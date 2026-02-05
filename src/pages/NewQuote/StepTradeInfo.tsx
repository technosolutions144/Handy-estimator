import { AlertTriangle } from 'lucide-react';
import { REGION_PRESETS, DEFAULT_REGION, getTradeOptions } from '../../lib/constants';
import type { QuoteFormData } from '../../lib/types';
import TradeIcon from '../../components/TradeIcon';

interface Props {
  data: QuoteFormData;
  onChange: (updates: Partial<QuoteFormData>) => void;
  onNext: () => void;
}

export default function StepTradeInfo({ data, onChange, onNext }: Props) {
  const canProceed = data.trade_type && data.project_name.trim();
  const activeRegion = REGION_PRESETS.find((r) => r.name === data.region) ?? DEFAULT_REGION;
  const tradeOptions = getTradeOptions(activeRegion.id);

  const handleRegionChange = (regionId: string) => {
    const region = REGION_PRESETS.find((r) => r.id === regionId) ?? DEFAULT_REGION;
    const newTradeOptions = getTradeOptions(regionId);
    const currentTradeRate = newTradeOptions.find((t) => t.value === data.trade_type)?.defaultRate ?? 95;
    onChange({
      region: region.name,
      labor_rate: currentTradeRate,
      tax_rate: region.taxRate,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900">What type of work?</h2>
        <p className="text-sm text-gray-500 mt-1">Select your trade and give this project a name.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Region</label>
        <select
          value={activeRegion.id}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
        >
          {REGION_PRESETS.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <p className="text-[11px] text-gray-400 mt-1">
          Tax: {activeRegion.taxRate}% -- Min visit: ${activeRegion.minimumVisitRate} -- Min billable: {activeRegion.minimumBillableHours}h -- Emergency: {activeRegion.emergencyMultiplier}x
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {tradeOptions.map((trade) => (
          <button
            key={trade.value}
            type="button"
            onClick={() => {
              onChange({
                trade_type: trade.value,
                labor_rate: trade.defaultRate,
              });
            }}
            className={`
              relative p-4 rounded-xl border-2 text-center transition-all duration-200
              ${
                data.trade_type === trade.value
                  ? 'border-blue-700 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            <TradeIcon
              trade={trade.value}
              className={`w-6 h-6 mx-auto mb-2 ${
                data.trade_type === trade.value ? 'text-blue-700' : 'text-gray-400'
              }`}
            />
            <span
              className={`text-sm font-medium ${
                data.trade_type === trade.value ? 'text-blue-700' : 'text-gray-700'
              }`}
            >
              {trade.label}
            </span>
            <span className="block text-[11px] text-gray-400 mt-0.5">${trade.defaultRate}/hr</span>
          </button>
        ))}
      </div>

      <div
        onClick={() => onChange({ is_emergency: !data.is_emergency })}
        className={`
          flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
          ${data.is_emergency
            ? 'border-amber-500 bg-amber-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
          }
        `}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          data.is_emergency ? 'bg-amber-100' : 'bg-gray-100'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${data.is_emergency ? 'text-amber-600' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${data.is_emergency ? 'text-amber-800' : 'text-gray-700'}`}>
            Emergency / Urgent Call
          </p>
          <p className="text-xs text-gray-500">
            Applies a {activeRegion.emergencyMultiplier}x multiplier to labor costs
          </p>
        </div>
        <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
          data.is_emergency ? 'bg-amber-500' : 'bg-gray-300'
        }`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mt-0.5 ${
            data.is_emergency ? 'translate-x-5.5 ml-[1px]' : 'translate-x-0.5'
          }`} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Name</label>
          <input
            type="text"
            value={data.project_name}
            onChange={(e) => onChange({ project_name: e.target.value })}
            placeholder="e.g. Kitchen backsplash for Tremblay"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Custom Region (optional)</label>
          <input
            type="text"
            value={data.region}
            onChange={(e) => onChange({ region: e.target.value })}
            placeholder="e.g. Montreal, QC"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer Type</label>
          <div className="flex gap-3">
            {(['residential', 'commercial'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ customer_type: type })}
                className={`
                  flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all capitalize
                  ${
                    data.customer_type === type
                      ? 'border-blue-700 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Quality Level</label>
          <div className="flex gap-3">
            {(['economy', 'standard', 'premium'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange({ quality_level: level })}
                className={`
                  flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all capitalize
                  ${
                    data.quality_level === level
                      ? 'border-blue-700 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Client Details (optional)</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="text"
            value={data.client_name}
            onChange={(e) => onChange({ client_name: e.target.value })}
            placeholder="Client name"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
          />
          <input
            type="email"
            value={data.client_email}
            onChange={(e) => onChange({ client_email: e.target.value })}
            placeholder="Client email"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
          />
          <input
            type="tel"
            value={data.client_phone}
            onChange={(e) => onChange({ client_phone: e.target.value })}
            placeholder="Client phone"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
          />
          <input
            type="text"
            value={data.client_address}
            onChange={(e) => onChange({ client_address: e.target.value })}
            placeholder="Job site address"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-blue-900 text-white text-sm font-semibold rounded-lg hover:from-blue-800 hover:to-blue-950 transition-all shadow-lg shadow-blue-700/25 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
