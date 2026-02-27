import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import {
  IoSearchOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCloseOutline,
} from "react-icons/io5";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { label: "All",      value: "all"      },
  { label: "Pending",  value: "pending"  },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const ITEMS_PER_PAGE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSimilarityColor(pct = 0) {
  if (pct <= 20) return { dot: "#22c55e", bar: "#22c55e", text: "#16a34a" };
  if (pct <= 40) return { dot: "#f59e0b", bar: "#f59e0b", text: "#d97706" };
  return { dot: "#ef4444", bar: "#ef4444", text: "#dc2626" };
}

// ─── Helper: safely extract program name from whatever shape the API returns ──
function getProgramName(program) {
  if (!program) return "—";
  if (typeof program === "string") return program;
  return (
    program.program_name ??
    program.name ??
    program.title ??
    "—"
  );
}

function StatusBadge({ status }) {
  const map = {
    approved: "bg-green-50 text-green-700 border border-green-200",
    pending:  "bg-orange-50 text-orange-600 border border-orange-200",
    rejected: "bg-red-50 text-red-600 border border-red-200",
  };
  const displayStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "—";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status?.toLowerCase()] || "bg-gray-100 text-gray-500"}`}>
      {displayStatus}
    </span>
  );
}

function SimilarityCell({ similarity = 0, note }) {
  const { dot, bar, text } = getSimilarityColor(similarity);
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <span style={{ color: dot }} className="text-lg leading-none flex-shrink-0">●</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${Math.min(similarity, 100)}%`, backgroundColor: bar }}
        />
      </div>
      {note ? (
        <span className="text-xs text-gray-500 italic whitespace-nowrap">{note}</span>
      ) : (
        <span className="text-xs font-bold whitespace-nowrap" style={{ color: text }}>{similarity}%</span>
      )}
    </div>
  );
}

