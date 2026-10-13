import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsService } from '../services/api';
import { EventItem } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  ExternalLink
} from 'lucide-react';
import { getImageUrl, FALLBACK_EVENT_IMAGE } from '../utils/imageUrl';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Workshop',
    'Hackathon',
    'Coding Competition',
    'Seminar',
    'Webinar',
    'Technical Event',
    'Other',
    'State level events'
  ];

  const statuses = ['All', 'Upcoming', 'Ongoing', 'Completed'];

  useEffect(() => {
    eventsService.getAll()
      .then((data) => setEvents(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = events.filter((e) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Other'
        ? !['Workshop', 'Hackathon', 'Coding Competition', 'Seminar', 'Webinar', 'Technical Event','State level events'].includes(e.category)
        : e.category.toLowerCase() === selectedCategory.toLowerCase());

    const matchesStatus =
      selectedStatus === 'All' || (e.status && e.status.toLowerCase() === selectedStatus.toLowerCase());

    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.venue || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-slate-50 py-12 min-h-[85vh]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            Programs & Competitions
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900">
            CSI Events & Workshops
          </h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Participate in technical workshops, hackathons, seminars, and developer sprints hosted by VFSTR Hyderabad.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-10 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full md:w-auto">
              {statuses.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedStatus === st
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event title, venue..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 items-center">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Events Found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              There are currently no events matching the selected filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Poster image */}
                <div className="relative h-52 bg-slate-900 overflow-hidden">
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
                      <Sparkles className="w-10 h-10 text-cyan-400/40 mb-2" />
                      <span className="text-xs font-semibold text-slate-400">CSI Event</span>
                    </div>
                  )}

                  {/* Status & Category Pills */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600/90 text-white backdrop-blur-md shadow-md">
                      {event.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-md ${
                        event.status?.toLowerCase() === 'upcoming'
                          ? 'bg-emerald-600 text-white'
                          : event.status?.toLowerCase() === 'ongoing'
                          ? 'bg-amber-600 text-white animate-pulse'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {event.status || 'Event'}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-2.5">
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

                  {/* Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      to={`/events/${event.id}`}
                      className="text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {event.status?.toLowerCase() !== 'completed' && event.registrationLink ? (
                      <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105 inline-flex items-center gap-1"
                      >
                        <span>Register</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        to={`/events/${event.id}`}
                        className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        {event.status?.toLowerCase() === 'completed' ? 'Event Summary' : 'Details'}
                      </Link>
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
