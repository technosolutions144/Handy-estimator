import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HardHat, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import type { Quote, QuoteLineItem } from '../lib/types';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatDate } from '../lib/formatters';
import { TRADE_OPTIONS } from '../lib/constants';
import TradeIcon from '../components/TradeIcon';

export default function ShareQuote() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadQuote();
  }, [id]);

  const loadQuote = async () => {
    const { data } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (data) {
      setQuote(data);
      const { data: items } = await supabase
        .from('quote_line_items')
        .select('*')
        .eq('quote_id', id)
        .order('created_at');
      setLineItems(items ?? []);
    }
    setLoading(false);
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HardHat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">Quote not found</h2>
          <p className="text-sm text-gray-500 mt-1">This quote may have been removed or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const trade = TRADE_OPTIONS.find((t) => t.value === quote.trade_type);
  const laborTotal = quote.labor_hours * quote.labor_rate;
  const lineItemsTotal = lineItems.reduce((sum, li) => sum + li.quantity * li.unit_price, 0);

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 print:px-0 print:py-0">
        <div className="print:hidden mb-4 flex justify-end">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-700 text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition-colors"
          >
            Print / Save as PDF
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:rounded-none overflow-hidden">
          <div className="bg-gray-900 text-white p-8 print:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">QuoteCraft</h1>
                  <p className="text-xs text-gray-400">Professional Quote</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Quote Date</p>
                <p className="text-sm font-medium flex items-center gap-1.5 justify-end">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(quote.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 print:p-6 space-y-8">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TradeIcon trade={quote.trade_type} className="w-5 h-5 text-teal-700" />
                  <h2 className="text-xl font-bold text-gray-900">{quote.project_name}</h2>
                </div>
                <p className="text-sm text-gray-500 capitalize">
                  {trade?.label} -- {quote.quality_level} quality -- {quote.customer_type}
                </p>
                {quote.region && (
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {quote.region}
                  </p>
                )}
              </div>

              {(quote.client_name || quote.client_email || quote.client_phone) && (
                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1.5 min-w-[200px]">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Client</p>
                  {quote.client_name && (
                    <p className="flex items-center gap-2 text-gray-700">
                      <User className="w-3.5 h-3.5 text-gray-400" /> {quote.client_name}
                    </p>
                  )}
                  {quote.client_email && (
                    <p className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-3.5 h-3.5 text-gray-400" /> {quote.client_email}
                    </p>
                  )}
                  {quote.client_phone && (
                    <p className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {quote.client_phone}
                    </p>
                  )}
                  {quote.client_address && (
                    <p className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {quote.client_address}
                    </p>
                  )}
                </div>
              )}
            </div>

            {lineItems.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Items</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b-2 border-gray-200">
                      <th className="pb-2 font-semibold text-gray-600">Description</th>
                      <th className="pb-2 font-semibold text-gray-600 text-right">Qty</th>
                      <th className="pb-2 font-semibold text-gray-600 text-right">Rate</th>
                      <th className="pb-2 font-semibold text-gray-600 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 text-gray-800">{item.description || '--'}</td>
                        <td className="py-2.5 text-right text-gray-600">{item.quantity} {item.unit}</td>
                        <td className="py-2.5 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                        <td className="py-2.5 text-right font-medium text-gray-900">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t-2 border-gray-200 pt-6">
              <div className="max-w-xs ml-auto space-y-2 text-sm">
                {laborTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Labor</span>
                    <span className="font-medium">{formatCurrency(laborTotal)}</span>
                  </div>
                )}
                {lineItemsTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Materials & Items</span>
                    <span className="font-medium">{formatCurrency(lineItemsTotal)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(quote.final_price)}</span>
                  </div>
                </div>
              </div>
            </div>

            {quote.notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}

            <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
              Generated with QuoteCraft -- Professional contractor quoting
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
