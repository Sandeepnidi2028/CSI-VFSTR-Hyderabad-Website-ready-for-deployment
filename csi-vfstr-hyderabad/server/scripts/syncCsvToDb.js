import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDatabase, isMongoConnected } from '../config/database.js';
import { Team } from '../models/Team.js';
import { dbAdapter } from '../services/dbAdapter.js';
import { parseTeamExcel } from '../services/excelParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncCsv() {
  const csvPath = path.resolve(__dirname, '../uploads/CSI_-_managing_community_-_Sheet1-1790966779649-821175366.csv');
  console.log(`Reading CSV from ${csvPath}...`);

  const members = parseTeamExcel(csvPath);
  console.log(`Parsed ${members.length} members from CSV.`);

  await connectDatabase();

  if (isMongoConnected()) {
    console.log('Syncing MongoDB Atlas collection "team"...');
    await Team.deleteMany({});
    const inserted = await Team.insertMany(members);
    console.log(`✅ Inserted ${inserted.length} members into MongoDB Atlas.`);
  } else {
    console.warn('⚠️ MongoDB Atlas is not connected; skipping Atlas sync.');
  }

  // Update local db.json
  dbAdapter.replaceMany('team', members);
  console.log('✅ Updated db.json with clean roster.');

  console.log('\n--- VERIFICATION SAMPLE ---');
  const sampleNames = ['N.sandeep', 'Panduri Sai Teja', 'Kaduduri Abhiram', 'Manohar pvsm'];
  for (const name of sampleNames) {
    const found = members.find((m) => m.name.toLowerCase().includes(name.toLowerCase()));
    if (found) {
      console.log(`• ${found.name}: Role = "${found.position}", Dept = "${found.department}"`);
    }
  }

  await mongoose.disconnect();
  console.log('\n🎉 CSV changes successfully synced to database!');
}

syncCsv().catch((err) => {
  console.error('Error syncing CSV:', err);
  process.exit(1);
});
