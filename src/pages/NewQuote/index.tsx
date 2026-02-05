import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuoteFormData, Profile } from '../../lib/types';
import { DEFAULT_ADMIN_OVERHEAD, DEFAULT_PROFIT_MARGIN, getTradeOptions, REGION_PRESETS, DEFAULT_REGION } from '../../lib/constants';
import { calculatePricing } from '../../lib/estimator';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import StepIndicator from '../../components/StepIndicator';
import StepTradeInfo from './StepTradeInfo';
import StepJobDetails from './StepJobDetails';
import StepCosts from './StepCosts';
import StepReview from './StepReview';

const STEPS = [
  { label: 'Trade & Info', shortLabel: 'Trade' },
  { label: 'Job Details', shortLabel: 'Details' },
  { label: 'Costs', shortLabel: 'Costs' },
  { label: 'Pricing', shortLabel: 'Price' },
];

function buildInitialData(profile: Profile | null): QuoteFormData {
  const trade = profile?.default_trade ?? 'general';
  const regionName = profile?.default_region ?? DEFAULT_REGION.name;
  const region = REGION_PRESETS.find((r) => r.name === regionName) ?? DEFAULT_REGION;
  const tradeOptions = getTradeOptions(region.id);
  const rate = tradeOptions.find((t) => t.value === trade)?.defaultRate ?? 95;

  return {
    project_name: '',
    trade_type: trade,
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    customer_type: profile?.default_customer_type ?? 'residential',
    quality_level: profile?.default_quality_level ?? 'standard',
    region: regionName,
    is_emergency: profile?.default_is_emergency ?? false,
    labor_hours: 0,
    labor_rate: rate,
    materials_cost: 0,
    transportation_cost: 0,
    tax_rate: region.taxRate,
    admin_overhead_pct: profile?.default_admin_overhead_pct ?? DEFAULT_ADMIN_OVERHEAD,
    tool_wear_cost: 0,
    profit_margin_pct: profile?.default_profit_margin_pct ?? DEFAULT_PROFIT_MARGIN,
    notes: '',
    line_items: [],
  };
}

export default function NewQuote() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuoteFormData>(() => buildInitialData(profile));
  const [saving, setSaving] = useState(false);

  const handleChange = (updates: Partial<QuoteFormData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const pricing = calculatePricing(data);

  const handleSave = async (finalPrice: number) => {
    setSaving(true);
    try {
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          user_id: user?.id,
          project_name: data.project_name,
          trade_type: data.trade_type,
          client_name: data.client_name,
          client_email: data.client_email,
          client_phone: data.client_phone,
          client_address: data.client_address,
          customer_type: data.customer_type,
          quality_level: data.quality_level,
          region: data.region,
          is_emergency: data.is_emergency,
          labor_hours: data.labor_hours,
          labor_rate: data.labor_rate,
          materials_cost: data.materials_cost,
          transportation_cost: data.transportation_cost,
          tax_rate: data.tax_rate,
          admin_overhead_pct: data.admin_overhead_pct,
          tool_wear_cost: data.tool_wear_cost,
          profit_margin_pct: data.profit_margin_pct,
          recommended_price: pricing.recommendedPrice,
          minimum_price: pricing.minimumPrice,
          destructive_price: pricing.destructivePrice,
          final_price: finalPrice,
          notes: data.notes,
          status: 'draft',
        })
        .select('id')
        .maybeSingle();

      if (error) throw error;
      if (!quote) throw new Error('Failed to create quote');

      if (data.line_items.length > 0) {
        const { error: lineError } = await supabase
          .from('quote_line_items')
          .insert(
            data.line_items.map((item) => ({
              quote_id: quote.id,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unit_price: item.unit_price,
              category: item.category,
            }))
          );
        if (lineError) throw lineError;
      }

      navigate(`/quote/${quote.id}`);
    } catch (err) {
      console.error('Failed to save quote:', err);
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      <div className="max-w-2xl mx-auto">
        {step === 0 && (
          <StepTradeInfo data={data} onChange={handleChange} onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <StepJobDetails data={data} onChange={handleChange} onNext={() => setStep(2)} onBack={() => setStep(0)} />
        )}
        {step === 2 && (
          <StepCosts data={data} onChange={handleChange} onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <StepReview data={data} pricing={pricing} onBack={() => setStep(2)} onSave={handleSave} saving={saving} />
        )}
      </div>
    </div>
  );
}
