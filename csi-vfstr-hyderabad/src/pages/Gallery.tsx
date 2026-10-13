import React, { useState, useEffect } from 'react';
import { galleryService } from '../services/api';
import { GalleryAlbum, GalleryImage } from '../types';
import {
  Images,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Layers
} from 'lucide-react';
import { getImageUrl, FALLBACK_EVENT_IMAGE } from '../utils/imageUrl';

export const Gallery: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('All');
  const [activeLightboxImage, setActiveLightboxImage] = useState<{
    url: string;
    title?: string;
    albumTitle?: string;
    index: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    galleryService.getAll()
      .then((data) => setAlbums(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Collect all images or filtered images
  const allImagesWithMeta = albums.flatMap((album) =>
    (album.images || []).map((img) => ({
      ...img,
      albumId: album.id,
      albumTitle: album.title,
      eventName: album.eventName,
      albumDate: album.date
    }))
  );

  const displayedImages =
    selectedAlbumId === 'All'
      ? allImagesWithMeta
      : allImagesWithMeta.filter((img) => img.albumId === selectedAlbumId);

  const openLightbox = (index: number) => {
    const item = displayedImages[index];
    if (item) {
      setActiveLightboxImage({
        url: item.url,
        title: item.title,
        albumTitle: item.albumTitle,
        index,
        total: displayedImages.length
      });
    }
  };

  const nextLightboxImage = () => {
    if (!activeLightboxImage) return;
    const nextIdx = (activeLightboxImage.index + 1) % displayedImages.length;
    openLightbox(nextIdx);
  };

  const prevLightboxImage = () => {
    if (!activeLightboxImage) return;
    const prevIdx = (activeLightboxImage.index - 1 + displayedImages.length) % displayedImages.length;
    openLightbox(prevIdx);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeLightboxImage) return;
      if (e.key === 'Escape') setActiveLightboxImage(null);
      if (e.key === 'ArrowRight') nextLightboxImage();
      if (e.key === 'ArrowLeft') prevLightboxImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxImage]);

  return (
    <div className="bg-slate-50 py-12 min-h-[85vh]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            Moments & Archives
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900">
            CSI Photo Gallery
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Glimpses of hackathons, orientations, workshops, and chapter milestones captured through the lens.
          </p>
        </div>

        {/* Album Selector Pills */}
        {albums.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setSelectedAlbumId('All')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedAlbumId === 'All'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Photos ({allImagesWithMeta.length})
            </button>
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => setSelectedAlbumId(album.id)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedAlbumId === album.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {album.title} ({album.images?.length || 0})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="aspect-square rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : displayedImages.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
            <Images className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Gallery Photos Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Photos uploaded by administrators for albums and events will appear here in high resolution.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedImages.map((img, idx) => (
              <div
                key={img.id || idx}
                onClick={() => openLightbox(idx)}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 aspect-[4/3] cursor-pointer"
              >
                <img
                  src={getImageUrl(img.url)}
                  alt={img.title || 'CSI Gallery Photo'}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_EVENT_IMAGE;
                  }}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
                  <div className="flex justify-end">
                    <span className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
                      <Maximize2 className="w-4 h-4 text-white" />
                    </span>
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded bg-cyan-500 text-navy-950 font-bold text-[10px] uppercase tracking-wider mb-1 inline-block">
                      {img.albumTitle}
                    </span>
                    <p className="text-xs font-semibold truncate">{img.title || img.eventName || 'Event Photo'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeLightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => setActiveLightboxImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation buttons */}
          <button
            onClick={prevLightboxImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-50"
            aria-label="Previous Photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextLightboxImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors z-50"
            aria-label="Next Photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Centered Image View */}
          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
            <img
              src={getImageUrl(activeLightboxImage.url)}
              alt={activeLightboxImage.title || 'CSI Photo'}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_EVENT_IMAGE;
              }}
            />
            <div className="mt-4 text-center text-white">
              <p className="font-display font-bold text-sm sm:text-base">
                {activeLightboxImage.title || activeLightboxImage.albumTitle}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Photo {activeLightboxImage.index + 1} of {activeLightboxImage.total}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
