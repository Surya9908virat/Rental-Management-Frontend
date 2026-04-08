import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Home, LogOut, User as UserIcon, Sun, Moon, ChevronDown, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="bg-[#2563EB] dark:bg-[#1E3A8A] sticky top-0 z-50 transition-colors duration-300"
         style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to={user ? "/profile" : "/"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
              <Home size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">Rental Management</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Profile button */}
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/15 transition-all duration-200 group"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/20 flex items-center justify-center border border-white/30 flex-shrink-0">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={16} className="text-white" />
                    )}
                  </div>

                  {/* Name + role */}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 leading-tight">
                      {user.role}
                    </p>
                  </div>

                  <ChevronDown
                    size={14}
                    className={`text-white/70 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-[8px] border border-[#E5E7EB] dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                    style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                  >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-[#E5E7EB] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900">
                      <p className="text-sm font-bold text-[#111827] dark:text-white">{user.name}</p>
                      <p className="text-xs text-[#6B7280] dark:text-slate-400">{user.email}</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1F2937] dark:text-slate-200 hover:bg-[#EFF6FF] dark:hover:bg-slate-700 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors"
                      >
                        <Settings size={16} />
                        Profile & Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1F2937] dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <button className="px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 rounded-lg transition-all duration-200">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-4 py-2 text-sm font-semibold bg-white text-[#2563EB] hover:bg-blue-50 rounded-lg transition-all duration-200">
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
