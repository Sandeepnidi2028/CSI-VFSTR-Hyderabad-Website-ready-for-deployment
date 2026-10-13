import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { settingsService } from '../../services/api';
import {
  Calendar,
  Users,
  UserCheck,
  GraduationCap,
  Images,
  Code2,
  BookOpen,
  UserPlus,
  Mail,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsService.getOverview()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const counts = data?.counts || {
    totalEvents: 0,
    upcomingEvents: 0,
    totalFaculty: 0,
    totalStudents: 0,
    totalTeam: 0,
    totalGalleryAlbums: 0,
    totalProjects: 0,
    totalPublications: 0,
    totalMemberships: 0,
    pendingMemberships: 0,
    totalMessages: 0,
    unreadMessages: 0
  };

  const statCards = [
    { title: 'Total Events', value: counts.totalEvents, subtitle: `${counts.upcomingEvents} Upcoming`, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/events' },
    { title: 'Faculty Committee', value: counts.totalFaculty ?? 0, subtitle: 'Advisors & Nominees', icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/faculty' },
    { title: 'Students Committee', value: counts.totalStudents ?? 0, subtitle: 'Execs & Volunteers', icon: GraduationCap, color: 'text-cyan-600', bg: 'bg-cyan-50', link: '/admin/students' },
    { title: 'Gallery Albums', value: counts.totalGalleryAlbums, subtitle: 'Photo Collections', icon: Images, color: 'text-sky-600', bg: 'bg-sky-50', link: '/admin/gallery' },
    { title: 'Student Projects', value: counts.totalProjects, subtitle: 'Showcase Roster', icon: Code2, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/projects' },
    { title: 'Publications', value: counts.totalPublications, subtitle: 'Magazines & PDFs', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/magazine' },
    { title: 'Membership Apps', value: counts.totalMemberships, subtitle: `${counts.pendingMemberships} Pending Review`, icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-50', link: '/admin/memberships' },
    { title: 'Inquiries / Contact', value: counts.totalMessages, subtitle: `${counts.unreadMessages} Unread`, icon: Mail, color: 'text-rose-600', bg: 'bg-rose-50', link: '/admin/messages' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
            Chapter Control Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage all public website content, team rosters, events, and membership applications in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/team"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>Import Team Excel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:border-blue-300 flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-slate-900">
                  {card.value}
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">{card.title}</div>
                <div className="text-[11px] text-slate-500 mt-1">{card.subtitle}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Launch & Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Welcome & System Status */}
        <div className="bg-navy-900 text-white rounded-2xl p-6 border border-navy-800 shadow-md relative overflow-hidden">
          <div className="tech-glow-circle w-64 h-64 bg-cyan-500/15 -top-10 -right-10" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-400 text-[11px] font-semibold border border-cyan-500/30">
              <Sparkles className="w-3 h-3" />
              <span>Chapter Live Status</span>
            </div>
            <h3 className="text-lg font-display font-bold text-white">
              CSI VFSTR Hyderabad Portal Ready
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              All public modules (Events, Gallery, Team, Projects, Publications, Announcements, Memberships) are connected to this dashboard. Any changes you make here are instantaneously reflected on the public website.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <Link
                to="/admin/events"
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 text-xs font-bold transition-colors"
              >
                + New Event
              </Link>
              <Link
                to="/admin/settings"
                className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold border border-navy-700 transition-colors"
              >
                Adjust Statistics & Info
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Applications or Inquiries */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Recent Membership Submissions</span>
              </h3>
              <Link to="/admin/memberships" className="text-xs text-blue-600 hover:underline">
                View All
              </Link>
            </div>

            {data?.recentMemberships && data.recentMemberships.length > 0 ? (
              <div className="space-y-2.5">
                {data.recentMemberships.slice(0, 3).map((m: any) => (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{m.name}</span>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span className="text-slate-600">{m.rollNumber}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {m.status || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No membership submissions recorded yet.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Pending applications: {counts.pendingMemberships}</span>
            <Link to="/admin/memberships" className="text-blue-600 font-semibold">
              Process Applications →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
