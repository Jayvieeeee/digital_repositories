import React, { useState } from 'react';
import { Search, SlidersHorizontal, FileText, Users, BarChart3, Upload, CheckCircle, BookOpen, ChevronRight, Shield, Zap, Database, Award, ArrowRight } from 'lucide-react';
import LandingPageImg from '../../assets/landing_page_img.png';
import Navbar from '../../components/Landing/Navbar';
import Footer from '../../components/Landing/Footer';


export default function AcademicResearchLanding() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <main className="pt-32 pb-24 px-6 relative z-10 overflow-hidden">
        <div className="max-w-3xl mt-36 mb-24 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-normal mb-4">
            Discover Academic Research
          </h1>
          <p className="text-slate-500 mb-10">
            Search theses and capstone projects by title, keyword, or document type
          </p>

          {/* Search */}
        <form
        onSubmit={handleSearch}
        className="flex items-center gap-3">
        <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, keywords, or department"
            className="flex-1 px-5 py-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#155DFC]"/>
        <button
            type="submit"
            className="px-6 py-4 bg-[#2B8391] text-white rounded-lg text-sm font-normal hover:bg-gray-500">
            Search
        </button>
        </form>

          {/* Filters */}
          <div className="mt-4 text-left">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-[#155DFC]">
              <SlidersHorizontal className="w-4 h-4" />
              Show advanced filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md text-left">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option>All Years</option>
                    <option>2024</option>
                    <option>2023</option>
                    <option>2022</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Department</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option>All Departments</option>
                    <option>Computer Science</option>
                    <option>Engineering</option>
                    <option>Biology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Document Type</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option>All Types</option>
                    <option>Thesis</option>
                    <option>Capstone</option>
                    <option>Dissertation</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Top-left blur */}
        <div className="absolute top-0 left-0 w-[500px] h-[600px] bg-[#558BFF] opacity-15 blur-3xl rounded-full -translate-x-1/3 -translate-y-1/3"></div>
        {/* Bottom-right blur */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[600px] bg-[#558BFF] opacity-15 blur-3xl rounded-full translate-x-1/3 translate-y-1/3"></div>
      </main>
      
      {/* System Features */}
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-normal mb-4">
            System Features
          </h2>
          <p className="text-lg text-slate-600">
            Everything you need to manage, discover, and share academic knowledge
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-5 items-start">
          
          {/* LEFT SIDE*/}
          <div className="bg-gradient-to-br from-[#0D3796] to-[#155DFC] rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-white p-4 rounded-2xl">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">
                  Smart Search & Filters
                </h3>
                <p className="text-blue-50 text-base leading-relaxed">
                  Advanced search capabilities with multiple filter options to find exactly
                  what you need quickly and efficiently.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <img src={LandingPageImg} alt="Search Interface Preview" className="w-full h-auto rounded-lg"
              />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col gap-6">
            
            {/* Top Row - 2 Cards */}
            <div className="grid grid-cols-2 gap-6">
              {/* Similarity Checking */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="mb-3">
                  <div className="bg-red-100 p-3 rounded-xl w-fit mb-3">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">
                    Similarity Checking
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Advanced search capabilities with multiple filter options to find exactly what you need quickly and efficiently.
                  </p>
                </div>
              </div>

              {/* Role-Based Access */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="mb-3">
                  <div className="bg-green-100 p-3 rounded-xl w-fit mb-3">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">
                    Role-Based Access
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Customized access levels for students, faculty, and administrators with appropriate permissions.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row - 1 Card (Full Width) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="mb-3">
                <div className="bg-purple-100 p-3 rounded-xl w-fit mb-3">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                  Usage Analytics & Citations
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Advanced search capabilities with multiple filter options to find exactly what you need quickly and efficiently.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

    {/* How It Works Section */}
    <section className="bg-[#E8EFFE] py-32 left-0 right-0 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-semibold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600">
            A streamlined process from submission to publication
          </p>
        </div>

        <div className="relative w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-start">
            
            {/* Upload */}
            <div className="flex flex-col items-center text-center relative px-8 md:px-4">
              <div className="bg-blue-600 p-6 rounded-2xl mb-6 shadow-lg">
                <Upload className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                Upload or Submit Research
              </h3>
              <p className="text-base text-gray-600 leading-5 max-w-xs">
                Students submit their theses, papers, or journals through a simple upload interface with metadata tagging.
              </p>
              
              {/* Dotted Arrow */}
              <div className="hidden md:block absolute top-12 right-0 left-auto w-1/2">
                <div className="flex items-center justify-start translate-x-1/2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-blue-600 rounded-full mx-1"></div>
                  ))}
                  <ChevronRight className="w-10 h-10 text-blue-600 ml-2" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/*  Review */}
            <div className="flex flex-col items-center text-center relative px-8 md:px-4">
              <div className="bg-blue-600 p-6 rounded-2xl mb-6 shadow-lg">
                <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                Review & Approval
              </h3>
              <p className="text-base text-gray-600 leading-5 max-w-xs">
                Research Adviser review submissions for quality, plagiarism, and compliance before publication.
              </p>
              
              {/* Dotted Arrow */}
              <div className="hidden md:block absolute top-12 right-0 left-auto w-1/2">
                <div className="flex items-center justify-start translate-x-1/2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-blue-600 rounded-full mx-1"></div>
                  ))}
                  <ChevronRight className="w-10 h-10 text-blue-600 ml-2" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/*  Search */}
            <div className="flex flex-col items-center text-center px-8 md:px-4">
              <div className="bg-blue-600 p-6 rounded-2xl mb-6 shadow-lg">
                <BookOpen className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                Search, Read, and Cite
              </h3>
              <p className="text-base text-gray-600 leading-5 max-w-xs">
                Approved research becomes searchable and accessible to the university community with proper citation.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
    
     {/* Benefits for your Institution */}
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-semibold text-slate-900 mb-4">
            Benefits for Your Institution
          </h2>
          <p className="text-lg text-slate-600">
            Transform how your university manages and shares academic research
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          
          {/* Academic Integrity */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Decorative Blob */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-200/40 rounded-full"></div>
            
            <div className="flex items-start gap-5 relative z-10">
              <div className="bg-blue-600 p-4 rounded-2xl flex-shrink-0">
                <Shield className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                  Improves Academic Integrity
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Built-in similarity checking to ensure all research meets the highest ethical standards.
                </p>
              </div>
            </div>
          </div>

          {/* Faster Literature Review */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Decorative Blob */}
           <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-200/40 rounded-full"></div>
            
            <div className="flex items-start gap-5 relative z-10">
              <div className="bg-blue-600 p-4 rounded-2xl flex-shrink-0">
                <Zap className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                  Faster Literature Review
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Advanced search and filtering save researchers countless hours when conducting literature reviews.
                </p>
              </div>
            </div>
          </div>

          {/* Centralized Knowledge */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Decorative Blob */}
             <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-200/40 rounded-full"></div>
            
            <div className="flex items-start gap-5 relative z-10">
              <div className="bg-blue-600 p-4 rounded-2xl flex-shrink-0">
                <Database className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                  Centralized Institutional Knowledge
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  All research is stored in one secure location, creating a valuable institutional knowledge base.
                </p>
              </div>
            </div>
          </div>

          {/* Research Visibility */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Decorative Blob */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-200/40 rounded-full"></div>
            
            <div className="flex items-start gap-5 relative z-10">
              <div className="bg-blue-600 p-4 rounded-2xl flex-shrink-0">
                <Award className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                  Supports Accreditation & Research Visibility
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Demonstrates research output for accreditation bodies and increases visibility of institutional research.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section className="bg-gradient-to-r from-[#2558CB] to-[#122C65] py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Start Exploring
        </h2>
        
        {/* Subheading */}
        <p className="text-xl md:text-3xl text-white/90 mb-10 leading-relaxed">
          Join thousands of researchers, students, and faculty in advancing academic excellence
        </p>
        
        {/* CTA Button */}
        <button className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto group">
          Access Repository
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>

    <Footer />
</div>



  );
}