// ─── PDF Preview Modal Component ──────────────────────────────────────────────
function PDFPreviewModal({ isOpen, onClose, pdfUrl, paperTitle }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              {paperTitle || "PDF Preview"}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IoCloseOutline className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          
          {/* PDF Viewer */}
          <div className="flex-1 p-4 min-h-[600px]">
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-lg border border-gray-200"
              title="PDF Preview"
            />
          </div>
          
          {/* Footer with Download Button */}
          <div className="flex justify-end p-4 border-t border-gray-200">
            <a
              href={pdfUrl}
              download
              className="flex items-center gap-2 px-4 py-2 bg-[#134F4F] text-white rounded-lg hover:bg-teal-800 transition-colors"
            >
              <IoDocumentTextOutline className="w-4 h-4" />
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LibrarianRepository() {
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [papers, setPapers]             = useState([]);
  const [schoolYears, setSchoolYears]   = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);

  const [search, setSearch]         = useState("");
  const [program, setProgram]       = useState("");
  const [yearLevel, setYearLevel]   = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [activeTab, setActiveTab]   = useState("pending"); // Default to pending

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  // PDF Preview Modal State
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    pdfUrl: "",
    paperTitle: "",
    paperId: null
  });

  // ─── Fetch Papers ──────────────────────────────────────────────────────────
  const fetchPapers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/research-papers`, {
        params: {
          search:      search || undefined,
          program:     program || undefined,
          year_level:  yearLevel || undefined,
          school_year: schoolYear || undefined,
          status:      activeTab !== "all" ? activeTab : undefined,
          page:        pagination.current_page,
          per_page:    ITEMS_PER_PAGE,
        },
      });

      console.log("API Response:", res.data); 

      const paginator = res.data.data;
      const fetchedPapers = paginator.data ?? [];
      setPapers(fetchedPapers);
      setPagination({
        current_page: paginator.current_page,
        last_page:    paginator.last_page,
        total:        paginator.total,
      });

      // Derive unique school years from returned data on first load
      if (schoolYears.length === 0 && fetchedPapers.length > 0) {
        const years = [...new Set(fetchedPapers.map(p => p.school_year).filter(Boolean))].sort().reverse();
        setSchoolYears(years);
        if (!schoolYear && years.length > 0) setSchoolYear(years[0]);
      }

      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [search, program, yearLevel, schoolYear, activeTab, pagination.current_page]);

  useEffect(() => { fetchPapers(); }, [fetchPapers]);

  // ─── Fetch pending badge count ─────────────────────────────────────────────
  useEffect(() => {
    api.get(`/research-papers`, {
      params: { status: "pending", per_page: 1, page: 1 },
    }).then(res => {
      setPendingTotal(res.data.data?.total ?? 0);
    }).catch(() => {});
  }, []);

  // ─── Status Update ─────────────────────────────────────────────────────────
  const handleStatusUpdate = async (id, status) => {
    if (!id) {
      console.error("Cannot update status: ID is undefined");
      return;
    }
    
    try {
      await api.patch(`/research-papers/${id}/status`, { status });
      fetchPapers();
      // Refresh pending badge
      api.get(`/research-papers`, { params: { status: "pending", per_page: 1, page: 1 } })
        .then(res => setPendingTotal(res.data.data?.total ?? 0))
        .catch(() => {});
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // ─── Handle View PDF ───────────────────────────────────────────────────────
  const handleViewPDF = (paper) => {
    // Get the correct ID (paper_id from your model)
    const paperId = paper.paper_id || paper.id;
    
    console.log("Paper object:", paper);
    console.log("Using paperId:", paperId);
    
    if (!paperId) {
      console.error("No paper ID found in:", paper);
      alert("Error: Paper ID not found. Check console for details.");
      return;
    }
    
    // When viewing, update status to "approved" if it's still pending
    if (paper.status?.toLowerCase() === "pending") {
      handleStatusUpdate(paperId, "approved");
    }
    
    // Open PDF preview modal
    setPreviewModal({
      isOpen: true,
      pdfUrl: `http://127.0.0.1:8000/api/research-papers/${paperId}/download`,
      paperTitle: paper.title,
      paperId: paperId
    });
  };

  // ─── Close PDF Modal ───────────────────────────────────────────────────────
  const handleCloseModal = () => {
    setPreviewModal({
      isOpen: false,
      pdfUrl: "",
      paperTitle: "",
      paperId: null
    });
  };

  const handleTabChange = (val) => {
    setActiveTab(val);
    setPagination(p => ({ ...p, current_page: 1 }));
  };

  const handleSearch  = (e) => { 
    setSearch(e.target.value);    
    setPagination(p => ({ ...p, current_page: 1 })); 
  };
  
  const handleProgram = (e) => { 
    setProgram(e.target.value);   
    setPagination(p => ({ ...p, current_page: 1 })); 
  };
  
  const handleYear    = (e) => { 
    setYearLevel(e.target.value); 
    setPagination(p => ({ ...p, current_page: 1 })); 
  };
  
  const handleSY      = (e) => { 
    setSchoolYear(e.target.value);
    setPagination(p => ({ ...p, current_page: 1 })); 
  };

  const goTo = (p) =>
    setPagination(prev => ({ ...prev, current_page: Math.max(1, Math.min(p, prev.last_page)) }));

  const pageNums = Array.from({ length: pagination.last_page }, (_, i) => i + 1)
    .slice(
      Math.max(0, pagination.current_page - 2),
      Math.min(pagination.last_page, pagination.current_page + 1)
    );

  const start = (pagination.current_page - 1) * ITEMS_PER_PAGE + 1;
  const end   = Math.min(pagination.current_page * ITEMS_PER_PAGE, pagination.total);

  return (
    <div className="space-y-5">

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={previewModal.isOpen}
        onClose={handleCloseModal}
        pdfUrl={previewModal.pdfUrl}
        paperTitle={previewModal.paperTitle}
      />

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Repository</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 shadow-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            University Name
          </div>
          <select
            value={schoolYear}
            onChange={handleSY}
            className="bg-[#134F4F] text-white text-sm rounded-lg px-3 py-1.5 border-0 focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
          >
            {schoolYears.length > 0 ? (
              schoolYears.map(sy => (
                <option key={sy} value={sy}>SY {sy}</option>
              ))
            ) : (
              <option value="">SY 2025-2026</option>
            )}
          </select>
        </div>
      </div>

      {/* ── Status Tabs ── */}
      <div className="flex items-center gap-1">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-white border border-gray-200 text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.value === "pending" && pendingTotal > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-orange-400 text-white rounded-full">
                {pendingTotal}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4">
          <div className="relative w-full sm:w-72">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, keyword"
              value={search}
              onChange={handleSearch}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select value={program} onChange={handleProgram}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">All Programs</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Information Systems">Information Systems</option>
            </select>
            <select value={yearLevel} onChange={handleYear}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">All Year Level</option>
              <option value="4th Year">4th Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="1st Year">1st Year</option>
            </select>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option>Academic Year</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm animate-pulse">Loading...</div>
          ) : error ? (
            <div className="py-16 text-center text-red-400 text-sm">{error}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-y border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 font-medium">Research Title</th>
                  <th className="text-left px-4 py-3 font-medium">Academic Program</th>
                  <th className="text-left px-4 py-3 font-medium">Year Level</th>
                  <th className="text-left px-4 py-3 font-medium">Submitted By</th>
                  <th className="text-left px-4 py-3 font-medium">Date Submitted</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Similarity</th>
                  <th className="text-left px-4 py-3 font-medium">Action</th>
                  <th className="text-left px-4 py-3 font-medium">View Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {papers.length > 0 ? (
                  papers.map((p) => {
                    const sim      = p.similarity_percentage ?? 0;
                    const stat     = p.status?.toLowerCase();
                    const isCopied = stat === "rejected" && sim >= 60;
                    const paperId  = p.paper_id || p.id;

                    return (
                      <tr key={paperId} className="hover:bg-gray-50/60 transition-colors">
                        {/* Title */}
                        <td className="px-6 py-3 font-medium text-gray-900 max-w-[180px]">
                          <span className="line-clamp-2">{p.title ?? "—"}</span>
                        </td>
                        {/* Program — handles string OR object */}
                        <td className="px-4 py-3 text-gray-600">
                          {getProgramName(p.program)}
                        </td>
                        {/* Year Level */}
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {p.year_level ?? "—"}
                        </td>
                        {/* Author */}
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {p.student?.user?.name ?? p.author ?? "—"}
                        </td>
                        {/* Date */}
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {p.date_submitted || p.created_at
                            ? new Date(p.date_submitted || p.created_at).toLocaleDateString("en-US", {
                                month: "numeric", day: "numeric", year: "numeric",
                              })
                            : "—"}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={stat} />
                        </td>
                        {/* Similarity */}
                        <td className="px-4 py-3">
                          <SimilarityCell
                            similarity={sim}
                            note={isCopied ? "Copied Abstract" : null}
                          />
                        </td>
                        {/* Action - Only PDF download for approved papers */}
                        <td className="px-4 py-3">
                          {stat === "approved" && (
                            <a
                              href={`http://127.0.0.1:8000/api/research-papers/${paperId}/download`}
                              className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-semibold"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <IoDocumentTextOutline className="w-4 h-4" /> PDF
                            </a>
                          )}
                          {stat !== "approved" && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        {/* View Details - For viewing PDF and approving */}
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => handleViewPDF(p)}
                            className="p-1.5 bg-[#134F4F] text-white rounded-md hover:bg-teal-800 transition-colors"
                            title="View PDF"
                          >
                            <IoEyeOutline className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                      No papers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {pagination.total > 0
                ? `Showing ${start}–${end} of ${pagination.total} papers`
                : "No results"}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goTo(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <IoChevronBackOutline className="w-4 h-4" />
              </button>
              {pageNums.map((n) => (
                <button
                  key={n}
                  onClick={() => goTo(n)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium border transition-colors ${
                    n === pagination.current_page
                      ? "bg-[#134F4F] text-white border-[#134F4F]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => goTo(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <IoChevronForwardOutline className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}