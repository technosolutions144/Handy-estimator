import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, HardHat, LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'New Quote', path: '/new' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/20">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">QuoteCraft</h1>
              <p className="text-[10px] text-gray-500 leading-tight">Professional Estimates</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-900 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-blue-700' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 p-3">
            <div className="bg-gray-50 rounded-xl p-4 mb-3">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {profile?.full_name || 'User'}
              </p>
              {profile?.company_name && (
                <p className="text-[10px] text-gray-500 truncate mt-0.5">
                  {profile.company_name}
                </p>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
