import * as xlsxModule from 'xlsx';
import fs from 'fs';

// Handle CommonJS / ESM interop for SheetJS
const XLSX = xlsxModule.default || xlsxModule;

/**
 * Normalizes role text: cleans typos and formats nicely
 */
function normalizeRole(role = '', isFaculty = false) {
  const r = role.trim().toUpperCase();
  if (!r) {
    return isFaculty ? 'Faculty Coordinator' : 'Executive Member';
  }

  // Preserve & nicely format official faculty designations
  if (r.includes('HOD') || r.includes('HEAD OF')) {
    return 'Head of the Department (CSE & ACSE)';
  }
  if (r.includes('NOMINEE')) {
    return 'CSI Nominee';
  }
  if (r.includes('COORDINATOR')) {
    if (r.includes('ACSE')) return 'Faculty Coordinator (ACSE)';
    if (r.includes('CSE')) return 'Faculty Coordinator (CSE)';
    return role.trim();
  }
  if (r.includes('FACULTY ADVISOR')) {
    return role.trim();
  }
  if (r.includes('FACULTY') || r.includes('PROFESSOR') || r.includes('COUNSELOR') || r.includes('ADVISOR')) {
    return role.trim();
  }

  // Student leadership & committee roles
  if (r.includes('VICE PRESIDENT') || r.includes('VICE CHAIR')) return 'Vice President';
  if (r.includes('PRESIDENT') || r.includes('CHAIRPERSON')) return 'President';
  if (r.includes('JOINT SECRETARY')) return 'Joint Secretary';
  if (r.includes('SECRETARY')) return 'Secretary';
  if (r.includes('TREASURER')) return 'Treasurer';
  if (r.includes('EVENT COORDINATOR') || r.includes('EVENT MANAGEMENT')) return 'Event Coordinator';
  if (r.includes('EXECUTIVE') || r.includes('EXCUTIVE') || r.includes('COMITEE') || r.includes('COMMITTEE')) return 'Executive Committee';
  if (r.includes('MEDIA') && r.includes('COORDINATOR')) return 'Media Coordinator';
  if (r.includes('VOLUNTEER') && r.includes('OUTREACH')) return 'Media & Outreach Volunteer';
  if (r.includes('VOLUNTEER') && r.includes('MEDIA')) return 'Media Volunteer';
  if (r.includes('MEDIA') || r.includes('OUTREACH')) return 'Media & Outreach Team';
  if (r.includes('VOLUNTEER')) return 'Student Volunteer';
  if (r.includes('TECHNICAL') || r.includes('TECH')) return 'Technical Team Lead';
  if (r.includes('DESIGN')) return 'Design Team Lead';

  // Capitalize words
  return role.trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file containing CSI team/faculty members.
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

  // First try parsing standard JSON
  let rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  // If default sheet_to_json didn't find standard headers (e.g. title banner in row 1),
  // inspect 2D array and detect the real header row index.
  const raw2D = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (Array.isArray(raw2D) && raw2D.length > 0) {
    const headerRowIdx = raw2D.findIndex((row) =>
      Array.isArray(row) &&
      row.some((cell) => {
        const s = String(cell || '').trim().toLowerCase();
        return (
          s.includes('name') ||
          s.includes('faculty') ||
          s.includes('teacher') ||
          s.includes('professor') ||
          s.includes('staff') ||
          s.includes('designation') ||
          s.includes('role') ||
          s.includes('s.no') ||
          s.includes('sno')
        );
      })
    );

    if (headerRowIdx > 0) {
      // Re-parse with range starting at the detected header row
      rawRows = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIdx, defval: '' });
    }
  }

  const isFacultyContext =
    (typeof filePathOrBuffer === 'string' && /faculty/i.test(filePathOrBuffer)) ||
    sheetName.toLowerCase().includes('faculty');

  const members = [];
  let currentGroupRole = '';

  for (const row of rawRows) {
    // Normalize row keys to lowercase alphanumeric
    const normalized = {};
    for (const [key, value] of Object.entries(row)) {
      const cleanKey = key.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      normalized[cleanKey] = typeof value === 'string' ? value.trim() : String(value || '').trim();
    }

    // 1. Resolve Name with broad faculty & student patterns
    let rawName =
      normalized.name ||
      normalized.fullname ||
      normalized.facultyname ||
      normalized.nameofthefaculty ||
      normalized.nameoffaculty ||
      normalized.faculty ||
      normalized.facultycommittee ||
      normalized.membername ||
      normalized.studentname ||
      normalized.teachername ||
      normalized.staffname ||
      normalized.professorname ||
      normalized.advisorname ||
      normalized.coordinatorname ||
      normalized.personname;

    // Fuzzy fallback: check any key containing 'name', 'faculty', 'prof', 'staff', 'teacher'
    if (!rawName) {
      for (const [k, v] of Object.entries(normalized)) {
        if (
          (k.includes('name') || k.includes('faculty') || k.includes('teacher') || k.includes('staff') || k.includes('prof')) &&
          !k.includes('file') && !k.includes('photo') && !k.includes('img') && !k.includes('image')
        ) {
          if (v && v.toUpperCase() !== 'NAME' && v.toUpperCase() !== 'FACULTY' && v.toUpperCase() !== 'FACULTY NAME') {
            rawName = v;
            break;
          }
        }
      }
    }

    // Prefix fallback: value starts with Dr. / Prof. / Mr. / Mrs. / Ms.
    if (!rawName) {
      for (const [k, v] of Object.entries(normalized)) {
        if (/^(dr\.|dr\s|prof\.|prof\s|mr\.|mr\s|mrs\.|ms\.)/i.test(v)) {
          rawName = v;
          break;
        }
      }
    }

    // If still no name or it's a header word, skip
    if (!rawName || ['NAME', 'FACULTY', 'FACULTY NAME', 'STUDENT NAME', 'FULL NAME', 'FACULTY COMMITTEE'].includes(rawName.toUpperCase())) {
      continue;
    }

    // Clean extra spaces around dots e.g. "Dr .K.B Manikandan" -> "Dr. K.B Manikandan"
    let cleanName = rawName
      .replace(/Dr\s*\.\s*/gi, 'Dr. ')
      .replace(/Prof\s*\.\s*/gi, 'Prof. ')
      .replace(/MS\s*\.\s*/gi, 'Ms. ')
      .replace(/Mr\s*\.\s*/gi, 'Mr. ')
      .replace(/\s+/g, ' ')
      .trim();

    cleanName = cleanName.replace(/\s*\((male|female)\)\s*/gi, '').trim();

    // Check if member is a faculty member
    const isFacultyMember =
      isFacultyContext ||
      /^(dr\.|dr\s|prof\.|prof\s|ms\.)/i.test(cleanName) ||
      cleanName.toLowerCase().startsWith('mr. sk');

    // 2. Resolve Role / Designation
    let rawRole =
      normalized.role ||
      normalized.position ||
      normalized.designation ||
      normalized.designationrole ||
      normalized.positionrole ||
      normalized.post ||
      normalized.title ||
      normalized.facultyrole ||
      normalized.committeerole ||
      normalized.roleincsi ||
      normalized.csirole ||
      normalized.responsibility ||
      normalized.portfolio ||
      normalized.advisor ||
      normalized.coordinator ||
      '';

    // Fuzzy check for role in keys
    if (!rawRole) {
      for (const [k, v] of Object.entries(normalized)) {
        if (
          (k.includes('role') || k.includes('pos') || k.includes('desig') || k.includes('post') || k.includes('title')) &&
          v
        ) {
          rawRole = v;
          break;
        }
      }
    }

    // Unassigned column check: e.g. row has "__EMPTY" column containing role text like "CSE - Coordinator"
    if (!rawRole) {
      for (const [k, v] of Object.entries(normalized)) {
        if (v && v.toLowerCase() !== rawName.toLowerCase() && !v.includes('@') && !v.startsWith('http')) {
          if (/coordinator|nominee|hod|head|advisor|counselor|faculty|chair|president|secretary|treasurer|volunteer|lead/i.test(v)) {
            rawRole = v;
            break;
          }
        }
      }
    }

    // 2nd column fallback
    if (!rawRole) {
      for (const [k, v] of Object.entries(normalized)) {
        if (v && v.toLowerCase() !== rawName.toLowerCase() && !v.includes('@') && !v.startsWith('http') && v.length < 60) {
          rawRole = v;
          break;
        }
      }
    }

    if (rawRole) {
      currentGroupRole = rawRole;
    } else if (currentGroupRole) {
      const u = currentGroupRole.toUpperCase();
      if (!u.includes('PRESIDENT') && !u.includes('SECRETARY') && !u.includes('TREASURER')) {
        rawRole = currentGroupRole;
      }
    }

    if (!rawRole && isFacultyMember) {
      rawRole = 'Faculty Coordinator';
    }

    const position = normalizeRole(rawRole, isFacultyMember);

    // 3. Resolve Department / Class
    let department =
      normalized.department ||
      normalized.dept ||
      normalized.branch ||
      normalized.class ||
      normalized.specialization ||
      '';

    if (!department) {
      for (const [k, v] of Object.entries(normalized)) {
        if (k.includes('dept') || k.includes('branch')) {
          department = v;
          break;
        }
      }
    }
    if (!department) {
      if (/acse\s*-\s*coordinator/i.test(rawRole) || (/acse/i.test(rawRole) && !/cse\s*&\s*acse/i.test(rawRole))) {
        department = 'ACSE';
      } else if (/cse\s*&\s*acse/i.test(rawRole) || /hod/i.test(rawRole)) {
        department = 'CSE & ACSE';
      } else if (/cse/i.test(rawRole)) {
        department = 'CSE';
      } else {
        department = 'CSE';
      }
    }

    // 4. Resolve Registration / Roll Number
    const rollNumber =
      normalized.registrationnumber ||
      normalized.regno ||
      normalized.rollno ||
      normalized.studentid ||
      normalized.empid ||
      '';

    // 5. Resolve Year / Cadre
    let year =
      normalized.year ||
      normalized.academicyear ||
      normalized.batch ||
      normalized.cadre ||
      '';

    if (!year) {
      if (
        isFacultyMember ||
        position.toLowerCase().includes('faculty') ||
        position.toLowerCase().includes('advisor') ||
        position.toLowerCase().includes('nominee') ||
        position.toLowerCase().includes('hod') ||
        position.toLowerCase().includes('head of')
      ) {
        year = 'Faculty';
      } else if (rollNumber.startsWith('24')) {
        year = '2nd Year';
      } else if (rollNumber.startsWith('23')) {
        year = '3rd Year';
      } else if (rollNumber.startsWith('25')) {
        year = '1st Year';
      } else {
        year = 'B.Tech';
      }
    }

    // 6. Optional social & contact fields
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

    const email = cleanOptional(normalized.email || normalized.emailid || normalized.mail || normalized.officialemail);
    const linkedin = cleanSocialUrl(normalized.linkedin || normalized.linkedinurl || normalized.linkedinlink);
    const github = cleanSocialUrl(normalized.github || normalized.githuburl || normalized.githublink);
    const photo = cleanOptional(normalized.photo || normalized.image || normalized.photourl || normalized.picture || normalized.profilepic);
    const phone = cleanOptional(normalized.phone || normalized.contact || normalized.mobile || normalized.phonenumber);

    members.push({
      name: cleanName,
      position,
      department: department || 'CSE',
      year: year || (isFacultyMember ? 'Faculty' : 'B.Tech'),
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
