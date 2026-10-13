import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Team } from './pages/Team';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Gallery } from './pages/Gallery';
import { Projects } from './pages/Projects';
import { Magazine } from './pages/Magazine';
import { Membership } from './pages/Membership';
import { Contact } from './pages/Contact';

import { ProtectedRoute } from './components/common/ProtectedRoute';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminTeam } from './pages/admin/AdminTeam';
import { AdminFaculty } from './pages/admin/AdminFaculty';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminGallery } from './pages/admin/AdminGallery';
import { AdminProjects } from './pages/admin/AdminProjects';
import { AdminMagazine } from './pages/admin/AdminMagazine';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminMembership } from './pages/admin/AdminMembership';
import { AdminContactMessages } from './pages/admin/AdminContactMessages';
import { AdminSettings } from './pages/admin/AdminSettings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Navbar & Footer */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="team" element={<Team />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="projects" element={<Projects />} />
          <Route path="magazine" element={<Magazine />} />
          <Route path="membership" element={<Membership />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Admin Login (Standalone) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="faculty" element={<AdminFaculty />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="magazine" element={<AdminMagazine />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="memberships" element={<AdminMembership />} />
          <Route path="messages" element={<AdminContactMessages />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
