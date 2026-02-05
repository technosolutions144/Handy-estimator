import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Trash2,
  CheckCircle2,
  Send,
  XCircle,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  ShieldCheck,
  Copy,
} from 'lucide-react';
import type { Quote, QuoteLineItem } from '../lib/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { formatCurrency, formatDateTime } from '../lib/formatters';
import { STATUS_LABELS, TRADE_OPTIONS } from '../lib/constants';
import TradeIcon from '../components/TradeIcon';
import WarningBanner from '../components/WarningBanner';
import { getPriceWarning, getPriceTier, calculatePricing } from '../lib/estimator';

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadQuote();
  }, [id]);

  const loadQuote = async () => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      navigate('/');
      return;
    }

    setQuote(data);

    const { data: items } = await supabase
      .from('quote_line_items')
      .select('*')
      .eq('quote_id', id)
      .order('created_at');

    setLineItems(items ?? []);
    setLoading(false);
  };

  const updateStatus = async (status: string) => {
    if (!quote) return;
    await supabase.from('quotes').update({ status, updated_at: new Date().toISOString() }).eq('id', quote.id);
    setQuote({ ...quote, status: status as Quote['status'] });
  };

  const handleDelete = async () => {
    if (!quote) return;
    await supabase.from('quotes').delete().eq('id', quote.id);
    navigate('/');
  };

  const handleShare = () => {
    if (!quote) return;
    const url = `${window.location.origin}/share/${quote.id}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  const handleDuplicate = async () => {
    if (!quote || !user) return;
    setDuplicating(true);
    const { data: newQuote, error } = await supabase
      .from('quotes')
      .insert({
        user_id: user.id,
        project_name: `${quote.project_name} (copy)`,
        trade_type: quote.trade_type,
        client_name: quote.client_name,
        client_email: quote.client_email,
        client_phone: quote.client_phone,
        client_address: quote.client_address,
        customer_type: quote.customer_type,
        quality_level: quote.quality_level,
        region: quote.region,
        is_emergency: quote.is_emergency,
        labor_hours: quote.labor_hours,
        labor_rate: quote.labor_rate,
        materials_cost: quote.materials_cost,
        transportation_cost: quote.transportation_cost,
        tax_rate: quote.tax_rate,
        admin_overhead_pct: quote.admin_overhead_pct,
        tool_wear_cost: quote.tool_wear_cost,
        profit_margin_pct: quote.profit_margin_pct,
        recommended_price: quote.recommended_price,
        minimum_price: quote.minimum_price,
        destructive_price: quote.destructive_price,
        final_price: quote.final_price,
        notes: quote.notes,
        status: 'draft',
      })
      .select('id')
      .maybeSingle();

    if (!error && newQuote) {
      if (lineItems.length > 0) {
        await supabase
          .from('quote_line_items')
          .insert(
            lineItems.map((item) => ({
              quote_id: newQuote.id,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unit_price: item.unit_price,
              category: item.category,
            }))
          );
      }
      navigate(`/quote/${newQuote.id}`);
    }
    setDuplicating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quote) return null;

  const trade = TRADE_OPTIONS.find((t) => t.value === quote.trade_type);
  const status = STATUS_LABELS[quote.status] ?? STATUS_LABELS.draft;

  const pricing = calculatePricing({
    project_name: quote.project_name,
    trade_type: quote.trade_type,
    client_name: quote.client_name,
    client_email: quote.client_email,
    client_phone: quote.client_phone,
    client_address: quote.client_address,
    customer_type: quote.customer_type,
    quality_level: quote.quality_level,
    region: quote.region,
    is_emergency: quote.is_emergency,
    labor_hours: quote.labor_hours,
    labor_rate: quote.labor_rate,
    materials_cost: quote.materials_cost,
    transportation_cost: quote.transportation_cost,
    tax_rate: quote.tax_rate,
    admin_overhead_pct: quote.admin_overhead_pct,
    tool_wear_cost: quote.tool_wear_cost,
    profit_margin_pct: quote.profit_margin_pct,
    notes: quote.notes,
    line_items: lineItems.map((li) => ({
      description: li.description,
      quantity: li.quantity,
      unit: li.unit,
      unit_price: li.unit_price,
      category: li.category,
    })),
  });

  const warning = getPriceWarning(quote.final_price, pricing);
  const tier = getPriceTier(quote.final_price, pricing);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quotes
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDuplicate}
            disabled={duplicating}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Copy className="w-4 h-4" />
            {duplicating ? 'Duplicating...' : 'Duplicate'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          {quote.status === 'draft' && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
                <TradeIcon trade={quote.trade_type} className="w-6 h-6 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{quote.project_name}</h1>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {trade?.label} -- {quote.quality_level} -- {quote.customer_type}
                </p>
                <p className="text-xs text-gray-400 mt-1">{formatDateTime(quote.created_at)}</p>
              </div>
            </div>

            {(quote.client_name || quote.client_email || quote.client_phone || quote.client_address) && (
              <div className="mt-5 pt-5 border-t border-gray-100 grid sm:grid-cols-2 gap-3 text-sm">
                {quote.client_name && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    {quote.client_name}
                  </div>
                )}
                {quote.client_email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {quote.client_email}
                  </div>
                )}
                {quote.client_phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {quote.client_phone}
                  </div>
                )}
                {quote.client_address && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {quote.client_address}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Cost Breakdown</h3>

            {(pricing.emergencyApplied || pricing.minimumHoursApplied || pricing.minimumVisitApplied) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {pricing.emergencyApplied && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 text-blue-700 text-[11px] font-medium">
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

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Labor ({pricing.effectiveLaborHours}h x {formatCurrency(quote.labor_rate)}/hr)
                  {pricing.emergencyApplied && <span className="text-amber-600 ml-1">x1.5</span>}
                </span>
                <span className="font-medium">{formatCurrency(pricing.baseLaborCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Materials</span>
                <span className="font-medium">{formatCurrency(pricing.materialsCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transportation</span>
                <span className="font-medium">{formatCurrency(pricing.transportationCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tool Wear</span>
                <span className="font-medium">{formatCurrency(pricing.toolWearCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Admin Overhead ({quote.admin_overhead_pct}%)</span>
                <span className="font-medium">{formatCurrency(pricing.adminOverhead)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({quote.tax_rate}%)</span>
                <span className="font-medium">{formatCurrency(pricing.taxAmount)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
                <span>Total Cost</span>
                <span>{formatCurrency(pricing.totalCost)}</span>
              </div>
            </div>
          </div>

          {lineItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Line Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 font-medium">Item</th>
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium text-right">Qty</th>
                      <th className="pb-3 font-medium text-right">Rate</th>
                      <th className="pb-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 text-gray-900">{item.description || '--'}</td>
                        <td className="py-3 capitalize text-gray-500">{item.category}</td>
                        <td className="py-3 text-right text-gray-600">{item.quantity} {item.unit}</td>
                        <td className="py-3 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                        <td className="py-3 text-right font-medium text-gray-900">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {quote.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-6 text-white">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Final Price</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(quote.final_price)}</p>
            {quote.final_price > 0 && pricing.totalCost > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Profit</span>
                  <span className="font-medium text-emerald-400">
                    {formatCurrency(quote.final_price - pricing.totalCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">Margin</span>
                  <span className="text-gray-300">
                    {((quote.final_price - pricing.totalCost) / pricing.totalCost * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Price Tiers</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Recommended
                </span>
                <span className="font-medium">{formatCurrency(quote.recommended_price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Minimum
                </span>
                <span className="font-medium">{formatCurrency(quote.minimum_price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> Destructive
                </span>
                <span className="font-medium">{formatCurrency(quote.destructive_price)}</span>
              </div>
            </div>
          </div>

          {warning && (
            <WarningBanner
              message={warning}
              severity={tier === 'below' || tier === 'destructive' ? 'danger' : 'warning'}
            />
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {quote.status !== 'sent' && (
                <button
                  onClick={() => updateStatus('sent')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Sent
                </button>
              )}
              {quote.status !== 'accepted' && (
                <button
                  onClick={() => updateStatus('accepted')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Accepted
                </button>
              )}
              {quote.status !== 'rejected' && (
                <button
                  onClick={() => updateStatus('rejected')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Rejected
                </button>
              )}
              {quote.status !== 'draft' && (
                <button
                  onClick={() => updateStatus('draft')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Draft
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
