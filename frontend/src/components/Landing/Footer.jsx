import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#00281E] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Section - 3 Columns */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          
          {/* Column 1 - About */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              University Research Repository
            </h3>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Empowering academic excellence through accessible research and knowledge sharing.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-slate-400">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>University Campus, Main Building</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+1 (234) 567-890</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>repository@university.edu</span>
              </div>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  System Features
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Benefits for your Institution
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 - Support & Resources */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Support & Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  About the System
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Access and Visibility Rules
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Submission Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section - Copyright */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
            <p>© 2026 University Research Repository. All rights reserved.</p>
            <p>Version 1.0 | Academic Year 2025-2026</p>
          </div>
        </div>
      </div>
    </footer>
  );
}