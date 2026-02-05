import { Plus, Trash2, Clock } from 'lucide-react';
import type { QuoteFormData, LineItemCategory } from '../../lib/types';
import { UNIT_OPTIONS, DEFAULT_MINIMUM_BILLABLE_HOURS } from '../../lib/constants';

interface Props {
  data: QuoteFormData;
  onChange: (updates: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepJobDetails({ data, onChange, onNext, onBack }: Props) {
  const addLineItem = () => {
    onChange({
      line_items: [
        ...data.line_items,
        { description: '', quantity: 1, unit: 'unit', unit_price: 0, category: 'materials' },
      ],
    });
  };

  const updateLineItem = (index: number, updates: Record<string, string | number>) => {
    const items = [...data.line_items];
    items[index] = { ...items[index], ...updates };
    onChange({ line_items: items });
  };

  const removeLineItem = (index: number) => {
    onChange({ line_items: data.line_items.filter((_, i) => i !== index) });
  };

  const canProceed = data.labor_hours > 0;
  const belowMinHours = data.labor_hours > 0 && data.labor_hours < DEFAULT_MINIMUM_BILLABLE_HOURS;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
        <p className="text-sm text-gray-500 mt-1">Estimate labor hours and add line items for materials or other costs.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Estimated Labor Hours</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={data.labor_hours || ''}
            onChange={(e) => onChange({ labor_hours: parseFloat(e.target.value) || 0 })}
            placeholder="e.g. 16"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
          />
          {belowMinHours && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-700 bg-blue-50 border border-amber-200 rounded-lg px-3 py-2">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                Minimum billable is {DEFAULT_MINIMUM_BILLABLE_HOURS}h. Your quote will be calculated at {DEFAULT_MINIMUM_BILLABLE_HOURS} hours.
              </span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Hourly Rate ($)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={data.labor_rate || ''}
            onChange={(e) => onChange({ labor_rate: parseFloat(e.target.value) || 0 })}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Line Items</h3>
          <button
            type="button"
            onClick={addLineItem}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </button>
        </div>

        {data.line_items.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-500">No line items yet. Add materials, labor, or other costs.</p>
            <button
              type="button"
              onClick={addLineItem}
              className="mt-3 text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              + Add first item
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.line_items.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, { description: e.target.value })}
                      placeholder="Description"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                    />
                    <select
                      value={item.category}
                      onChange={(e) => updateLineItem(index, { category: e.target.value as LineItemCategory })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                    >
                      <option value="materials">Materials</option>
                      <option value="labor">Labor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity || ''}
                      onChange={(e) => updateLineItem(index, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Unit</label>
                    <select
                      value={item.unit}
                      onChange={(e) => updateLineItem(index, { unit: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price || ''}
                      onChange={(e) => updateLineItem(index, { unit_price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
        <textarea
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={3}
          placeholder="Any additional details about the job..."
          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow resize-none"
        />
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
          disabled={!canProceed}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-blue-900 text-white text-sm font-semibold rounded-lg hover:from-blue-800 hover:to-blue-950 transition-all shadow-lg shadow-blue-700/25 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
