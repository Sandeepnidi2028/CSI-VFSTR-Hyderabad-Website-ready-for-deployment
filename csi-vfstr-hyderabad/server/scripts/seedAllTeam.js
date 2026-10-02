import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase, isMongoConnected } from '../config/database.js';
import { Team } from '../models/Team.js';
import { dbAdapter } from '../services/dbAdapter.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fullTeamList = [
  // Faculty Committee
  {
    name: 'Dr. V. Baby',
    position: 'Head of the Department',
    department: 'Department of CSE',
    year: 'Faculty',
    photo: '/uploads/dr_v_baby.jpg',
  },
  {
    name: 'Dr. C. Kiran Mai',
    position: 'Faculty Advisor',
    department: 'CSI Student Branch Chapter',
    year: 'Faculty',
    photo: '/uploads/dr_c_kiran_mai.jpg',
  },
  {
    name: 'Dr. S. Nagini',
    position: 'Faculty Advisor',
    department: 'CSI Student Branch Chapter',
    year: 'Faculty',
    photo: '/uploads/dr_s_nagini.jpg',
  },
  {
    name: 'Dr. N. Sandeep Chaitanya',
    position: 'Faculty Coordinator',
    department: 'CSI Student Branch Chapter',
    year: 'Faculty',
    photo: '/uploads/dr_n_sandeep_chaitanya.jpg',
  },
  {
    name: 'Mr. SK Saddam Hussain',
    position: 'Faculty Coordinator',
    department: 'CSI Student Branch Chapter',
    year: 'Faculty',
    photo: '/uploads/mr_sk_saddam_hussain.jpg',
  },

  // Student Committee: Leadership
  {
    name: 'UJWAL SINGH',
    position: 'President',
    department: 'CSE',
    year: 'B.Tech',
    photo: '/uploads/Gemini_Generated_Image_kvzllykvzllykvzl_-_ujwal_singh-1789755714050-399899217.png',
  },
  {
    name: 'DHANVI MALPANI',
    position: 'Vice President',
    department: 'CSE',
    year: 'B.Tech',
    photo: '',
  },
  {
    name: 'VISHNU',
    position: 'Secretary',
    department: 'CSE',
    year: 'B.Tech',
    photo: '/uploads/file_0000000043ac81f7863b4121cab2c443_-_Vishnu_Gunda-1789755966475-494751980.png',
  },
  {
    name: 'DEEPAK CHAND',
    position: 'Joint Secretary',
    department: 'CSE',
    year: 'B.Tech',
    photo: '/uploads/96532__1__-_Deepak_chand_Thota-1789755974801-327786966.jpg',
  },
  {
    name: 'AHMAD Fraz',
    position: 'Treasurer',
    department: 'CSE',
    year: 'B.Tech',
    photo: '/uploads/file_00000000bb7081f9b35b67ec2f93d390_-_Ahmad_Fraz-1789755998638-344449767.png',
  },

  // Event Coordinators
  {
    name: 'EKSHITH',
    position: 'Event Coordinator',
    department: 'CSE',
    year: 'B.Tech',
    photo: '/uploads/Gemini_Generated_Image_97y4t197y4t197y4_-_B_Ekshith_Reddy-1789755986884-601955685.png',
  },
  {
    name: 'LASYA',
    position: 'Event Coordinator',
    department: 'CSE',
    year: 'B.Tech',
    photo: '/uploads/Screenshot_2026-03-08_164746_-_lasya_p-1789756006429-373307521.png',
  },
  {
    name: 'RUPIKA',
    position: 'Event Coordinator',
    department: 'CSE',
    year: 'B.Tech',
    photo: '/uploads/IMG-20260308-WA0001_-_Rupika_Sri-1789756015502-365287661.jpg',
  },
  {
    name: 'VENKATESHWAR',
    position: 'Event Coordinator',
    department: 'CSE',
    year: 'B.Tech',
    photo: '',
  },

  // Executive Committee
  {
    name: 'Abhiram',
    position: 'Executive Committee',
    department: 'CSE',
    year: 'B.Tech',
    photo: '/uploads/file_00000000021c81f7bb0d2d3ce6bdf87f_-_Abhiram_Chilukuri-1789756031733-518290352.png',
  },
  {
    name: 'ASHWIK',
    position: 'Executive Committee',
    department: 'CSE',
    year: 'B.Tech',
    photo: '/uploads/IMG_20260308_163821_-_Ashwik_Reddy-1789756041074-958444738.jpg',
  },
  {
    name: 'RAMALAXMI',
    position: 'Executive Committee',
    department: 'CSE',
    year: 'B.Tech',
    photo: '',
  },
  {
    name: 'SIRIVENNELA',
    position: 'Executive Committee',
    department: 'CSE',
    year: 'B.Tech',
    photo: '',
  },
  {
    name: 'SRIKAR',
    position: 'Executive Committee',
    department: 'CSE',
    year: 'B.Tech',
    photo: '',
  },

  // Media Team
  {
    name: 'SANDEEP',
    position: 'Media Team',
    department: 'CSE',
    year: 'B.Tech',
    photo: '/uploads/file_0000000011ec81f99c23577dcf645a4a_-_Sandeep_Nidigonda-1789756023770-496541527.png',
  },

  // Student Volunteers
  { name: 'Hemanth', position: 'Student Volunteer', department: 'CSE', year: 'B.Tech', photo: '' },
  { name: 'Manohar pvsm', position: 'Student Volunteer', department: 'CSE', year: 'B.Tech', photo: '' },
  { name: 'Nishant', position: 'Student Volunteer', department: 'CSE', year: 'B.Tech', photo: '' },
  { name: 'SAI TEJA', position: 'Student Volunteer', department: 'CSE', year: 'B.Tech', photo: '' },
  { name: 'SAIVENDAR', position: 'Student Volunteer', department: 'CSE', year: 'B.Tech', photo: '' },
  { name: 'Santosh', position: 'Student Volunteer', department: 'CSE', year: 'B.Tech', photo: '' },
  { name: 'Shiva sai', position: 'Student Volunteer', department: 'CSE', year: 'B.Tech', photo: '' },
  { name: 'SWAKSHA', position: 'Student Volunteer', department: 'CSE', year: 'B.Tech', photo: '' },
  { name: 'YASHWAN', position: 'Student Volunteer', department: 'CSE', year: 'B.Tech', photo: '' },
  { name: 'YUVRAJ', position: 'Student Volunteer', department: 'CSE', year: 'B.Tech', photo: '' },
];

async function seed() {
  await connectDatabase();

  console.log(`Seeding ${fullTeamList.length} members...`);

  if (isMongoConnected()) {
    for (const m of fullTeamList) {
      await Team.findOneAndUpdate(
        { name: m.name },
        { $set: m },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    const count = await Team.countDocuments();
    console.log(`✅ MongoDB Atlas populated with ${count} team members!`);
  }

  // Also replace in dbAdapter / db.json
  dbAdapter.replaceMany('team', fullTeamList);
  console.log(`✅ db.json populated with ${fullTeamList.length} team members!`);

  await mongoose.disconnect();
}

seed();
