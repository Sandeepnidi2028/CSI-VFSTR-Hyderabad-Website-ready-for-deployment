import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase, isMongoConnected } from '../config/database.js';
import { Team } from '../models/Team.js';
import { dbAdapter } from '../services/dbAdapter.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const removeNames = [
  'Dr. V. Baby',
  'Dr. C. Kiran Mai',
  'Dr. S. Nagini',
  'Dr. N. Sandeep Chaitanya',
  'Mr. SK Saddam Hussain',
];

async function removeFaculty() {
  await connectDatabase();

  console.log('Removing faculty members:', removeNames);

  // 1. Remove from MongoDB Atlas
  if (isMongoConnected()) {
    const res = await Team.deleteMany({
      name: { $in: removeNames },
    });
    console.log(`✅ Removed ${res.deletedCount} faculty members from MongoDB Atlas.`);
  }

  // 2. Remove from dbAdapter / db.json
  const currentDbTeam = dbAdapter.find('team');
  const filteredDbTeam = currentDbTeam.filter((m) => !removeNames.includes(m.name));
  dbAdapter.replaceMany('team', filteredDbTeam);
  console.log(`✅ Removed faculty members from db.json. New count: ${filteredDbTeam.length}`);

  // 3. Remove temporary photo files
  const photoFiles = [
    'dr_v_baby.jpg',
    'dr_c_kiran_mai.jpg',
    'dr_s_nagini.jpg',
    'dr_n_sandeep_chaitanya.jpg',
    'mr_sk_saddam_hussain.jpg',
  ];
  for (const f of photoFiles) {
    const p = path.resolve(__dirname, `../uploads/${f}`);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`Deleted ${f}`);
    }
  }

  await mongoose.disconnect();
}

removeFaculty();
