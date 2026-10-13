import { dbAdapter } from '../services/dbAdapter.js';
import { parseTeamExcel } from '../services/excelParser.js';
import { normalizeUploadedImage } from '../utils/imageProcessor.js';
import { Team } from '../models/Team.js';
import { isMongoConnected } from '../config/database.js';
import fs from 'fs';

// Helper to determine role order
export function getRolePriority(position = '') {
  const p = position.toLowerCase();
  if (p.includes('faculty') || p.includes('counselor') || (p.includes('coordinator') && !p.includes('event'))) return 1;
  if ((p.includes('chairperson') || p.includes('president')) && !p.includes('vice')) return 2;
  if (p.includes('vice chairperson') || p.includes('vice president')) return 3;
  if (p.includes('secretary') && !p.includes('joint')) return 4;
  if (p.includes('joint secretary')) return 5;
  if (p.includes('treasurer')) return 6;
  if (p.includes('event')) return 7;
  if (p.includes('executive')) return 8;
  if (p.includes('technical') || p.includes('tech lead')) return 9;
  if (p.includes('design') || p.includes('creative')) return 10;
  if (p.includes('media') || p.includes('pr')) return 11;
  if (p.includes('outreach')) return 12;
  if (p.includes('volunteer')) return 13;
  return 20;
}

export async function getAllTeam(req, res) {
  try {
    let team = [];

    if (isMongoConnected()) {
      const atlasMembers = await Team.find({}).lean();
      team = atlasMembers.map((m) => ({
        ...m,
        id: m._id ? m._id.toString() : m.id,
      }));
    } else {
      team = dbAdapter.find('team');
    }

    // Sort logically by role hierarchy
    team.sort((a, b) => {
      const orderA = getRolePriority(a.position);
      const orderB = getRolePriority(b.position);
      if (orderA !== orderB) return orderA - orderB;
      return (a.name || '').localeCompare(b.name || '');
    });

    return res.json(team);
  } catch (err) {
    console.error('Error fetching team from MongoDB Atlas:', err);
    // Graceful fallback to dbAdapter
    try {
      const fallbackTeam = dbAdapter.find('team');
      return res.json(fallbackTeam);
    } catch (e) {
      return res.status(500).json({ message: 'Failed to retrieve team members', error: err.message });
    }
  }
}

export async function getTeamMember(req, res) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let member = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        member = await Team.findById(id).lean();
      } else {
        member = await Team.findOne({ $or: [{ _id: id }, { name: id }] }).lean();
      }
      if (member) {
        return res.json({ ...member, id: member._id.toString() });
      }
    }

    const member = dbAdapter.findById('team', id);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    return res.json(member);
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving team member' });
  }
}

export async function createTeamMember(req, res) {
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
      department: (department || '').trim(),
      year: (year || '').trim(),
      rollNumber: (rollNumber || '').trim(),
      email: (email || '').trim(),
      linkedin: (linkedin || '').trim(),
      github: (github || '').trim(),
      phone: (phone || '').trim(),
      photo,
    };

    let createdDoc = null;
    if (isMongoConnected()) {
      const newMember = new Team(memberData);
      await newMember.save();
      createdDoc = {
        ...newMember.toObject(),
        id: newMember._id.toString(),
      };
    }

    // Always keep local dbAdapter updated as fallback
    const localMember = dbAdapter.create('team', memberData);

    return res.status(201).json(createdDoc || localMember);
  } catch (err) {
    return res.status(500).json({ message: 'Error creating team member', error: err.message });
  }
}

export async function updateTeamMember(req, res) {
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
        updatedDoc = await Team.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
      } else {
        updatedDoc = await Team.findOneAndUpdate({ name: updates.name || id }, { $set: updates }, { new: true }).lean();
      }
      if (updatedDoc) {
        updatedDoc.id = updatedDoc._id.toString();
      }
    }

    const localUpdated = dbAdapter.findByIdAndUpdate('team', id, updates);

    if (!updatedDoc && !localUpdated) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    return res.json(updatedDoc || localUpdated);
  } catch (err) {
    return res.status(500).json({ message: 'Error updating team member', error: err.message });
  }
}

export async function deleteTeamMember(req, res) {
  try {
    const { id } = req.params;
    let deletedDoc = null;

    if (isMongoConnected()) {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        deletedDoc = await Team.findByIdAndDelete(id).lean();
      }
    }

    const localDeleted = dbAdapter.findByIdAndDelete('team', id);

    if (!deletedDoc && !localDeleted) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    return res.json({ message: 'Team member deleted successfully', member: deletedDoc || localDeleted });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting team member' });
  }
}

export async function importTeamExcel(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel (.xlsx/.xls) or CSV file.' });
    }

    const filePath = req.file.path;
    const parsedMembers = parseTeamExcel(filePath);

    if (parsedMembers.length === 0) {
      return res.status(400).json({ message: 'No valid team members found in the uploaded file.' });
    }

    const isPreview = req.query.preview === 'true';
    if (isPreview) {
      return res.json({
        message: `Successfully parsed ${parsedMembers.length} team members from spreadsheet.`,
        count: parsedMembers.length,
        preview: parsedMembers,
      });
    }

    // Direct commit / Upsert into MongoDB
    if (isMongoConnected()) {
      for (const m of parsedMembers) {
        await Team.findOneAndUpdate(
          { name: m.name },
          { $set: m },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    // Merge into dbAdapter local storage
    const currentList = dbAdapter.find('team') || [];
    for (const m of parsedMembers) {
      const idx = currentList.findIndex(
        (existing) => existing.name && existing.name.toLowerCase().trim() === m.name.toLowerCase().trim()
      );
      if (idx !== -1) {
        dbAdapter.findByIdAndUpdate('team', currentList[idx].id || currentList[idx]._id, m);
      } else {
        dbAdapter.create('team', m);
      }
    }

    const finalTeam = isMongoConnected() ? await Team.find({}).lean() : dbAdapter.find('team');

    return res.json({
      message: `Successfully imported ${parsedMembers.length} team members into MongoDB Atlas & database.`,
      count: parsedMembers.length,
      team: finalTeam,
    });
  } catch (err) {
    console.error('Excel import error:', err);
    return res.status(500).json({ message: 'Failed to process Excel file', error: err.message });
  }
}
