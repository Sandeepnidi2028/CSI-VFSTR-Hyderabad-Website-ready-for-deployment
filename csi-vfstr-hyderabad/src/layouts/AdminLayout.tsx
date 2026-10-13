import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { AdminUser } from '../types';
import {
  LayoutDashboard,
  Calendar,
  Images,
  Users,
  GraduationCap,
  UserCheck,
  Code2,
  BookOpen,
  Bell,
  UserPlus,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    const current = authService.getCurrentUser();
    setUser(current);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Events', path: '/admin/events', icon: Calendar },
    { name: 'Faculty Committee', path: '/admin/faculty', icon: UserCheck },
    { name: 'Students Committee', path: '/admin/students', icon: GraduationCap },
    { name: 'Gallery Albums', path: '/admin/gallery', icon: Images },
    { name: 'Projects', path: '/admin/projects', icon: Code2 },
    { name: 'Publications', path: '/admin/magazine', icon: BookOpen },
    { name: 'Announcements', path: '/admin/announcements', icon: Bell },
    { name: 'Membership Apps', path: '/admin/memberships', icon: UserPlus },
    { name: 'Contact Inquiries', path: '/admin/messages', icon: Mail },
    { name: 'Website Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-navy-900 text-white px-4 py-3 flex items-center justify-between border-b border-navy-800">
        <div className="flex items-center gap-2">
          <img src="/assets/csi_logo.png" alt="CSI" className="w-8 h-8 rounded-full" />
          <span className="font-display font-bold text-sm">CSI Admin Portal</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 transform border-r border-navy-800 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Top Admin Branding */}
          <div className="p-5 border-b border-navy-800 flex items-center gap-3">
            <img
              src="/assets/csi_logo.png"
              alt="CSI"
              className="w-10 h-10 object-contain rounded-full bg-white/10 p-0.5"
            />
            <div>
              <div className="font-display font-bold text-white text-sm">CSI VFSTR HYD</div>
              <div className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin Console</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer Actions */}
        <div className="p-4 border-t border-navy-800 space-y-3 bg-navy-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 text-cyan-400 flex items-center justify-center font-bold text-xs">
              {user?.username?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@csivfstr.org'}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-navy-800">
            <Link
              to="/"
              target="_blank"
              className="text-[11px] text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
