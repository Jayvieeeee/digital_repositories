import { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiFilter,
  FiUser,
  FiCalendar,
  FiEye,
  FiLock,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { BsFileText } from "react-icons/bs";
import api from "../../api/axios";

const ITEMS_PER_PAGE = 10;

const tagColors = {
  "Machine Learning": "bg-blue-100 text-blue-700",
  Healthcare: "bg-green-100 text-green-700",
  AI: "bg-purple-100 text-purple-700",
};

// ─── Helper Functions ─────────────────────────────────────────────────────
function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function extractTags(keywords) {
  if (!keywords) return [];
  // Split keywords by commas and clean up
  return keywords.split(',').map(tag => tag.trim()).filter(tag => tag);
}

function getTagColorClass(tag) {
  return tagColors[tag] || "bg-gray-100 text-gray-600";
}

function ResearchCard({ item, onViewAbstract, onViewFullDocument, onRequestAccess }) {
  const tags = extractTags(item.keywords);
  const isPrivate = item.status?.toLowerCase() !== 'approved'; // Only approved papers are public
  const similarityScore = item.similarity_percentage || 0;
  const citations = item.citations_count || 0;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      {/* Title + Status */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-base font-semibold text-gray-900 leading-snug flex-1">
          {item.title}
        </h3>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-500 mb-1">
        <span className="flex items-center gap-1.5">
          <FiUser className="w-4 h-4" />
          {item.student?.user?.name || 
           (item.student?.user?.first_name && item.student?.user?.last_name 
             ? `${item.student.user.first_name} ${item.student.user.last_name}`
             : item.author || "Unknown Author")}
        </span>
        <span className="flex items-center gap-1.5">
          <HiOutlineOfficeBuilding className="w-4 h-4" />
          {item.program?.program_name || item.program?.name || item.institution || "—"}
        </span>
        <span className="flex items-center gap-1.5">
          <FiCalendar className="w-4 h-4" />
          {formatDate(item.date_submitted || item.created_at)}
        </span>
        <span className="flex items-center gap-1.5 font-medium text-gray-700">
          <span className={`w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold ${
            similarityScore <= 20 ? 'bg-green-600' : 
            similarityScore <= 40 ? 'bg-orange-500' : 
            'bg-red-600'
          }`}>
            {similarityScore}
          </span>
          {citations} {citations === 1 ? 'Citation' : 'Citations'}
        </span>
      </div>

      {/* Abstract */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{item.abstract || "No abstract available."}</p>

      {/* Tags + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`text-xs font-medium px-3 py-1 rounded-full ${getTagColorClass(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onViewAbstract(item)}
            className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BsFileText className="w-4 h-4" />
            View Abstract
          </button>
          {isPrivate ? (
            <button 
              onClick={() => onRequestAccess(item)}
              className="flex items-center gap-1.5 text-sm text-white bg-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-900 transition-colors"
            >
              <FiLock className="w-4 h-4" />
              Request Access
            </button>
          ) : (
            <button 
              onClick={() => onViewFullDocument(item)}
              className="flex items-center gap-1.5 text-sm text-white bg-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <FiEye className="w-4 h-4" />
              View Full Document
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Abstract Modal ──────────────────────────────────────────────────────
function AbstractModal({ isOpen, onClose, paper }) {
  if (!isOpen || !paper) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 mb-2" id="modal-title">
                  {paper.title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  By: {paper.student?.user?.name || "Unknown Author"} • {formatDate(paper.date_submitted || paper.created_at)}
                </p>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{paper.abstract || "No abstract available."}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function BrowseResearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [papers, setPapers] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSort, setSelectedSort] = useState("Most Recent");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [abstractModal, setAbstractModal] = useState({ isOpen: false, paper: null });

  // ─── Programs List (fetch from API or use static) ─────────────────────
  const [programs, setPrograms] = useState([]);
  
  useEffect(() => {
    // Fetch programs for dropdown
    const fetchPrograms = async () => {
      try {
        const res = await api.get('/programs?per_page=100');
        if (res.data?.data) {
          setPrograms(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch programs:', err);
      }
    };
    fetchPrograms();
  }, []);

  // ─── Fetch Papers ─────────────────────────────────────────────────────
  const fetchPapers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        program: selectedProgram || undefined,
        year_level: selectedYear || undefined,
        document_type: selectedType || undefined,
        sort: selectedSort === "Most Recent" ? "recent" : 
              selectedSort === "Most Cited" ? "citations" :
              selectedSort === "Highest Score" ? "similarity" : undefined,
        status: "approved", // Only show approved papers in browse
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      };

      const res = await api.get('/research-papers', { params });
      const paginator = res.data.data;
      const fetchedPapers = paginator.data ?? [];
      
      setPapers(fetchedPapers);
      setTotalResults(paginator.total || 0);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch papers:', err);
      setError(err.response?.data?.message || err.message);
      setPapers([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [search, selectedProgram, selectedYear, selectedType, selectedSort, currentPage]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleSearch = () => {
    setCurrentPage(1);
    fetchPapers();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleProgramChange = (e) => {
    setSelectedProgram(e.target.value);
    setCurrentPage(1);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSelectedSort(e.target.value);
    setCurrentPage(1);
  };

  const handleViewAbstract = (paper) => {
    setAbstractModal({ isOpen: true, paper });
  };

  const handleViewFullDocument = (paper) => {
    // Open PDF in new tab
    window.open(`http://127.0.0.1:8000/api/research-papers/${paper.paper_id || paper.id}/download`, '_blank');
  };

  const handleRequestAccess = async (paper) => {
    try {
      // Create an access request
      await api.post('/access-requests', {
        paper_id: paper.paper_id || paper.id,
        message: `Requesting access to view "${paper.title}"`,
      });
      alert('Access request sent successfully!');
    } catch (err) {
      console.error('Failed to request access:', err);
      alert(err.response?.data?.message || 'Failed to request access');
    }
  };

  // Extract unique years from papers for the year filter
  const years = [...new Set(papers.map(p => p.year_level || p.student?.year_level).filter(Boolean))].sort().reverse();

  return (
    <>
      <div className="p-6 mx-auto">
        {/* Abstract Modal */}
        <AbstractModal
          isOpen={abstractModal.isOpen}
          onClose={() => setAbstractModal({ isOpen: false, paper: null })}
          paper={abstractModal.paper}
        />

        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search by title, author, keywords, or department"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <button 
            onClick={handleSearch}
            className="flex items-center gap-2 bg-[#1A6C6C] text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <FiSearch className="w-4 h-4" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Program Filter */}
          <div className="relative">
            <select 
              value={selectedProgram}
              onChange={handleProgramChange}
              className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer"
            >
              <option value="">All Programs</option>
              {programs.map(prog => (
                <option key={prog.program_id || prog.id} value={prog.program_id || prog.id}>
                  {prog.program_name || prog.name}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Year Filter */}
          <div className="relative">
            <select 
              value={selectedYear}
              onChange={handleYearChange}
              className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}th Year</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Document Type Filter */}
          <div className="relative">
            <select 
              value={selectedType}
              onChange={handleTypeChange}
              className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="thesis">Thesis</option>
              <option value="capstone">Capstone</option>
              <option value="journal">Journal</option>
              <option value="article">Article</option>
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <select 
              value={selectedSort}
              onChange={handleSortChange}
              className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer"
            >
              <option value="Most Recent">Most Recent</option>
              <option value="Most Cited">Most Cited</option>
              <option value="Highest Score">Highest Score</option>
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ml-auto">
            <FiFilter className="w-4 h-4" />
            Advance Filters
          </button>
        </div>

        {/* Results Info & Active Tag */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-800">{papers.length} results</span>
            {totalResults > 0 && ` of ${totalResults} total`}
          </p>
          {activeTag && (
            <span className="flex items-center gap-1.5 text-sm bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full font-medium">
              {activeTag}
              <button
                onClick={() => setActiveTag("")}
                className="text-teal-500 hover:text-teal-700"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
        </div>

        {/* Loading State */}
        {loading && papers.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-teal-600 mb-4"></div>
            <p className="text-gray-500">Loading research papers...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-20 text-center">
            <p className="text-red-500 mb-2">Error loading papers</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        )}

        {/* Results List */}
        {!loading && !error && (
          <div className="flex flex-col gap-4">
            {papers.length > 0 ? (
              papers.map((item) => (
                <ResearchCard 
                  key={item.paper_id || item.id} 
                  item={item} 
                  onViewAbstract={handleViewAbstract}
                  onViewFullDocument={handleViewFullDocument}
                  onRequestAccess={handleRequestAccess}
                />
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-gray-500">No research papers found.</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination (if needed) */}
        {totalResults > ITEMS_PER_PAGE && (
          <div className="flex justify-center mt-6">
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(totalResults / ITEMS_PER_PAGE) }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 3), Math.min(Math.ceil(totalResults / ITEMS_PER_PAGE), currentPage + 2))
                .map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors ${
                      page === currentPage
                        ? "bg-[#134F4F] text-white border-[#134F4F]"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}