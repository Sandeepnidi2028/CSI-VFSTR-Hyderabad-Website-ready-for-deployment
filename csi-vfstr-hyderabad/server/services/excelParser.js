import * as xlsxModule from 'xlsx';
import fs from 'fs';

// Handle CommonJS / ESM interop for SheetJS
const XLSX = xlsxModule.default || xlsxModule;

/**
 * Normalizes role text: cleans typos and formats nicely
 */
function normalizeRole(role = '') {
  const r = role.trim().toUpperCase();
  if (r.includes('VICE PRESIDENT') || r.includes('VICE CHAIR')) return 'Vice President';
  if (r.includes('PRESIDENT') || r.includes('CHAIRPERSON')) return 'President';
  if (r.includes('JOINT SECRETARY')) return 'Joint Secretary';
  if (r.includes('SECRETARY')) return 'Secretary';
  if (r.includes('TREASURER')) return 'Treasurer';
  if (r.includes('EVENT COORDINATOR') || r.includes('EVENT MANAGEMENT')) return 'Event Coordinator';
  if (r.includes('EXECUTIVE') || r.includes('EXCUTIVE') || r.includes('COMITEE') || r.includes('COMMITTEE')) return 'Executive Committee';
  if (r.includes('MEDIA') && r.includes('COORDINATOR')) return 'Media Coordinator';
  if (r.includes('VOLUNTEER') && (r.includes('MEDIA') || r.includes('OUTREACH'))) return 'Media & Outreach Volunteer';
  if (r.includes('MEDIA') || r.includes('OUTREACH')) return 'Media & Outreach Team';
  if (r.includes('VOLUNTEER')) return 'Student Volunteer';
  if (r.includes('TECHNICAL') || r.includes('TECH')) return 'Technical Team Lead';
  if (r.includes('DESIGN')) return 'Design Team Lead';
  if (r.includes('FACULTY') || r.includes('COUNSELOR')) return 'Faculty Coordinator';

  // Capitalize words
  return role.trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file containing CSI team members.
 */
export function parseTeamExcel(filePathOrBuffer) {
  let workbook;

  if (typeof filePathOrBuffer === 'string') {
    const fileBuffer = fs.readFileSync(filePathOrBuffer);
    workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
  } else {
    workbook = XLSX.read(filePathOrBuffer, { type: 'buffer', cellDates: true });
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('No sheets found in uploaded Excel file.');
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const members = [];
  let currentGroupRole = '';

  for (const row of rawRows) {
    // Normalize row keys to lowercase alphanumeric
    const normalized = {};
    for (const [key, value] of Object.entries(row)) {
      const cleanKey = key.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      normalized[cleanKey] = typeof value === 'string' ? value.trim() : String(value || '').trim();
    }

    // Resolve Name
    let rawName = normalized.name || normalized.fullname || normalized.membername || normalized.studentname;
    if (!rawName || rawName.toUpperCase() === 'NAME') {
      continue; // Skip header or empty rows
    }

    // Clean (MALE) or (FEMALE) from name if present
    const cleanName = rawName.replace(/\s*\((male|female)\)\s*/gi, '').trim();

    // Resolve Role with merged cell carryover
    let rawRole = normalized.role || normalized.position || normalized.designation || normalized.post || normalized.title || '';

    if (rawRole) {
      currentGroupRole = rawRole;
    } else if (currentGroupRole) {
      // Inherit group role from merged cell above (e.g. Event Coordinator, Executive Committee, Outreach, Volunteer)
      const u = currentGroupRole.toUpperCase();
      if (!u.includes('PRESIDENT') && !u.includes('SECRETARY') && !u.includes('TREASURER')) {
        rawRole = currentGroupRole;
      }
    }

    const position = rawRole ? normalizeRole(rawRole) : 'Executive Member';

    // Resolve Department / Class
    const department = normalized.class || normalized.department || normalized.dept || normalized.branch || '';

    // Resolve Registration / Roll Number
    const rollNumber = normalized.registrationnumber || normalized.regno || normalized.rollno || normalized.studentid || '';

    // Resolve Year
    let year = normalized.year || normalized.academicyear || normalized.batch || '';
    if (!year && rollNumber.startsWith('24')) {
      year = '2nd Year';
    } else if (!year && rollNumber.startsWith('23')) {
      year = '3rd Year';
    } else if (!year && rollNumber.startsWith('25')) {
      year = '1st Year';
    }

    // Helper to sanitize optional fields (turn -, na, nil into empty string)
    const cleanOptional = (val) => {
      if (!val) return '';
      const s = String(val).trim();
      if (['-', 'na', 'n/a', 'nil', 'none', 'null'].includes(s.toLowerCase())) return '';
      return s;
    };

    const cleanSocialUrl = (val) => {
      const s = cleanOptional(val);
      if (!s) return '';
      if (!s.startsWith('http://') && !s.startsWith('https://')) {
        return `https://${s}`;
      }
      return s;
    };

    // Optional social & contact fields (none are mandatory)
    const email = cleanOptional(normalized.email || normalized.emailid || normalized.mail);
    const linkedin = cleanSocialUrl(normalized.linkedin || normalized.linkedinurl || normalized.linkedinlink);
    const github = cleanSocialUrl(normalized.github || normalized.githuburl || normalized.githublink);
    const photo = cleanOptional(normalized.photo || normalized.image || normalized.photourl || normalized.picture);
    const phone = cleanOptional(normalized.phone || normalized.contact || normalized.mobile);

    members.push({
      name: cleanName,
      position,
      department: department || 'CSE',
      year: year || 'B.Tech',
      rollNumber,
      email,
      linkedin,
      github,
      photo: photo || '',
      phone: phone || ''
    });
  }

  return members;
}
