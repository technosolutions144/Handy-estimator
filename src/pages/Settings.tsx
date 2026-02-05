import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { TRADE_OPTION_META, REGION_PRESETS } from '../lib/constants';
import type { TradeType, QualityLevel, CustomerType } from '../lib/types';

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [defaultTrade, setDefaultTrade] = useState<TradeType>('general');
  const [defaultRegion, setDefaultRegion] = useState('Montreal, QC');
  const [defaultQuality, setDefaultQuality] = useState<QualityLevel>('standard');
  const [defaultCustomerType, setDefaultCustomerType] = useState<CustomerType>('residential');
  const [defaultIsEmergency, setDefaultIsEmergency] = useState(false);
  const [defaultProfitMargin, setDefaultProfitMargin] = useState(25);
  const [defaultAdminOverhead, setDefaultAdminOverhead] = useState(10);

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setCompanyName(profile.company_name || '');
      setDefaultTrade(profile.default_trade);
      setDefaultRegion(profile.default_region);
      setDefaultQuality(profile.default_quality_level);
      setDefaultCustomerType(profile.default_customer_type);
      setDefaultIsEmergency(profile.default_is_emergency || false);
      setDefaultProfitMargin(profile.default_profit_margin_pct);
      setDefaultAdminOverhead(profile.default_admin_overhead_pct);
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSaved(false);
    setSaving(true);

    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        company_name: companyName.trim(),
        default_trade: defaultTrade,
        default_region: defaultRegion,
        default_quality_level: defaultQuality,
        default_customer_type: defaultCustomerType,
        default_is_emergency: defaultIsEmergency,
        default_profit_margin_pct: defaultProfitMargin,
        default_admin_overhead_pct: defaultAdminOverhead,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      await refreshProfile();
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);

    if (err) {
      setPasswordError(err.message);
    } else {
      setPasswordMessage('Password updated successfully.');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h1>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Profile</h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company or business name"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed here.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Default Preferences</h2>
          <p className="text-sm text-gray-500 mb-5">These will be pre-filled when you create a new quote.</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Trade</label>
              <select
                value={defaultTrade}
                onChange={(e) => setDefaultTrade(e.target.value as TradeType)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
              >
                {TRADE_OPTION_META.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Region</label>
              <select
                value={defaultRegion}
                onChange={(e) => setDefaultRegion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
              >
                {REGION_PRESETS.map((r) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Quality</label>
              <select
                value={defaultQuality}
                onChange={(e) => setDefaultQuality(e.target.value as QualityLevel)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
              >
                <option value="economy">Economy</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Customer Type</label>
              <select
                value={defaultCustomerType}
                onChange={(e) => setDefaultCustomerType(e.target.value as CustomerType)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Profit Margin (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={defaultProfitMargin}
                onChange={(e) => setDefaultProfitMargin(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Admin Overhead (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={defaultAdminOverhead}
                onChange={(e) => setDefaultAdminOverhead(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
              />
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Default Emergency Pricing</label>
                <p className="text-xs text-gray-500 mt-0.5">Enable emergency pricing by default for new quotes</p>
              </div>
              <button
                type="button"
                onClick={() => setDefaultIsEmergency(!defaultIsEmergency)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  defaultIsEmergency ? 'bg-blue-700' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mt-0.5 ${
                  defaultIsEmergency ? 'translate-x-5.5 ml-[1px]' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-blue-900 text-white text-sm font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-blue-700/25 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-600 animate-fade-in">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
      </form>

      <form onSubmit={handleChangePassword} className="mt-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Change Password</h2>

          {passwordError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {passwordError}
            </div>
          )}
          {passwordMessage && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 animate-fade-in">
              {passwordMessage}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-shadow"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordSaving}
            className="mt-5 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
