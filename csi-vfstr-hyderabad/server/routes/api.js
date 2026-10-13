import express from 'express';
import rateLimit from 'express-rate-limit';
import { upload } from '../config/storage.js';
import { authenticateToken } from '../middleware/auth.js';

import * as authController from '../controllers/authController.js';
import * as teamController from '../controllers/teamController.js';
import * as facultyController from '../controllers/facultyController.js';
import * as studentsController from '../controllers/studentsController.js';
import * as eventsController from '../controllers/eventsController.js';
import * as galleryController from '../controllers/galleryController.js';
import * as projectsController from '../controllers/projectsController.js';
import * as magazineController from '../controllers/magazineController.js';
import * as announcementsController from '../controllers/announcementsController.js';
import * as membershipController from '../controllers/membershipController.js';
import * as contactController from '../controllers/contactController.js';
import * as settingsController from '../controllers/settingsController.js';

const router = express.Router();

// Rate limiter for authentication endpoint (protect against brute-force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' }
});

// Rate limiter for public forms (protect against spam bots)
const formSubmissionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // limit each IP to 20 form submissions per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many submissions from this network. Please try again shortly.' }
});

// --- Authentication ---
router.post('/auth/login', authLimiter, authController.login);
router.get('/auth/me', authenticateToken, authController.getMe);
router.put('/auth/change-password', authenticateToken, authController.changePassword);

// --- Settings & Overview ---
router.get('/settings', settingsController.getSettings);
router.put('/settings', authenticateToken, settingsController.updateSettings);
router.get('/overview', authenticateToken, settingsController.getDashboardOverview);

// --- Faculty Database ---
router.get('/faculty', facultyController.getAllFaculty);
router.get('/faculty/:id', facultyController.getFacultyMember);
router.post('/faculty', authenticateToken, upload.single('photo'), facultyController.createFacultyMember);
router.put('/faculty/:id', authenticateToken, upload.single('photo'), facultyController.updateFacultyMember);
router.delete('/faculty/:id', authenticateToken, facultyController.deleteFacultyMember);
router.post('/faculty/import-excel', authenticateToken, upload.single('file'), facultyController.importFacultyExcel);

// --- Students Database ---
router.get('/students', studentsController.getAllStudents);
router.get('/students/:id', studentsController.getStudentMember);
router.post('/students', authenticateToken, upload.single('photo'), studentsController.createStudentMember);
router.put('/students/:id', authenticateToken, upload.single('photo'), studentsController.updateStudentMember);
router.delete('/students/:id', authenticateToken, studentsController.deleteStudentMember);
router.post('/students/import-excel', authenticateToken, upload.single('file'), studentsController.importStudentsExcel);

// --- Team Members (Legacy/Unified) ---
router.get('/team', teamController.getAllTeam);
router.get('/team/:id', teamController.getTeamMember);
router.post('/team', authenticateToken, upload.single('photo'), teamController.createTeamMember);
router.put('/team/:id', authenticateToken, upload.single('photo'), teamController.updateTeamMember);
router.delete('/team/:id', authenticateToken, teamController.deleteTeamMember);
router.post('/team/import-excel', authenticateToken, upload.single('file'), teamController.importTeamExcel);

// --- Events ---
router.get('/events', eventsController.getAllEvents);
router.get('/events/:id', eventsController.getEventById);
router.post(
  '/events',
  authenticateToken,
  upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'galleryImages', maxCount: 150 }
  ]),
  eventsController.createEvent
);
router.put(
  '/events/:id',
  authenticateToken,
  upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'galleryImages', maxCount: 150 }
  ]),
  eventsController.updateEvent
);
router.delete('/events/:id', authenticateToken, eventsController.deleteEvent);

// --- Gallery Albums ---
router.get('/gallery', galleryController.getAllAlbums);
router.get('/gallery/:id', galleryController.getAlbumById);
router.post('/gallery', authenticateToken, upload.array('images', 300), galleryController.createAlbum);
router.post('/gallery/:id/images', authenticateToken, upload.array('images', 300), galleryController.addImagesToAlbum);
router.delete('/gallery/:id/images/:imageId', authenticateToken, galleryController.deleteImageFromAlbum);
router.delete('/gallery/:id', authenticateToken, galleryController.deleteAlbum);

// --- Projects ---
router.get('/projects', projectsController.getAllProjects);
router.post('/projects', authenticateToken, upload.single('image'), projectsController.createProject);
router.put('/projects/:id', authenticateToken, upload.single('image'), projectsController.updateProject);
router.delete('/projects/:id', authenticateToken, projectsController.deleteProject);

// --- Magazine & Publications ---
router.get('/publications', magazineController.getAllPublications);
router.post(
  '/publications',
  authenticateToken,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]),
  magazineController.createPublication
);
router.delete('/publications/:id', authenticateToken, magazineController.deletePublication);

// --- Announcements ---
router.get('/announcements', announcementsController.getAllAnnouncements);
router.post('/announcements', authenticateToken, announcementsController.createAnnouncement);
router.put('/announcements/:id', authenticateToken, announcementsController.updateAnnouncement);
router.delete('/announcements/:id', authenticateToken, announcementsController.deleteAnnouncement);

// --- Membership Requests ---
router.post('/memberships', formSubmissionLimiter, membershipController.submitMembership);
router.get('/memberships', authenticateToken, membershipController.getAllMemberships);
router.put('/memberships/:id', authenticateToken, membershipController.updateMembershipStatus);
router.delete('/memberships/:id', authenticateToken, membershipController.deleteMembership);

// --- Contact Messages ---
router.post('/contact', formSubmissionLimiter, contactController.submitContactMessage);
router.get('/contact', authenticateToken, contactController.getAllMessages);
router.put('/contact/:id/read', authenticateToken, contactController.markMessageRead);
router.delete('/contact/:id', authenticateToken, contactController.deleteMessage);

export default router;
