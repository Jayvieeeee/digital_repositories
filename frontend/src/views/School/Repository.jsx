import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import {
  IoSearchOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoChevronDownOutline,
} from "react-icons/io5";
import PaperDetailsModal from "../../components/School/ViewPaperDetails";

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

function getProgramName(program) {
  if (!program) return "—";
  if (typeof program === "string") return program;
  return program.program_name ?? program.name ?? program.title ?? "—";
}

function formatYearLevel(year) {
  if (!year || year === "—") return "—";
  const num = parseInt(year);
  if (isNaN(num)) return year;
  const suffix = num === 1 ? "st" : num === 2 ? "nd" : num === 3 ? "rd" : "th";
  return `${num}${suffix} Year`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    approved: "text-green-600 border-green-400",
    pending:  "text-orange-400 border-orange-400",
    rejected: "text-red-500 border-red-400",
  };
  const key = status?.toLowerCase();
  // Default to pending if status not found (for flagged papers, show as pending)
  const statusKey = map[key] ? key : "pending";
  const label = statusKey ? statusKey.charAt(0).toUpperCase() + statusKey.slice(1) : "—";
  return (
    <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium bg-white border whitespace-nowrap ${map[statusKey] || "border-gray-300 text-gray-500"}`}>
      {label}
    </span>
  );
}

// ─── Similarity Cell ──────────────────────────────────────────────────────────
function SimilarityCell({ similarity = 0 }) {
  const { dot, bar, text } = getSimilarityColor(similarity);
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
      <div className="w-20 bg-gray-200 rounded-full h-1.5 flex-shrink-0">
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${Math.min(similarity, 100)}%`, backgroundColor: bar }}
        />
      </div>
      <span className="text-sm font-bold whitespace-nowrap" style={{ color: text }}>
        {similarity}%
      </span>
    </div>
  );
}

