import { dbAdapter } from '../services/dbAdapter.js';

export function getSettings(req, res) {
  try {
    const settings = dbAdapter.getSettings();
    return res.json(settings);
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving settings' });
  }
}

export function updateSettings(req, res) {
  try {
    const updated = dbAdapter.updateSettings(req.body);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Error updating settings', error: err.message });
  }
}

export function getDashboardOverview(req, res) {
  try {
    const events = dbAdapter.find('events');
    const faculty = dbAdapter.find('faculty') || [];
    const students = dbAdapter.find('students') || [];
    const team = dbAdapter.find('team') || [];
    const gallery = dbAdapter.find('gallery');
    const projects = dbAdapter.find('projects');
    const publications = dbAdapter.find('publications');
    const memberships = dbAdapter.find('memberships');
    const messages = dbAdapter.find('messages');

    const upcomingEvents = events.filter((e) => e.status && e.status.toLowerCase() === 'upcoming').length;
    const pendingMemberships = memberships.filter((m) => m.status === 'Pending').length;
    const unreadMessages = messages.filter((m) => !m.isRead).length;

    return res.json({
      counts: {
        totalEvents: events.length,
        upcomingEvents,
        totalFaculty: faculty.length,
        totalStudents: students.length,
        totalTeam: faculty.length + students.length || team.length,
        totalGalleryAlbums: gallery.length,
        totalProjects: projects.length,
        totalPublications: publications.length,
        totalMemberships: memberships.length,
        pendingMemberships,
        totalMessages: messages.length,
        unreadMessages
      },
      recentEvents: events.slice(0, 5),
      recentMemberships: memberships.slice(0, 5),
      recentMessages: messages.slice(0, 5)
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving dashboard overview' });
  }
}
