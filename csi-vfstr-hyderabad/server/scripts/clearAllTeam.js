import 'dotenv/config';
import { connectDatabase, isMongoConnected } from '../config/database.js';
import { Team } from '../models/Team.js';
import { dbAdapter } from '../services/dbAdapter.js';
import mongoose from 'mongoose';

async function clearAllTeam() {
  await connectDatabase();

  console.log('Clearing team records for fresh import...');

  // 1. Clear MongoDB Atlas team collection
  if (isMongoConnected()) {
    const res = await Team.deleteMany({});
    console.log(`✅ Cleared ${res.deletedCount} members from MongoDB Atlas 'team' collection.`);
  }

  // 2. Clear local dbAdapter / db.json
  dbAdapter.replaceMany('team', []);
  console.log('✅ Cleared team array in db.json.');

  await mongoose.disconnect();
  console.log('🎉 Database is now completely clean and ready for your new CSV/Excel upload!');
}

clearAllTeam();
