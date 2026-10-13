import React, { useState, useEffect } from 'react';
import { magazineService } from '../services/api';
import { PublicationItem } from '../types';
import {
  BookOpen,
  Download,
  Eye,
  Calendar,
  FileText,
  Sparkles
} from 'lucide-react';
import { getImageUrl, FALLBACK_MAGAZINE_IMAGE } from '../utils/imageUrl';

export const Magazine: React.FC = () => {
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    magazineService.getAll()
      .then((data) => setPublications(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-50 py-12 min-h-[85vh]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            Literature & Reports
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900">
            Magazine & Publications
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Annual chapter magazines, technical newsletters, symposium proceeding reports, and event summaries.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : publications.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Publications Released Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Chapter magazines and newsletters will be available for online reading and download here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {publications.map((pub) => (
              <div
                key={pub.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Cover Image */}
                <div className="relative h-64 bg-slate-900 overflow-hidden">
                  {pub.coverImage ? (
                    <img
                      src={pub.coverImage}
                      alt={pub.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center tech-grid-bg text-slate-400 p-6 text-center">
                      <FileText className="w-12 h-12 text-cyan-400/50 mb-2" />
                      <span className="text-xs font-semibold text-slate-300">{pub.category || 'CSI Publication'}</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md">
                      {pub.category || 'Publication'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{pub.date}</span>
                    </div>

                    <h3 className="text-lg font-display font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                      {pub.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {pub.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    {pub.fileUrl ? (
                      <>
                        <a
                          href={pub.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Read Online</span>
                        </a>

                        <a
                          href={pub.fileUrl}
                          download
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all hover:scale-105 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </a>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Document link pending</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
