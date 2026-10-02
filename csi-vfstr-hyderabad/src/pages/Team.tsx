import React, { useState, useEffect } from 'react';
import { teamService } from '../services/api';
import { TeamMember } from '../types';
import { Users, GraduationCap, Linkedin } from 'lucide-react';

export const Team: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'faculty' | 'students'>('students');

  useEffect(() => {
    teamService
      .getAll()
      .then((data) => {
        setTeam(data);
      })
      .catch((err) => console.error('Failed to load team data:', err))
      .finally(() => setLoading(false));
  }, []);

  // Helper to identify faculty members
  const isFacultyMember = (member: TeamMember) => {
    const pos = (member.position || '').toLowerCase();
    const yr = (member.year || '').toLowerCase();
    const name = (member.name || '').toLowerCase();
    return (
      name.startsWith('dr.') ||
      name.startsWith('mr. sk') ||
      pos.includes('faculty') ||
      pos.includes('advisor') ||
      pos.includes('counselor') ||
      pos.includes('mentor') ||
      pos.includes('professor') ||
      pos.includes('head of the department') ||
      pos.includes('hod') ||
      pos.includes('dean') ||
      yr.includes('faculty')
    );
  };

  // Helper to sort roles logically
  const getRolePriority = (position = '') => {
    const p = position.toLowerCase();
    if (p.includes('head of the department') || p.includes('hod')) return 1;
    if (p.includes('faculty advisor')) return 2;
    if (p.includes('faculty coordinator')) return 3;
    if (p.includes('president') && !p.includes('vice')) return 4;
    if (p.includes('vice president') || p.includes('vice chair')) return 5;
    if (p.includes('secretary') && !p.includes('joint')) return 6;
    if (p.includes('joint secretary')) return 7;
    if (p.includes('treasurer') && !p.includes('joint')) return 8;
    if (p.includes('joint treasurer')) return 9;
    if (p.includes('event')) return 10;
    if (p.includes('executive') || p.includes('committee')) return 11;
    if (p.includes('design') || p.includes('media') || p.includes('pr')) return 12;
    if (p.includes('volunteer')) return 13;
    return 20;
  };

  const facultyMembers = team
    .filter(isFacultyMember)
    .sort((a, b) => getRolePriority(a.position) - getRolePriority(b.position));

  const studentMembers = team
    .filter((m) => !isFacultyMember(m))
    .sort((a, b) => getRolePriority(a.position) - getRolePriority(b.position));

  // Categorize student committee
  const leadership = studentMembers.filter((m) => {
    const p = (m.position || '').toLowerCase();
    return (
      p.includes('president') ||
      p.includes('chair') ||
      p.includes('secretary') ||
      p.includes('treasurer')
    );
  });

  const eventCoordinators = studentMembers.filter((m) => {
    const p = (m.position || '').toLowerCase();
    return p.includes('event');
  });

  const executiveCommittee = studentMembers.filter((m) => {
    const p = (m.position || '').toLowerCase();
    return (p.includes('executive') || p.includes('committee')) && !p.includes('event');
  });

  const mediaTeam = studentMembers.filter((m) => {
    const p = (m.position || '').toLowerCase();
    return p.includes('design') || p.includes('media') || p.includes('creative') || p.includes('pr');
  });

  const volunteers = studentMembers.filter((m) => {
    const p = (m.position || '').toLowerCase();
    return p.includes('volunteer');
  });

  const categorizedIds = new Set([
    ...leadership.map((m) => m.id || m._id || m.name),
    ...eventCoordinators.map((m) => m.id || m._id || m.name),
    ...executiveCommittee.map((m) => m.id || m._id || m.name),
    ...mediaTeam.map((m) => m.id || m._id || m.name),
    ...volunteers.map((m) => m.id || m._id || m.name),
  ]);

  const otherStudents = studentMembers.filter(
    (m) => !categorizedIds.has(m.id || m._id || m.name)
  );

  // Card component
  const renderMemberCard = (member: TeamMember) => {
    return (
      <div key={member.id || member._id || member.name} className="flex flex-col items-center text-center group">
        {/* Circular Avatar */}
        <div className="relative mb-3">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-200/80 bg-slate-100 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    member.name
                  )}&background=0e1b4d&color=fff&size=200`;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0e1b4d] to-[#1d4ed8] text-white font-bold text-2xl sm:text-3xl">
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
            )}
          </div>

          {/* Blue LinkedIn circular badge at bottom-right of photo only if member has a LinkedIn account */}
          {member.linkedin &&
          !['-', 'na', 'n/a', 'nil', 'none'].includes(member.linkedin.trim().toLowerCase()) && (
            <a
              href={
                member.linkedin.startsWith('http://') || member.linkedin.startsWith('https://')
                  ? member.linkedin
                  : `https://${member.linkedin}`
              }
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} LinkedIn Profile`}
              className="absolute bottom-1 right-2 w-7 h-7 bg-[#0077b5] text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 hover:bg-[#005f93] transition-all"
            >
              <Linkedin className="w-3.5 h-3.5 fill-current" />
            </a>
          )}
        </div>

        {/* Name */}
        <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight leading-tight mt-1 group-hover:text-blue-600 transition-colors">
          {member.name}
        </h3>

        {/* Position */}
        <p className="text-blue-700 font-semibold text-xs sm:text-sm mt-1 leading-snug">
          {member.position}
        </p>

        {/* Department */}
        <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 leading-snug">
          {member.department || 'CSI Student Branch Chapter'}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-[90vh] py-12 sm:py-16">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title & Subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold text-slate-900 tracking-tight">
            Our Team
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm md:text-base mt-2 leading-relaxed">
            Meet the dedicated team of professionals who guide and support our community.
          </p>
        </div>

        {/* Clean Two-Tab Navigation */}
        <div className="flex items-center justify-center gap-4 mb-12 sm:mb-16">
          <button
            onClick={() => setActiveTab('faculty')}
            className={`px-6 py-2.5 rounded-md font-medium text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'faculty'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-blue-500/40 text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Faculty Committee</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-2.5 rounded-md font-medium text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-blue-500/40 text-blue-600 hover:bg-blue-50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Students Committee</span>
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
            <p className="text-slate-500 text-xs font-medium">Fetching team roster from MongoDB Atlas...</p>
          </div>
        ) : (
          <div>
            {/* View 1: Faculty Committee */}
            {activeTab === 'faculty' && (
              facultyMembers.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-8 justify-center max-w-6xl mx-auto animate-in fade-in duration-300">
                  {facultyMembers.map(renderMemberCard)}
                </div>
              ) : (
                <div className="text-center py-16 px-4 max-w-md mx-auto animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200 shadow-sm">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Faculty Committee Details Coming Soon
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    The official Faculty Advisors and Coordinators for the VFSTR Hyderabad Student Chapter will be uploaded shortly.
                  </p>
                </div>
              )
            )}

            {/* View 2: Students Committee */}
            {activeTab === 'students' && (
              studentMembers.length > 0 ? (
                <div className="space-y-16 animate-in fade-in duration-300">
                  {/* Executive Leadership */}
                  {leadership.length > 0 && (
                    <div>
                      <div className="text-center mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                          Executive Leadership
                        </h2>
                        <div className="h-0.5 w-12 bg-blue-600 mx-auto mt-1" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 justify-center max-w-6xl mx-auto">
                        {leadership.map(renderMemberCard)}
                      </div>
                    </div>
                  )}

                  {/* Event Coordinators */}
                  {eventCoordinators.length > 0 && (
                    <div>
                      <div className="text-center mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                          Event Coordinators
                        </h2>
                        <div className="h-0.5 w-12 bg-blue-600 mx-auto mt-1" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 justify-center max-w-5xl mx-auto">
                        {eventCoordinators.map(renderMemberCard)}
                      </div>
                    </div>
                  )}

                  {/* Executive Committee */}
                  {executiveCommittee.length > 0 && (
                    <div>
                      <div className="text-center mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                          Executive Committee
                        </h2>
                        <div className="h-0.5 w-12 bg-blue-600 mx-auto mt-1" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 justify-center max-w-6xl mx-auto">
                        {executiveCommittee.map(renderMemberCard)}
                      </div>
                    </div>
                  )}

                  {/* Media Team */}
                  {mediaTeam.length > 0 && (
                    <div>
                      <div className="text-center mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                          Media & Outreach Team
                        </h2>
                        <div className="h-0.5 w-12 bg-blue-600 mx-auto mt-1" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 justify-center max-w-2xl mx-auto">
                        {mediaTeam.map(renderMemberCard)}
                      </div>
                    </div>
                  )}

                  {/* Student Volunteers */}
                  {volunteers.length > 0 && (
                    <div>
                      <div className="text-center mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                          Student Volunteers
                        </h2>
                        <div className="h-0.5 w-12 bg-blue-600 mx-auto mt-1" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-10 justify-center max-w-6xl mx-auto">
                        {volunteers.map(renderMemberCard)}
                      </div>
                    </div>
                  )}

                  {/* Other Committee Members */}
                  {otherStudents.length > 0 && (
                    <div>
                      <div className="text-center mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                          Committee Members
                        </h2>
                        <div className="h-0.5 w-12 bg-blue-600 mx-auto mt-1" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-10 justify-center max-w-6xl mx-auto">
                        {otherStudents.map(renderMemberCard)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 px-4 max-w-md mx-auto animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200 shadow-sm">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Student Committee Details Coming Soon
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    The official Student Committee roster for VFSTR Hyderabad will be uploaded shortly.
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
