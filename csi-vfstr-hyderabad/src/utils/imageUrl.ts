import { API_BASE_URL } from '../services/api';

/**
 * Resolves any image URL (whether relative like '/uploads/xyz.jpg' or full URL)
 * into a fully-qualified URL pointing to the active backend server.
 */
export function getImageUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return '';
  const trimmed = String(pathOrUrl).trim();
  if (!trimmed) return '';

  // Return immediately if already absolute, blob, data URI
  if (/^(https?:|\/\/|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  // Ensure clean leading slash
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  // If path is a local public asset like /assets/... or /vite.svg
  if (cleanPath.startsWith('/assets/')) {
    return cleanPath;
  }

  // If path is an uploaded asset (/uploads/...)
  if (cleanPath.startsWith('/uploads/')) {
    try {
      if (API_BASE_URL && API_BASE_URL.startsWith('http')) {
        const urlObj = new URL(API_BASE_URL);
        return `${urlObj.origin}${cleanPath}`;
      }
    } catch {
      // fallback to relative path
    }
  }

  return cleanPath;
}

export const FALLBACK_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

export const FALLBACK_PROJECT_IMAGE =
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';

export const FALLBACK_MAGAZINE_IMAGE =
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
