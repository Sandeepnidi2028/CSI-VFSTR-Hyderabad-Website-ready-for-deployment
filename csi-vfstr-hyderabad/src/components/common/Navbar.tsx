import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/', isBoxed: true },
    { name: 'About Us', path: '/about' ,isHighlight: true},
    { name: 'Events', path: '/events',isHighlight: true },
    { name: 'Gallery', path: '/gallery',isHighlight: true  },
    { name: 'Team', path: '/team',isHighlight: true },
   
    { name: 'Magazines', path: '/magazine',isHighlight: true },
    { name: 'Join Us', path: '/membership' ,isHighlight: true},
  ];

  const isActive = (path: string, name: string) => {
    if (name === 'Home') return location.pathname === '/';
    if (name === 'VJH 2k26' || name === 'SIH 2026') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-200 border-b border-slate-200 ${
        isScrolled ? 'shadow-sm py-2' : 'py-3'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Left: VFSTR & CSI Logos */}
          <Link to="/" className="flex items-center gap-3 sm:gap-4 shrink-0 group">
            {/* VFSTR College Logo Banner */}
            <img
              src="/assets/vfstr_logo.png"
              alt="VFSTR Hyderabad"
              className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
            {/* Divider */}
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            {/* CSI Logo */}
            <img
              src="/assets/csi_logo.png"
              alt="CSI Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-full transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-3 xl:space-x-5">
            {navLinks.map((link) => {
              const active = isActive(link.path, link.name);

              if (link.isHighlight) {
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="px-3.5 py-1 rounded-[4px] border border-sky-400 text-sky-600 hover:bg-sky-50 text-xs xl:text-sm font-medium transition-all"
                  >
                    {link.name}
                  </Link>
                );
              }

              if (link.isBoxed && active) {
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="px-3.5 py-1 rounded-[4px] border border-slate-900 text-slate-900 text-xs xl:text-sm font-semibold transition-all hover:bg-slate-50"
                  >
                    {link.name}
                  </Link>
                );
              }

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-1.5 py-1 text-xs xl:text-sm transition-colors ${
                    active
                      ? 'text-blue-600 font-semibold'
                      : 'text-slate-700 hover:text-blue-600 font-normal'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-1 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-2">
            Navigation Menu
          </div>
          {navLinks.map((link) => {
            const active = isActive(link.path, link.name);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium ${
                  link.isHighlight
                    ? 'text-sky-600 bg-sky-50 border border-sky-300'
                    : active
                    ? 'text-slate-900 bg-slate-100 font-semibold border border-slate-300'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
