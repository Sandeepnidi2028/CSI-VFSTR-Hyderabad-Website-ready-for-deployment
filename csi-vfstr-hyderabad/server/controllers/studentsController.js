import { dbAdapter } from '../services/dbAdapter.js';
import { parseTeamExcel } from '../services/excelParser.js';
import { normalizeUploadedImage } from '../utils/imageProcessor.js';
import { Student } from '../models/Student.js';
import { isMongoConnected } from '../config/database.js';

// Order student roles
export function getStudentPriority(position = '') {
  const p = position.toLowerCase();
  if (p.includes('president') && !p.includes('vice')) return 1;
  if (p.includes('vice president') || p.includes('vice chair')) return 2;
  if (p.includes('secretary') && !p.includes('joint')) return 3;
  if (p.includes('joint secretary')) return 4;
  if (p.includes('treasurer') && !p.includes('joint')) return 5;
  if (p.includes('joint treasurer')) return 6;
  if (p.includes('event')) return 7;
  if (p.includes('executive') || p.includes('committee')) return 8;
  if (p.includes('media coordinator')) return 9;
  if (p.includes('design') || p.includes('media') || p.includes('creative') || p.includes('pr') || p.includes('outreach')) return 10;
  if (p.includes('volunteer')) return 11;
  return 20;
}

export async function getAllStudents(req, res) {
  try {
    let students = [];

    if (isMongoConnected()) {
      const atlasMembers = await Student.find({}).lean();
      students = atlasMembers.map((m) => ({
        ...m,
        id: m._id ? m._id.toString() : m.id,
      }));
    } else {
      students = dbAdapter.find('students') || [];
    }

    students.sort((a, b) => {
      const orderA = getStudentPriority(a.position);
      const orderB = getStudentPriority(b.position);
      if (orderA !== orderB) return orderA - orderB;
      return (a.name || '').localeCompare(b.name || '');
    });

    return res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    try {
      const fallback = dbAdapter.find('students') || [];
      return res.json(fallback);
    } catch (e) {
      return res.status(500).json({ message: 'Failed to retrieve students', error: err.message });
    }
  }
}

export async function getStudentMember(req, res) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let member = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        member = await Student.findById(id).lean();
      } else {
        member = await Student.findOne({ $or: [{ _id: id }, { name: id }] }).lean();
      }
      if (member) {
        return res.json({ ...member, id: member._id.toString() });
      }
    }

    const member = dbAdapter.findById('students', id);
    if (!member) {
      return res.status(404).json({ message: 'Student member not found' });
    }
    return res.json(member);
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving student member' });
  }
}

export async function createStudentMember(req, res) {
  try {
    const { name, position, department, year, rollNumber, email, linkedin, github, phone } = req.body;
    if (!name || !position) {
      return res.status(400).json({ message: 'Name and Position are required' });
    }

    let photo = req.body.photo || '';
    if (req.file) {
      const norm = await normalizeUploadedImage(req.file);
      photo = norm.url;
    }

    const memberData = {
      name: name.trim(),
      position: position.trim(),
      department: (department || 'CSE').trim(),
      year: (year || 'B.Tech').trim(),
      rollNumber: (rollNumber || '').trim(),
      email: (email || '').trim(),
      linkedin: (linkedin || '').trim(),
      github: (github || '').trim(),
      phone: (phone || '').trim(),
      photo,
    };

    let createdDoc = null;
    if (isMongoConnected()) {
      const newMember = new Student(memberData);
      await newMember.save();
      createdDoc = {
        ...newMember.toObject(),
        id: newMember._id.toString(),
      };
    }

    const localMember = dbAdapter.create('students', memberData);
    return res.status(201).json(createdDoc || localMember);
  } catch (err) {
    return res.status(500).json({ message: 'Error creating student member', error: err.message });
  }
}

export async function updateStudentMember(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (req.file) {
      const norm = await normalizeUploadedImage(req.file);
      updates.photo = norm.url;
    }

    let updatedDoc = null;
    if (isMongoConnected()) {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        updatedDoc = await Student.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
      } else {
        updatedDoc = await Student.findOneAndUpdate({ name: updates.name || id }, { $set: updates }, { new: true }).lean();
      }
      if (updatedDoc) {
        updatedDoc.id = updatedDoc._id.toString();
      }
    }

    const localUpdated = dbAdapter.findByIdAndUpdate('students', id, updates);

    if (!updatedDoc && !localUpdated) {
      return res.status(404).json({ message: 'Student member not found' });
    }

    return res.json(updatedDoc || localUpdated);
  } catch (err) {
    return res.status(500).json({ message: 'Error updating student member', error: err.message });
  }
}

export async function deleteStudentMember(req, res) {
  try {
    const { id } = req.params;
    let deletedDoc = null;

    if (isMongoConnected()) {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        deletedDoc = await Student.findByIdAndDelete(id).lean();
      }
    }

    const localDeleted = dbAdapter.findByIdAndDelete('students', id);

    if (!deletedDoc && !localDeleted) {
      return res.status(404).json({ message: 'Student member not found' });
    }

    return res.json({ message: 'Student member deleted successfully', member: deletedDoc || localDeleted });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting student member' });
  }
}

export async function importStudentsExcel(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel (.xlsx/.xls) or CSV file.' });
    }

    const filePath = req.file.path;
    const parsedMembers = parseTeamExcel(filePath).map((m) => ({
      ...m,
      year: m.year && m.year !== 'Faculty' ? m.year : 'B.Tech',
    }));

    if (parsedMembers.length === 0) {
      return res.status(400).json({ message: 'No valid student members found in the uploaded file.' });
    }

    const isPreview = req.query.preview === 'true';
    if (isPreview) {
      return res.json({
        message: `Successfully parsed ${parsedMembers.length} student members from spreadsheet.`,
        count: parsedMembers.length,
        preview: parsedMembers,
      });
    }

    // Direct commit / Upsert into MongoDB Students collection
    if (isMongoConnected()) {
      for (const m of parsedMembers) {
        await Student.findOneAndUpdate(
          { name: m.name },
          { $set: m },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    // Merge into dbAdapter local students storage
    const currentList = dbAdapter.find('students') || [];
    for (const m of parsedMembers) {
      const idx = currentList.findIndex(
        (existing) => existing.name && existing.name.toLowerCase().trim() === m.name.toLowerCase().trim()
      );
      if (idx !== -1) {
        dbAdapter.findByIdAndUpdate('students', currentList[idx].id || currentList[idx]._id, m);
      } else {
        dbAdapter.create('students', m);
      }
    }

    const finalStudents = isMongoConnected() ? await Student.find({}).lean() : dbAdapter.find('students');

    return res.json({
      message: `Successfully imported ${parsedMembers.length} student members into Students database.`,
      count: parsedMembers.length,
      students: finalStudents,
    });
  } catch (err) {
    console.error('Students Excel import error:', err);
    return res.status(500).json({ message: 'Failed to process Excel file', error: err.message });
  }
}
