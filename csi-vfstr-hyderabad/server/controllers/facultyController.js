import { dbAdapter } from '../services/dbAdapter.js';
import { parseTeamExcel } from '../services/excelParser.js';
import { normalizeUploadedImage } from '../utils/imageProcessor.js';
import { Faculty } from '../models/Faculty.js';
import { isMongoConnected } from '../config/database.js';

// Order faculty roles by seniority
export function getFacultyPriority(position = '') {
  const p = position.toLowerCase();
  if (p.includes('head of the department') || p.includes('hod')) return 1;
  if (p.includes('nominee')) return 2;
  if (p.includes('faculty advisor')) return 3;
  if (p.includes('faculty coordinator') || p.includes('coordinator')) return 4;
  if (p.includes('professor')) return 5;
  return 10;
}

export async function getAllFaculty(req, res) {
  try {
    let faculty = [];

    if (isMongoConnected()) {
      const atlasMembers = await Faculty.find({}).lean();
      faculty = atlasMembers.map((m) => ({
        ...m,
        id: m._id ? m._id.toString() : m.id,
      }));
    } else {
      faculty = dbAdapter.find('faculty') || [];
    }

    faculty.sort((a, b) => {
      const orderA = getFacultyPriority(a.position);
      const orderB = getFacultyPriority(b.position);
      if (orderA !== orderB) return orderA - orderB;
      return (a.name || '').localeCompare(b.name || '');
    });

    return res.json(faculty);
  } catch (err) {
    console.error('Error fetching faculty:', err);
    try {
      const fallback = dbAdapter.find('faculty') || [];
      return res.json(fallback);
    } catch (e) {
      return res.status(500).json({ message: 'Failed to retrieve faculty', error: err.message });
    }
  }
}

export async function getFacultyMember(req, res) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let member = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        member = await Faculty.findById(id).lean();
      } else {
        member = await Faculty.findOne({ $or: [{ _id: id }, { name: id }] }).lean();
      }
      if (member) {
        return res.json({ ...member, id: member._id.toString() });
      }
    }

    const member = dbAdapter.findById('faculty', id);
    if (!member) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }
    return res.json(member);
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving faculty member' });
  }
}

export async function createFacultyMember(req, res) {
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
      year: (year || 'Faculty').trim(),
      rollNumber: (rollNumber || '').trim(),
      email: (email || '').trim(),
      linkedin: (linkedin || '').trim(),
      github: (github || '').trim(),
      phone: (phone || '').trim(),
      photo,
    };

    let createdDoc = null;
    if (isMongoConnected()) {
      const newMember = new Faculty(memberData);
      await newMember.save();
      createdDoc = {
        ...newMember.toObject(),
        id: newMember._id.toString(),
      };
    }

    const localMember = dbAdapter.create('faculty', memberData);
    return res.status(201).json(createdDoc || localMember);
  } catch (err) {
    return res.status(500).json({ message: 'Error creating faculty member', error: err.message });
  }
}

export async function updateFacultyMember(req, res) {
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
        updatedDoc = await Faculty.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
      } else {
        updatedDoc = await Faculty.findOneAndUpdate({ name: updates.name || id }, { $set: updates }, { new: true }).lean();
      }
      if (updatedDoc) {
        updatedDoc.id = updatedDoc._id.toString();
      }
    }

    const localUpdated = dbAdapter.findByIdAndUpdate('faculty', id, updates);

    if (!updatedDoc && !localUpdated) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    return res.json(updatedDoc || localUpdated);
  } catch (err) {
    return res.status(500).json({ message: 'Error updating faculty member', error: err.message });
  }
}

export async function deleteFacultyMember(req, res) {
  try {
    const { id } = req.params;
    let deletedDoc = null;

    if (isMongoConnected()) {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        deletedDoc = await Faculty.findByIdAndDelete(id).lean();
      }
    }

    const localDeleted = dbAdapter.findByIdAndDelete('faculty', id);

    if (!deletedDoc && !localDeleted) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    return res.json({ message: 'Faculty member deleted successfully', member: deletedDoc || localDeleted });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting faculty member' });
  }
}

export async function importFacultyExcel(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel (.xlsx/.xls) or CSV file.' });
    }

    const filePath = req.file.path;
    const parsedMembers = parseTeamExcel(filePath).map((m) => ({
      ...m,
      year: 'Faculty',
    }));

    if (parsedMembers.length === 0) {
      return res.status(400).json({ message: 'No valid faculty members found in the uploaded file.' });
    }

    const isPreview = req.query.preview === 'true';
    if (isPreview) {
      return res.json({
        message: `Successfully parsed ${parsedMembers.length} faculty members from spreadsheet.`,
        count: parsedMembers.length,
        preview: parsedMembers,
      });
    }

    // Direct commit / Upsert into MongoDB Faculty collection
    if (isMongoConnected()) {
      for (const m of parsedMembers) {
        await Faculty.findOneAndUpdate(
          { name: m.name },
          { $set: m },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    // Merge into dbAdapter local faculty storage
    const currentList = dbAdapter.find('faculty') || [];
    for (const m of parsedMembers) {
      const idx = currentList.findIndex(
        (existing) => existing.name && existing.name.toLowerCase().trim() === m.name.toLowerCase().trim()
      );
      if (idx !== -1) {
        dbAdapter.findByIdAndUpdate('faculty', currentList[idx].id || currentList[idx]._id, m);
      } else {
        dbAdapter.create('faculty', m);
      }
    }

    const finalFaculty = isMongoConnected() ? await Faculty.find({}).lean() : dbAdapter.find('faculty');

    return res.json({
      message: `Successfully imported ${parsedMembers.length} faculty members into Faculty database.`,
      count: parsedMembers.length,
      faculty: finalFaculty,
    });
  } catch (err) {
    console.error('Faculty Excel import error:', err);
    return res.status(500).json({ message: 'Failed to process Excel file', error: err.message });
  }
}
