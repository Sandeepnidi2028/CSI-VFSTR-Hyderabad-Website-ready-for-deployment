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

  interface NavLinkItem {
    name: string;
    path: string;
    isBoxed?: boolean;
    isHighlight?: boolean;
  }

  const navLinks: NavLinkItem[] = [
    { name: 'Home', path: '/', isBoxed: true },
    { name: 'About Us', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Team', path: '/team' },
    { name: 'Magazines', path: '/magazine' },
    { name: 'Join Us', path: '/membership' },
  ];

  const isActive = (path: string, name: string) => {
    if (name === 'Home') return location.pathname === '/';
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
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-3">
            {navLinks.map((link) => {
              const active = isActive(link.path, link.name);

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-1 rounded-[4px] border text-xs xl:text-sm transition-all duration-150 ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'border-slate-900 text-slate-900 font-medium hover:bg-slate-900 hover:text-white bg-white'
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
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-2">
            Navigation Menu
          </div>
          {navLinks.map((link) => {
            const active = isActive(link.path, link.name);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center justify-between px-3.5 py-2 rounded-[4px] border text-sm transition-all ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'border-slate-900 text-slate-900 font-medium hover:bg-slate-50'
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
