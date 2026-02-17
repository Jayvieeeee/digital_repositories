import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
const linkClass = ({ isActive }) =>
  `relative ${
    isActive
      ? 'after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[2px] after:bg-white'
      : ''
  }
  hover:after:absolute hover:after:left-0 hover:after:-bottom-1 hover:after:w-full hover:after:h-[2px] hover:after:bg-white`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#2B8391] to-[#1D5B65]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between text-white">

          {/* Logo */}
          <div className="text-xl font-bold">
            <NavLink to="/">LOGO</NavLink>
          </div>

          <div className="flex items-center gap-10">

            {/* Navigation links */}
            <div className="hidden md:flex items-center gap-8 text-sm">
              <NavLink to="/" end className={linkClass}>
                Home
              </NavLink>

              <NavLink to="/academic-programs" className={linkClass}>
                Academic Programs
              </NavLink>

              <NavLink to="/guidelines-about" className={linkClass}>
                Guidelines / About
              </NavLink>
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              <NavLink to="/login" className="px-5 py-2 text-sm border-2 border-white rounded-lg">
                Log In
              </NavLink>
              <NavLink to="/register" className="px-6 py-2.5 text-sm bg-[#2B8391] text-white rounded-lg">
                Register
              </NavLink>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}
