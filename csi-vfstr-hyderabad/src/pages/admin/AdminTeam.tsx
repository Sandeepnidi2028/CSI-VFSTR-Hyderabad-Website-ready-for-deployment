import React, { useState, useEffect } from 'react';
import { teamService } from '../../services/api';
import { TeamMember } from '../../types';
import {
  Users,
  Plus,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Upload,
  AlertTriangle,
  X,
  Check,
  Search,
  ExternalLink
} from 'lucide-react';

export const AdminTeam: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    position: 'Technical Team Lead',
    department: 'CSE',
    year: '3rd Year',
    email: '',
    linkedin: '',
    github: '',
    phone: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submittingMember, setSubmittingMember] = useState(false);

  // Excel Import Modal State
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const data = await teamService.getAll();
      setTeam(data);
    } catch (err) {
      console.error('Error loading team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  // Open Edit Modal
  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name || '',
      position: member.position || '',
      department: member.department || '',
      year: member.year || '',
      email: member.email || '',
      linkedin: member.linkedin || '',
      github: member.github || '',
      phone: member.phone || '',
    });
    setPhotoFile(null);
    setIsMemberModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingMember(null);
    setMemberForm({
      name: '',
      position: 'Faculty Coordinator',
      department: 'CSE',
      year: 'Faculty',
      email: '',
      linkedin: '',
      github: '',
      phone: '',
    });
    setPhotoFile(null);
    setIsMemberModalOpen(true);
  };

  // Save Member
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.position) return;

    setSubmittingMember(true);

    const cleanSocialUrl = (val: string) => {
      const trimmed = (val || '').trim();
      if (!trimmed || ['-', 'na', 'n/a', 'nil', 'none', 'null'].includes(trimmed.toLowerCase())) {
        return '';
      }
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return `https://${trimmed}`;
      }
      return trimmed;
    };

    const formData = new FormData();
    formData.append('name', memberForm.name.trim());
    formData.append('position', memberForm.position.trim());
    formData.append('department', memberForm.department.trim());
    formData.append('year', memberForm.year.trim());
    formData.append('email', memberForm.email.trim());
    formData.append('linkedin', cleanSocialUrl(memberForm.linkedin));
    formData.append('github', cleanSocialUrl(memberForm.github));
    formData.append('phone', memberForm.phone.trim());
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    try {
      if (editingMember) {
        await teamService.update(editingMember.id, formData);
      } else {
        await teamService.create(formData);
      }
      setIsMemberModalOpen(false);
      fetchTeam();
    } catch (err) {
      alert('Failed to save team member.');
    } finally {
      setSubmittingMember(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the team?`)) {
      try {
        await teamService.delete(id);
        fetchTeam();
      } catch (err) {
        alert('Failed to delete member.');
      }
    }
  };

  // Handle Excel File Select & Preview
  const handleExcelSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    setImportStatus('Analyzing spreadsheet headers...');

    try {
      const res = await teamService.importExcel(file, true); // preview
      setImportPreview(res);
      setImportStatus(null);
    } catch (err: any) {
      setImportStatus(err.response?.data?.message || 'Error parsing Excel file.');
      setImportPreview(null);
    }
  };

  // Commit Excel Import
  const handleCommitExcelImport = async () => {
    if (!excelFile) return;

    // Strict requirement: "Before replacing existing data, show: 'This will update the current team data. Continue?'"
    const confirmed = window.confirm('This will update the current team data. Continue?');
    if (!confirmed) return;

    setImporting(true);
    setImportStatus('Importing and updating database...');

    try {
      const res = await teamService.importExcel(excelFile, false); // commit
      alert(res.message || 'Team successfully imported from Excel!');
      setIsExcelModalOpen(false);
      setExcelFile(null);
      setImportPreview(null);
      setImportStatus(null);
      fetchTeam();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to import team spreadsheet.');
      setImportStatus(null);
    } finally {
      setImporting(false);
    }
  };

  const filteredTeam = team.filter((m) =>
    (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.position || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
            Team Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage faculty coordinators, student executive leads, and import the official CSI roster from Excel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Import Team from Excel Button */}
          <button
            onClick={() => {
              setIsExcelModalOpen(true);
              setExcelFile(null);
              setImportPreview(null);
              setImportStatus(null);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Team from Excel</span>
          </button>

          {/* Add Member Manually */}
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Filter and Count Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, department..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Members: <span className="font-bold text-slate-900">{team.length}</span>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading team roster...</div>
        ) : team.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Team Members Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Upload your CSI Team Excel file using the button above to automatically populate the roster.
            </p>
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Upload CSI Team Excel File</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Member</th>
                  <th className="p-4">Position</th>
                  <th className="p-4">Dept / Year</th>
                  <th className="p-4">Contact & Links</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeam.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {member.photo ? (
                            <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-navy-800 text-cyan-400 font-bold text-xs">
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{member.name}</div>
                          <div className="text-[11px] text-slate-400">{member.email || 'No email specified'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200">
                        {member.position}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">
                      {[member.department, member.year].filter(Boolean).join(' • ') || '—'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {member.linkedin && (
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            LinkedIn
                          </a>
                        )}
                        {member.github && (
                          <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:underline">
                            GitHub
                          </a>
                        )}
                        {!member.linkedin && !member.github && <span className="text-slate-400">—</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id, member.name)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL: Add / Edit Member --- */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-lg text-slate-900">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Position / Role *</label>
                <input
                  type="text"
                  required
                  value={memberForm.position}
                  onChange={(e) => setMemberForm({ ...memberForm, position: e.target.value })}
                  placeholder="e.g. Faculty Coordinator, Chairperson, Technical Lead"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={memberForm.department}
                    onChange={(e) => setMemberForm({ ...memberForm, department: e.target.value })}
                    placeholder="e.g. CSE"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Year / Class <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={memberForm.year}
                    onChange={(e) => setMemberForm({ ...memberForm, year: e.target.value })}
                    placeholder="e.g. 3rd Year"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    placeholder="member@vfstrhyd.ac.in"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LinkedIn URL <span className="text-slate-400 font-normal text-[11px]">(Not mandatory)</span>
                  </label>
                  <input
                    type="text"
                    value={memberForm.linkedin}
                    onChange={(e) => setMemberForm({ ...memberForm, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/... (leave blank if none)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GitHub URL <span className="text-slate-400 font-normal text-[11px]">(Not mandatory)</span>
                  </label>
                  <input
                    type="text"
                    value={memberForm.github}
                    onChange={(e) => setMemberForm({ ...memberForm, github: e.target.value })}
                    placeholder="https://github.com/... (leave blank if none)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Profile Photo <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMember}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {submittingMember ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Import Team from Excel --- */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Import Team from Excel
                </h3>
              </div>
              <button
                onClick={() => setIsExcelModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload your CSI Team spreadsheet (.xlsx, .xls, or .csv). Only <strong className="text-slate-900">Name</strong> and <strong className="text-slate-900">Position</strong> are required. LinkedIn accounts, GitHub, Email, Department, and Photos are completely optional.
              </p>

              {/* Drag/Select Box */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 text-center">
                <input
                  type="file"
                  id="excelInput"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelSelect}
                  className="hidden"
                />
                <label
                  htmlFor="excelInput"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-emerald-900">
                    {excelFile ? excelFile.name : 'Choose or Drag Excel File'}
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Supports .xlsx, .xls and .csv formats
                  </span>
                </label>
              </div>

              {importStatus && (
                <div className="p-3 rounded-xl bg-slate-100 text-slate-700 text-xs text-center font-medium">
                  {importStatus}
                </div>
              )}

              {/* Preview Box */}
              {importPreview && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Parsed Records: {importPreview.count} Members</span>
                    <span className="text-emerald-600">Ready to Commit</span>
                  </div>

                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-200 text-[11px]">
                    {importPreview.preview?.slice(0, 5).map((m: any, idx: number) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{m.name}</span>
                        <span className="text-slate-500">{m.position}</span>
                      </div>
                    ))}
                  </div>

                  {importPreview.count > 5 && (
                    <div className="text-[10px] text-slate-400 italic text-center">
                      + {importPreview.count - 5} more entries in file
                    </div>
                  )}

                  {/* Warning notice */}
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-[11px] text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      "This will update the current team data. Continue?"
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExcelModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCommitExcelImport}
                  disabled={!excelFile || !importPreview || importing}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {importing ? (
                    <span>Importing...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Commit & Update Team Data</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
