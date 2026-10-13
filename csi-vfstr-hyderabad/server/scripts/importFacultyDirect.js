import { parseTeamExcel } from '../services/excelParser.js';
import { dbAdapter } from '../services/dbAdapter.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Team from '../models/Team.js';
import { connectDatabase, isMongoConnected } from '../config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  const csvPath = 'F:/vignan CSI/FACULTY/FACULTY.csv';
  console.log('Reading from:', csvPath);
  const members = parseTeamExcel(csvPath);
  console.log(`Parsed ${members.length} members:`);
  console.log(JSON.stringify(members, null, 2));

  // Merge into local dbAdapter
  const currentList = dbAdapter.find('team') || [];
  for (const m of members) {
    const idx = currentList.findIndex(
      (existing) => existing.name && existing.name.toLowerCase().trim() === m.name.toLowerCase().trim()
    );
    if (idx !== -1) {
      dbAdapter.findByIdAndUpdate('team', currentList[idx].id || currentList[idx]._id, m);
    } else {
      dbAdapter.create('team', m);
    }
  }
  console.log('Local dbAdapter team count:', dbAdapter.find('team').length);

  // Merge into MongoDB Atlas
  const connected = await connectDatabase();
  if (connected) {
    for (const m of members) {
      await Team.findOneAndUpdate(
        { name: m.name },
        { $set: m },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    const mongoCount = await Team.countDocuments();
    console.log('MongoDB team count:', mongoCount);
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
  console.log('Done!');
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
