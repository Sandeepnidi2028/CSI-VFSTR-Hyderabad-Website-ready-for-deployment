import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Images, ArrowRight } from 'lucide-react';
import { galleryService } from '../../services/api';
import { GalleryAlbum } from '../../types';
import { getImageUrl, FALLBACK_EVENT_IMAGE } from '../../utils/imageUrl';

export const GalleryPreview: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    galleryService.getAll()
      .then((data) => {
        setAlbums(data.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && albums.length === 0) {
    return null; // Keep clean if no albums uploaded yet
  }

  return (
    <section className="py-20 bg-slate-100/60 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Moments & Memories
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-slate-900">
              Campus Photo Gallery
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Highlights from student hackathons, symposiums, orientations, and technical sessions.
            </p>
          </div>
          <Link
            to="/gallery"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 group"
          >
            <span>View Full Gallery</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {albums.map((album) => (
            <Link
              key={album.id}
              to="/gallery"
              className="group relative rounded-2xl overflow-hidden bg-navy-900 shadow-md hover:shadow-2xl transition-all duration-300 aspect-[4/3] flex items-end p-6"
            >
              {album.coverImage ? (
                <img
                  src={getImageUrl(album.coverImage)}
                  alt={album.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-90"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_EVENT_IMAGE;
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-navy-900 via-navy-800 to-blue-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="relative z-10">
                <span className="px-2.5 py-1 rounded-md bg-cyan-500 text-navy-950 font-bold text-[10px] uppercase tracking-wider mb-2 inline-block">
                  {album.eventName || 'Album'}
                </span>
                <h3 className="font-display font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
                  {album.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {album.images?.length || 0} Photos {album.date ? `• ${album.date}` : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
