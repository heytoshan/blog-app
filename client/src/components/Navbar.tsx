import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  LogOut, User, PlusCircle, Search, Menu, X, Bell,
  Bookmark, Settings, TrendingUp, ChevronDown
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Discover', href: '/' },
    { label: 'Trending', href: '/trending' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-dark border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[60px]">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-black tracking-tighter text-white hover:opacity-75 transition-opacity flex-shrink-0"
          style={{ letterSpacing: '-0.04em' }}
        >
          BLOGY<span className="text-white/30">.</span>
        </Link>

        {/* Desktop Nav links */}
        <div className="hidden md:flex items-center gap-1 ml-8">
          {navLinks.map(link => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                  isActive
                    ? 'text-white bg-white/[0.07]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xs mx-6">
          <div className={`relative w-full transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyUp={handleSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-[13px] text-white placeholder:text-gray-600
                focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
            />
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/create-blog"
                className="flex items-center gap-1.5 btn-primary px-4 py-2 text-[13px]"
              >
                <PlusCircle size={14} />
                Write
              </Link>

              {/* Notifications */}
              <button
                id="nav-notifications"
                className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 group"
                  id="nav-avatar-btn"
                >
                  <div className="relative">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=222&color=fff&size=100`}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-white/30 transition-all"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#080808]" />
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 w-56 surface rounded-2xl overflow-hidden shadow-2xl z-50"
                      id="nav-dropdown-menu"
                    >
                      {/* User info */}
                      <div className="px-4 py-3.5 border-b border-white/[0.06]">
                        <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">@{user.username}</p>
                      </div>

                      <div className="p-2">
                        <Link
                          to={`/profile/${user.username}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
                          id="nav-profile-link"
                        >
                          <User size={15} />
                          My Profile
                        </Link>
                        <Link
                          to="/bookmarks"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
                          id="nav-bookmarks-link"
                        >
                          <Bookmark size={15} />
                          Saved Stories
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
                            id="nav-admin-link"
                          >
                            <Settings size={15} />
                            Admin Dashboard
                          </Link>
                        )}

                        <div className="my-2 border-t border-white/[0.06]" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] rounded-xl transition-all text-left"
                          id="nav-logout-btn"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[13px] font-semibold text-gray-400 hover:text-white transition-colors px-3 py-2"
                id="nav-login-link"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-primary px-5 py-2 text-[13px]"
                id="nav-register-link"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          id="nav-mobile-toggle"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-white/[0.06] overflow-hidden bg-[#0a0a0a]"
          >
            <div className="px-4 py-4 space-y-1">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyUp={handleSearch}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none"
                />
              </div>

              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  {link.label === 'Trending' && <TrendingUp size={16} />}
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link to={`/profile/${user.username}`} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.05]">
                    <User size={16} /> Profile
                  </Link>
                  <Link to="/bookmarks" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.05]">
                    <Bookmark size={16} /> Saved Stories
                  </Link>
                  <Link to="/create-blog" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white bg-white/[0.06] hover:bg-white/[0.1]">
                    <PlusCircle size={16} /> Write a story
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/[0.08] text-left"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.05]">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-primary w-full text-center px-5 py-3 text-sm block">
                    Get started free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