// ─── Dropdown Select ──────────────────────────────────────────────────────────
function FilterSelect({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none text-sm border border-gray-200 rounded-lg pl-3 pr-8 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
      >
        {children}
      </select>
      <IoChevronDownOutline className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
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
  const [activeTab, setActiveTab]   = useState("all");

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [detailsModal, setDetailsModal] = useState({ isOpen: false, paper: null });
  const handleViewDetails = (paper) => setDetailsModal({ isOpen: true, paper });
  const handleCloseModal  = ()       => setDetailsModal({ isOpen: false, paper: null });

  // ─── Fetch Papers ──────────────────────────────────────────────────────────
  const fetchPapers = useCallback(async () => {
    setLoading(true);
    try {
      // Map "all" to undefined to get all papers including flagged
      const statusParam = activeTab !== "all" ? activeTab : undefined;
      
      const res = await api.get(`/research-papers`, {
        params: {
          search:      search || undefined,
          program:     program || undefined,
          year_level:  yearLevel || undefined,
          school_year: schoolYear || undefined,
          status:      statusParam,
          page:        pagination.current_page,
          per_page:    ITEMS_PER_PAGE,
        },
      });
      const paginator     = res.data.data;
      const fetchedPapers = paginator.data ?? [];
      
      // Transform flagged papers to show as pending in the UI
      const transformedPapers = fetchedPapers.map(paper => {
        if (paper.status?.toLowerCase() === 'flagged') {
          return { ...paper, status: 'pending' };
        }
        return paper;
      });
      
      setPapers(transformedPapers);
      setPagination({
        current_page: paginator.current_page,
        last_page:    paginator.last_page,
        total:        paginator.total,
      });
      if (schoolYears.length === 0 && fetchedPapers.length > 0) {
        const years = [...new Set(fetchedPapers.map(p => p.school_year).filter(Boolean))].sort().reverse();
        setSchoolYears(years);
        if (!schoolYear && years.length > 0) setSchoolYear(years[0]);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [search, program, yearLevel, schoolYear, activeTab, pagination.current_page]);

  useEffect(() => { fetchPapers(); }, [fetchPapers]);

  useEffect(() => {
    api.get(`/research-papers`, { params: { status: "pending", per_page: 1, page: 1 } })
      .then(res => setPendingTotal(res.data.data?.total ?? 0))
      .catch(() => {});
  }, []);

  // ─── Status Update ─────────────────────────────────────────────────────────
  const handleStatusUpdate = async (id, status) => {
    if (!id) return;
    try {
      await api.patch(`/research-papers/${id}/status`, { status });
      fetchPapers();
      api.get(`/research-papers`, { params: { status: "pending", per_page: 1, page: 1 } })
        .then(res => setPendingTotal(res.data.data?.total ?? 0))
        .catch(() => {});
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleTabChange = (val) => { setActiveTab(val); setPagination(p => ({ ...p, current_page: 1 })); };
  const handleSearch    = (e)   => { setSearch(e.target.value);    setPagination(p => ({ ...p, current_page: 1 })); };
  const handleProgram   = (e)   => { setProgram(e.target.value);   setPagination(p => ({ ...p, current_page: 1 })); };
  const handleYear      = (e)   => { setYearLevel(e.target.value); setPagination(p => ({ ...p, current_page: 1 })); };
  const handleSY        = (e)   => { setSchoolYear(e.target.value);setPagination(p => ({ ...p, current_page: 1 })); };

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
    <div className="space-y-4">

      <PaperDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={handleCloseModal}
        paper={detailsModal.paper}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* ── Status Tabs ── */}
      <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-1.5 shadow-sm">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.value
                ? "bg-gray-100 text-gray-800 shadow-sm"
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

        {/* ── Filters Row ── */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
          {/* Search */}
          <div className="relative w-72">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, keyword"
              value={search}
              onChange={handleSearch}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>
          {/* Right-side dropdowns */}
          <div className="flex items-center gap-2">
            <FilterSelect value={program} onChange={handleProgram}>
              <option value="">All Programs</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Information Systems">Information Systems</option>
            </FilterSelect>
            <FilterSelect value={yearLevel} onChange={handleYear}>
              <option value="">All Year Level</option>
              <option value="4">4th Year</option>
              <option value="3">3rd Year</option>
              <option value="2">2nd Year</option>
              <option value="1">1st Year</option>
            </FilterSelect>
            <FilterSelect value={schoolYear} onChange={handleSY}>
              {schoolYears.length > 0
                ? schoolYears.map(sy => <option key={sy} value={sy}>{sy}</option>)
                : <option value="">Academic Year</option>
              }
            </FilterSelect>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-gray-400 text-sm animate-pulse">Loading...</div>
          ) : error ? (
            <div className="py-20 text-center text-red-400 text-sm">{error}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Research Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Academic Program</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Year Level</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Submitted By</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Date Submitted</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Similarity</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">Action</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">View Details</th>
                </tr>
              </thead>
              <tbody>
                {papers.length > 0 ? (
                  papers.map((p) => {
                    const sim       = p.similarity_percentage ?? 0;
                    const stat      = p.status?.toLowerCase();
                    const paperId   = p.paper_id || p.id;
                    const studentName =
                      p.student?.user?.name ||
                      (p.student?.user?.first_name && p.student?.user?.last_name
                        ? `${p.student.user.first_name} ${p.student.user.last_name}`
                        : p.author || "—");
                    const yearLvl   = p.year_level || p.student?.year_level || "—";

                    return (
                      <tr key={paperId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">

                        {/* Title */}
                        <td className="px-6 py-5 max-w-[150px]">
                          <span className="text-sm font-medium text-gray-900 line-clamp-2">{p.title ?? "—"}</span>
                        </td>

                        {/* Program */}
                        <td className="px-4 py-5 max-w-[140px]">
                          <span className="text-sm text-gray-600">{getProgramName(p.program)}</span>
                        </td>

                        {/* Year Level */}
                        <td className="px-4 py-5 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{formatYearLevel(yearLvl)}</span>
                        </td>

                        {/* Submitted By */}
                        <td className="px-4 py-5 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{studentName}</span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-5 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {p.date_submitted || p.created_at
                              ? new Date(p.date_submitted || p.created_at).toLocaleDateString("en-US", {
                                  month: "numeric", day: "numeric", year: "numeric",
                                })
                              : "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-5">
                          <StatusBadge status={stat} />
                        </td>

                        {/* Similarity */}
                        <td className="px-4 py-5">
                          <SimilarityCell similarity={sim} />
                        </td>

                        {/* Action */}
                        <td className="px-4 py-5">
                          {stat === "pending" ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleStatusUpdate(paperId, "approved")}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#134F4F] rounded-lg hover:bg-teal-800 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(paperId, "rejected")}
                                className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (stat === "approved" || stat === "rejected") ? (
                            <a
                              href={`http://127.0.0.1:8000/api/research-papers/${paperId}/download`}
                              className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm font-semibold whitespace-nowrap"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <IoDocumentTextOutline className="w-4 h-4" />
                              PDF
                            </a>
                          ) : (
                            <span className="text-sm text-gray-300">—</span>
                          )}
                        </td>

                        {/* View Details */}
                        <td className="px-4 py-5 text-center">
                          <button
                            onClick={() => handleViewDetails(p)}
                            className="p-2 bg-[#1a3a5c] text-white rounded-lg hover:bg-[#15304f] transition-colors"
                            title="View Details"
                          >
                            <IoEyeOutline className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-gray-400 text-sm">
                      No papers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ── */}
        {!loading && !error && (
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50/60 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {pagination.total > 0
                ? `Showing ${start}–${end} of ${pagination.total} pages`
                : "No results"}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goTo(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <IoChevronBackOutline className="w-3.5 h-3.5" />
              </button>
              {pageNums.map((n) => (
                <button
                  key={n}
                  onClick={() => goTo(n)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors ${
                    n === pagination.current_page
                      ? "bg-[#134F4F] text-white border-[#134F4F]"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => goTo(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <IoChevronForwardOutline className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}