import axios from 'axios';
import {
  TeamMember,
  EventItem,
  GalleryAlbum,
  ProjectItem,
  PublicationItem,
  AnnouncementItem,
  MembershipSubmission,
  ContactMessageItem,
  WebsiteSettings,
  AdminUser
} from '../types';

const API_BASE_URL = 'https://csi-vfstr-hyderabad-website-ready-for-6pwm.onrender.com/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach Authorization header if token exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('csi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected route, clean token
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('csi_token');
        localStorage.removeItem('csi_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth Service ---
export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    const res = await apiClient.post<{ token: string; admin: AdminUser }>('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('csi_token', res.data.token);
      localStorage.setItem('csi_user', JSON.stringify(res.data.admin));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('csi_token');
    localStorage.removeItem('csi_user');
  },
  getCurrentUser: (): AdminUser | null => {
    const raw = localStorage.getItem('csi_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  getMe: async () => {
    const res = await apiClient.get<{ admin: AdminUser }>('/auth/me');
    return res.data.admin;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('csi_token');
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await apiClient.put<{ message: string }>('/auth/change-password', data);
    return res.data;
  }
};

// --- Settings & Overview Service ---
export const settingsService = {
  getSettings: async () => {
    const res = await apiClient.get<WebsiteSettings>('/settings');
    return res.data;
  },
  updateSettings: async (settings: Partial<WebsiteSettings>) => {
    const res = await apiClient.put<WebsiteSettings>('/settings', settings);
    return res.data;
  },
  getOverview: async () => {
    const res = await apiClient.get('/overview');
    return res.data;
  }
};

// --- Team Service ---
export const teamService = {
  getAll: async () => {
    const res = await apiClient.get<TeamMember[]>('/team');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<TeamMember>(`/team/${id}`);
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await apiClient.post<TeamMember>('/team', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  update: async (id: string, formData: FormData) => {
    const res = await apiClient.put<TeamMember>(`/team/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/team/${id}`);
    return res.data;
  },
  importExcel: async (file: File, preview = false) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post(`/team/import-excel?preview=${preview}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};

// --- Events Service ---
export const eventsService = {
  getAll: async (params?: { category?: string; status?: string }) => {
    const res = await apiClient.get<EventItem[]>('/events', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<EventItem>(`/events/${id}`);
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await apiClient.post<EventItem>('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  update: async (id: string, formData: FormData) => {
    const res = await apiClient.put<EventItem>(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/events/${id}`);
    return res.data;
  }
};

// --- Gallery Service ---
export const galleryService = {
  getAll: async () => {
    const res = await apiClient.get<GalleryAlbum[]>('/gallery');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<GalleryAlbum>(`/gallery/${id}`);
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await apiClient.post<GalleryAlbum>('/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  addImages: async (albumId: string, formData: FormData) => {
    const res = await apiClient.post<GalleryAlbum>(`/gallery/${albumId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  deleteImage: async (albumId: string, imageId: string) => {
    const res = await apiClient.delete(`/gallery/${albumId}/images/${imageId}`);
    return res.data;
  },
  deleteAlbum: async (albumId: string) => {
    const res = await apiClient.delete(`/gallery/${albumId}`);
    return res.data;
  }
};

// --- Projects Service ---
export const projectsService = {
  getAll: async () => {
    const res = await apiClient.get<ProjectItem[]>('/projects');
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await apiClient.post<ProjectItem>('/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  update: async (id: string, formData: FormData) => {
    const res = await apiClient.put<ProjectItem>(`/projects/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/projects/${id}`);
    return res.data;
  }
};

// --- Magazine Service ---
export const magazineService = {
  getAll: async () => {
    const res = await apiClient.get<PublicationItem[]>('/publications');
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await apiClient.post<PublicationItem>('/publications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/publications/${id}`);
    return res.data;
  }
};

// --- Announcements Service ---
export const announcementsService = {
  getAll: async () => {
    const res = await apiClient.get<AnnouncementItem[]>('/announcements');
    return res.data;
  },
  create: async (data: Partial<AnnouncementItem>) => {
    const res = await apiClient.post<AnnouncementItem>('/announcements', data);
    return res.data;
  },
  update: async (id: string, data: Partial<AnnouncementItem>) => {
    const res = await apiClient.put<AnnouncementItem>(`/announcements/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/announcements/${id}`);
    return res.data;
  }
};

// --- Membership Service ---
export const membershipService = {
  submit: async (data: MembershipSubmission) => {
    const res = await apiClient.post('/memberships', data);
    return res.data;
  },
  getAll: async () => {
    const res = await apiClient.get<MembershipSubmission[]>('/memberships');
    return res.data;
  },
  updateStatus: async (id: string, status: string, notes?: string) => {
    const res = await apiClient.put(`/memberships/${id}`, { status, notes });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/memberships/${id}`);
    return res.data;
  }
};

// --- Contact Service ---
export const contactService = {
  submit: async (data: { name: string; email: string; subject: string; message: string }) => {
    const res = await apiClient.post('/contact', data);
    return res.data;
  },
  getAll: async () => {
    const res = await apiClient.get<ContactMessageItem[]>('/contact');
    return res.data;
  },
  markRead: async (id: string, isRead = true) => {
    const res = await apiClient.put(`/contact/${id}/read`, { isRead });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/contact/${id}`);
    return res.data;
  }
};
