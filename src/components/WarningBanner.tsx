import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface WarningBannerProps {
  message: string;
  severity: 'warning' | 'danger';
}

export default function WarningBanner({ message, severity }: WarningBannerProps) {
  const isDanger = severity === 'danger';

  return (
    <div
      className={`
        rounded-xl p-4 border-l-4 flex items-start gap-3 animate-fade-in
        ${isDanger ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'}
      `}
    >
      {isDanger ? (
        <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      )}
      <p className={`text-sm leading-relaxed font-medium ${isDanger ? 'text-red-800' : 'text-amber-800'}`}>
        {message}
      </p>
    </div>
  );
}
