import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { HardHat } from 'lucide-react';

export default function AuthGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 bg-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HardHat className="w-7 h-7 text-white" />
          </div>
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
