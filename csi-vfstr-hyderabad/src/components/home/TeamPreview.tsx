import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Linkedin, Github, Mail } from 'lucide-react';
import { teamService } from '../../services/api';
import { TeamMember } from '../../types';
import { getImageUrl } from '../../utils/imageUrl';

export const TeamPreview: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teamService.getAll()
      .then((data) => {
        setTeam(data.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Student Leadership & Mentorship
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-slate-900">
              Chapter Office Bearers
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Guided by dedicated faculty coordinators and driven by an enthusiastic student core team.
            </p>
          </div>
          <Link
            to="/team"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 group"
          >
            <span>View Full Chapter Team</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : team.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-slate-50 border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Chapter Team Roster</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              The CSI chapter roster is dynamically populated from the official team spreadsheet.
            </p>
            <Link
              to="/team"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              <span>Explore Team Structure</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group"
              >
                {/* Photo */}
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-200">
                  {member.photo ? (
                    <img
                      src={getImageUrl(member.photo)}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          member.name
                        )}&background=0e1b4d&color=fff&size=200`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-navy-800 to-blue-700 text-white font-display font-bold text-2xl">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {member.name}
                </h3>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">
                  {member.position}
                </p>

                {(member.department || member.year) && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    {[member.department, member.year].filter(Boolean).join(' • ')}
                  </p>
                )}

                {/* Socials */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 w-full justify-center">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
