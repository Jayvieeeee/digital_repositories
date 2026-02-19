import React from 'react';
import { Users, FileText, GraduationCap, Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import Navbar from '../../components/Landing/Navbar';
import Footer from '../../components/Landing/Footer';

export default function ExploreAcademicPrograms() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
      {/* Stats Section */}
      <section className="bg-white pt-32 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl py-2 mb-3">
              Explore Academic Programs
            </h1>
            <p className="text-gray-500">
              Explore theses and capstone projects organized by academic programs
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-5 border border-gray-200 rounded-md">
              <div className="text-4xl font-bold text-[#134F4F] mb-1">1,231</div>
              <div className="text-sm text-slate-600">Academic Programs</div>
            </div>
            <div className="text-center p-5 border border-gray-200 rounded-md">
              <div className="text-4xl font-bold text-[#134F4F] mb-1">6</div>
              <div className="text-sm text-slate-600">Academic Programs</div>
            </div>
            <div className="text-center p-5 border border-gray-200 rounded-md">
              <div className="text-4xl font-bold text-[#134F4F] mb-1">231</div>
              <div className="text-sm text-slate-600">Researchers</div>
            </div>
            <div className="text-center p-5 border border-gray-200 rounded-md">
              <div className="text-4xl font-bold text-[#134F4F] mb-1">51</div>
              <div className="text-sm text-slate-600">New This Month</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Research Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-semibold mb-6">
            Featured Research This Week
          </h2>

          <div className="bg-blue-50 rounded-2xl p-8 border border-[#134F4F]">
            <h3 className="text-4xl font-base leading-24 mb-3">
              Machine Learning Applications in Healthcare Diagnostics: A Comprehensive Analysis
            </h3>
            
            <div className="flex items-center gap-4 text-base text-slate-600 mb-4">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span className="font-semibold">Santos, Maria • </span>
                <span> University School • </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>January 28, 2026</span>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed mb-4">
              This research explores the integration of machine learning algorithms in medical diagnostics, focusing on early disease detection and pattern recognition in patient data. The study demonstrates significant improvements in diagnostic accuracy and efficiency across multiple healthcare scenarios.
            </p>

            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Machine Learning
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Healthcare
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                AI
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Explore by Academic Programs */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-semibold mb-8">
            Explore by Academic Programs
          </h2>

          {/* Program Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                {/* Header with Icon */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Computer Science
                  </h3>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">10</div>
                    <div className="text-xs text-slate-500">Programs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">58</div>
                    <div className="text-xs text-slate-500">Research</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">5</div>
                    <div className="text-xs text-slate-500">New</div>
                  </div>
                </div>

                {/* Trending Topics */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">Trending Topics</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      Machine Learning
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      Hardware
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      Blockchain
                    </span>
                  </div>
                </div>

                {/* View Department Link */}
                <a 
                  href="#" 
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm group"
                >
                  View Department
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
}