import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { eventsService } from '../../services/api';
import { EventItem } from '../../types';
import { getImageUrl, FALLBACK_EVENT_IMAGE } from '../../utils/imageUrl';

export const UpcomingEventsPreview: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsService.getAll({ status: 'Upcoming' })
      .then((data) => {
        setEvents(data.slice(0, 3));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Campus Tech Engagements
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-slate-900">
              Upcoming Events & Workshops
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Participate in hackathons, masterclasses, and coding sprints organized by the student chapter.
            </p>
          </div>
          <Link
            to="/events"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 group"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Upcoming Events Announced Yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Our technical leads and faculty coordinators are planning upcoming hackathons and webinars. Check back soon or visit our events calendar!
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              <span>Explore Past Events & Archives</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 flex flex-col"
              >
                {/* Poster / Thumbnail */}
                <div className="relative h-48 bg-slate-800 overflow-hidden">
                  {event.poster ? (
                    <img
                      src={getImageUrl(event.poster)}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_EVENT_IMAGE;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center tech-grid-bg text-slate-500 p-4 text-center">
                      <Sparkles className="w-8 h-8 text-cyan-400/50 mb-2" />
                      <span className="text-xs font-semibold text-slate-400">CSI VFSTR Event</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600/90 text-white backdrop-blur-md shadow-md">
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{event.date}</span>
                      </div>
                      {event.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{event.time}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-display font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                      {event.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {event.shortDescription || event.description}
                    </p>

                    {event.venue && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      to={`/events/${event.id}`}
                      className="text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      View Details
                    </Link>

                    {event.registrationLink ? (
                      <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105"
                      >
                        Register Now
                      </a>
                    ) : (
                      <Link
                        to={`/events/${event.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Explore Event
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
