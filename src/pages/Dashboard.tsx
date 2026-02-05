import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, DollarSign, Clock, ArrowUpRight } from 'lucide-react';
import type { Quote } from '../lib/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { formatCurrency } from '../lib/formatters';
import QuoteCard from '../components/QuoteCard';

export default function Dashboard() {
  const { profile } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setQuotes(data);
    }
    setLoading(false);
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const companyName = profile?.company_name;

  const totalQuoted = quotes.reduce((sum, q) => sum + q.final_price, 0);
  const acceptedRevenue = quotes
    .filter((q) => q.status === 'accepted')
    .reduce((sum, q) => sum + q.final_price, 0);
  const pendingQuotes = quotes.filter((q) => q.status === 'draft' || q.status === 'sent').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {firstName}
          </h1>
          {companyName && (
            <p className="text-gray-600 mt-1">{companyName}</p>
          )}
        </div>
        <Link
          to="/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold rounded-xl hover:from-blue-800 hover:to-blue-950 transition-all shadow-lg shadow-blue-700/25"
        >
          <Plus className="w-5 h-5" />
          New Quote
        </Link>
      </div>

      {quotes.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{quotes.length}</p>
            <p className="text-sm text-gray-600">Quotes Created</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Revenue</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(acceptedRevenue)}</p>
            <p className="text-sm text-gray-600">Won Business</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-700" />
              </div>
              <span className="text-sm font-medium text-gray-500">Active</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{pendingQuotes}</p>
            <p className="text-sm text-gray-600">Pending Quotes</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Quotes</h2>
            <p className="text-sm text-gray-600 mt-1">Your 5 most recent estimates</p>
          </div>
          {quotes.length > 0 && (
            <Link
              to="/new"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
            >
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {quotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-blue-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your First Quote</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start building professional estimates in under 90 seconds
            </p>
            <Link
              to="/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold rounded-xl hover:from-blue-800 hover:to-blue-950 transition-all shadow-lg shadow-blue-700/25"
            >
              <Plus className="w-5 h-5" />
              Create Quote
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
