import { ArrowRight, Calendar, MapPin, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Quote } from '../lib/types';
import { formatCurrency, formatDate } from '../lib/formatters';
import { STATUS_LABELS, TRADE_OPTIONS } from '../lib/constants';
import TradeIcon from './TradeIcon';

interface QuoteCardProps {
  quote: Quote;
}

export default function QuoteCard({ quote }: QuoteCardProps) {
  const status = STATUS_LABELS[quote.status] ?? STATUS_LABELS.draft;
  const trade = TRADE_OPTIONS.find((t) => t.value === quote.trade_type);

  return (
    <Link
      to={`/quote/${quote.id}`}
      className="group block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0 group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
              <TradeIcon trade={quote.trade_type} className="w-5 h-5 text-blue-700" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                {quote.project_name || 'Untitled Project'}
              </h3>
              <p className="text-sm text-gray-500">{trade?.label ?? 'General'}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {quote.client_name && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate">{quote.client_name}</span>
            </div>
          )}
          {quote.region && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate">{quote.region}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatDate(quote.created_at)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {quote.final_price > 0 ? 'Final Price' : 'Recommended'}
            </p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(quote.final_price > 0 ? quote.final_price : quote.recommended_price)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-blue-700 group-hover:to-blue-900 flex items-center justify-center transition-all">
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
