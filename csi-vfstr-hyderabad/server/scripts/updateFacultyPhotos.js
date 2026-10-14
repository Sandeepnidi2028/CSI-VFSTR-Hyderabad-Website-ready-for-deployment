import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { connectDatabase } from '../config/database.js';
import mongoose from 'mongoose';
import { dbAdapter } from '../services/dbAdapter.js';

async function updatePhotos() {
  await connectDatabase();

  const facultyMap = {
    'Dr. Ch .Raja Ramesh': '/assets/faculty/dr_ch_raja_ramesh.jpg',
    'Dr. Madhuri Gummineni': '/assets/faculty/dr_madhuri_gummineni.jpg',
    'Ms. B.Swathi': '/assets/faculty/ms_b_swathi.jpg',
    'Dr. K.B Manikandan': '/assets/faculty/dr_kb_manikandan.jpg',
    'Dr. Pawan Kumar Chauhan': '/assets/faculty/dr_pawan_kumar_chauhan.jpg'
  };

  const facultyColl = mongoose.connection.db.collection('faculty');
  const teamColl = mongoose.connection.db.collection('team');

  for (const [name, photo] of Object.entries(facultyMap)) {
    await facultyColl.updateOne({ name }, { $set: { photo } });
    await teamColl.updateOne({ name }, { $set: { photo } });

    const localF = dbAdapter.find('faculty', { name })[0];
    if (localF) {
      dbAdapter.findByIdAndUpdate('faculty', localF.id || localF._id, { photo });
    }
    const localT = dbAdapter.find('team', { name })[0];
    if (localT) {
      dbAdapter.findByIdAndUpdate('team', localT.id || localT._id, { photo });
    }
  }

  const list = await facultyColl.find({}).toArray();
  console.log('Updated Faculty Photos in MongoDB:');
  list.forEach((f) => console.log(f.name, '=>', f.photo));

  await mongoose.disconnect();
  console.log('Done!');
}

updatePhotos().catch((err) => {
  console.error(err);
  process.exit(1);
});
