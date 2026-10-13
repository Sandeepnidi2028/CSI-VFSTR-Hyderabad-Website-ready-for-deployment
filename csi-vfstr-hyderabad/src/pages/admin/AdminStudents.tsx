import React, { useState, useEffect } from 'react';
import { studentsService } from '../../services/api';
import { TeamMember } from '../../types';
import {
  GraduationCap,
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
import { getImageUrl } from '../../utils/imageUrl';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    position: 'Technical Team Lead',
    department: 'CSE',
    year: 'B.Tech',
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

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentsService.getAll();
      setStudents(data);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenCreate = () => {
    setEditingMember(null);
    setMemberForm({
      name: '',
      position: 'Technical Team Lead',
      department: 'CSE',
      year: 'B.Tech',
      email: '',
      linkedin: '',
      github: '',
      phone: '',
    });
    setPhotoFile(null);
    setIsMemberModalOpen(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name,
      position: member.position,
      department: member.department || 'CSE',
      year: member.year || 'B.Tech',
      email: member.email || '',
      linkedin: member.linkedin || '',
      github: member.github || '',
      phone: member.phone || '',
    });
    setPhotoFile(null);
    setIsMemberModalOpen(true);
  };

  const cleanSocialUrl = (url: string) => {
    if (!url) return '';
    let cleaned = url.trim();
    if (cleaned && !cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = `https://${cleaned}`;
    }
    return cleaned;
  };

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim() || !memberForm.position.trim()) {
      alert('Name and Position are required.');
      return;
    }

    setSubmittingMember(true);
    const formData = new FormData();
    formData.append('name', memberForm.name.trim());
    formData.append('position', memberForm.position.trim());
    formData.append('department', memberForm.department.trim());
    formData.append('year', memberForm.year.trim() || 'B.Tech');
    formData.append('email', memberForm.email.trim());
    formData.append('linkedin', cleanSocialUrl(memberForm.linkedin));
    formData.append('github', cleanSocialUrl(memberForm.github));
    formData.append('phone', memberForm.phone.trim());
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    try {
      if (editingMember) {
        await studentsService.update(editingMember.id, formData);
      } else {
        await studentsService.create(formData);
      }
      setIsMemberModalOpen(false);
      fetchStudents();
    } catch (err) {
      alert('Failed to save student member.');
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the Students Committee?`)) {
      try {
        await studentsService.delete(id);
        fetchStudents();
      } catch (err) {
        alert('Failed to delete student member.');
      }
    }
  };

  const handleExcelSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    setImportStatus('Analyzing student spreadsheet headers...');
    try {
      const preview = await studentsService.importExcel(file, true);
      setImportPreview(preview);
      setImportStatus(null);
    } catch (err: any) {
      setImportStatus(err.response?.data?.message || 'Failed to read student spreadsheet');
      setImportPreview(null);
    }
  };

  const handleCommitExcelImport = async () => {
    if (!excelFile) return;
    setImporting(true);
    try {
      await studentsService.importExcel(excelFile, false);
      setIsExcelModalOpen(false);
      setExcelFile(null);
      setImportPreview(null);
      fetchStudents();
      alert('Student spreadsheet imported successfully into Students Database!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to import student file');
    } finally {
      setImporting(false);
    }
  };

  const filteredStudents = students.filter((m) =>
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
            Students Committee Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage student executive leads, event coordinators, and volunteers in the dedicated Students Database.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
            <span>Import Students Sheet</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student Member</span>
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
            placeholder="Search students by name, role, department..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Students: <span className="font-bold text-slate-900">{students.length}</span>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading student committee...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Student Members Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Upload your Student Committee Excel file or add members manually to populate the roster.
            </p>
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Upload Students Sheet</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Student Member</th>
                  <th className="p-4">Position</th>
                  <th className="p-4">Dept / Year</th>
                  <th className="p-4">Contact & Links</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {member.photo ? (
                            <img
                              src={getImageUrl(member.photo)}
                              alt={member.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  member.name
                                )}&background=0e1b4d&color=fff&size=100`;
                              }}
                            />
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

      {/* Member Create/Edit Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {editingMember ? 'Edit Student Member' : 'Add Student Member'}
              </h3>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ujwal Singh"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. President"
                    value={memberForm.position}
                    onChange={(e) => setMemberForm({ ...memberForm, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSE / ACSE-CS"
                    value={memberForm.department}
                    onChange={(e) => setMemberForm({ ...memberForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech / 3rd Year"
                    value={memberForm.year}
                    onChange={(e) => setMemberForm({ ...memberForm, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/..."
                    value={memberForm.linkedin}
                    onChange={(e) => setMemberForm({ ...memberForm, linkedin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://github.com/..."
                    value={memberForm.github}
                    onChange={(e) => setMemberForm({ ...memberForm, github: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Profile Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                  {submittingMember ? 'Saving...' : editingMember ? 'Update Member' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Import Students Spreadsheet</h3>
              </div>
              <button
                onClick={() => setIsExcelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-6 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 text-center">
                <input
                  type="file"
                  id="studentsExcelInput"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelSelect}
                  className="hidden"
                />
                <label
                  htmlFor="studentsExcelInput"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-emerald-900">
                    {excelFile ? excelFile.name : 'Choose or Drag Students Spreadsheet'}
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

              {importPreview && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Parsed Records: {importPreview.count} Students</span>
                    <span className="text-emerald-600">Ready to Commit</span>
                  </div>

                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-200 text-[11px]">
                    {importPreview.preview?.slice(0, 6).map((m: any, idx: number) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{m.name}</span>
                        <span className="text-slate-500">{m.position}</span>
                      </div>
                    ))}
                  </div>

                  {importPreview.count > 6 && (
                    <div className="text-[10px] text-slate-400 italic text-center">
                      + {importPreview.count - 6} more student entries
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-[11px] text-emerald-800">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      These entries will be merged directly into your dedicated <strong>Students Database</strong>. Faculty members will NOT be modified.
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
                      <span>Commit to Students Database</span>
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
