import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsService } from '../services/api';
import { EventItem } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Trophy,
  CheckCircle,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import { getImageUrl, FALLBACK_EVENT_IMAGE } from '../utils/imageUrl';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      eventsService.getById(id)
        .then((data) => setEvent(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="h-64 rounded-3xl bg-slate-200 animate-pulse mb-6" />
        <div className="h-8 bg-slate-200 rounded w-1/2 mx-auto animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Event Not Found</h2>
        <p className="text-slate-500 text-sm mt-2 mb-6">The requested event could not be located.</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>
      </div>
    );
  }

  const isCompleted = event.status?.toLowerCase() === 'completed';

  return (
    <div className="bg-slate-50 py-12 min-h-[90vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>

        {/* Hero Card with Banner */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md mb-10">
          {/* Banner */}
          <div className="relative h-64 sm:h-96 bg-navy-900 overflow-hidden">
            {event.poster ? (
              <img
                src={getImageUrl(event.poster)}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_EVENT_IMAGE;
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center tech-grid-bg text-slate-400 p-8 text-center">
                <Sparkles className="w-16 h-16 text-cyan-400/40 mb-3" />
                <h3 className="text-xl font-bold text-white">CSI VFSTR Event</h3>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md">
                {event.category}
              </span>
              <span
                className={`px-3.5 py-1 rounded-full text-xs font-bold shadow-md ${
                  isCompleted ? 'bg-slate-700 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {event.status}
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold leading-tight">
                {event.title}
              </h1>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm font-medium text-slate-700">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{event.date}</span>
            </div>
            {event.time && (
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{event.time}</span>
              </div>
            )}
            {event.venue && (
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{event.venue}</span>
              </div>
            )}
          </div>

          {/* Description & Action */}
          <div className="p-8 sm:p-10 space-y-8">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900 mb-4">
                About the Event
              </h2>
              <div className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {event.description || event.shortDescription}
              </div>
            </div>

            {/* Registration CTA (if upcoming/ongoing) */}
            {!isCompleted && event.registrationLink && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-navy-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    Registrations are currently open!
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Secure your seat and receive certification upon participation.
                  </p>
                </div>
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-navy-950 font-bold text-sm shadow-md transition-colors inline-flex items-center gap-2 shrink-0"
                >
                  <span>Register for Event</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 mb-3">
                  Event Highlights & Takeaways
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.highlights.map((hl, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700">{typeof hl === 'string' ? hl : JSON.stringify(hl)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Featured Mentors & Speakers</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.speakers.map((sp, idx) => (
                    <span key={idx} className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
                      {typeof sp === 'string' ? sp : sp.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Winners / Results for Completed Events */}
            {isCompleted && event.winners && event.winners.length > 0 && (
              <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200">
                <h3 className="text-base font-display font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  <span>Event Winners & Podium</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-amber-800">
                  {event.winners.map((winner, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{winner}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Event Gallery */}
            {event.galleryImages && event.galleryImages.length > 0 && (
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  <span>Event Photo Gallery</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {event.galleryImages.map((img, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden shadow-sm aspect-video bg-slate-100 border border-slate-200">
                      <img
                        src={getImageUrl(img)}
                        alt={`Event moment ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_EVENT_IMAGE;
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
