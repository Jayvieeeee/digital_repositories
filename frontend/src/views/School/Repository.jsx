import { useState, useMemo } from "react";
import {
  IoSearchOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_PAPERS = [
  { id: 1,  title: "Development of a Capstone",                        program: "Computer Science",       year_section: "4th Year - B", author: "Sarah Johnson", date_submitted: "2026-01-23", citations: 7,  pending_requests: 3, status: "Approved",  school_year: "2025-2026" },
  { id: 2,  title: "Development of a Capstone",                        program: "Computer Science",       year_section: "4th Year - B", author: "Sarah Johnson", date_submitted: "2026-01-23", citations: 7,  pending_requests: 3, status: "Pending",   school_year: "2025-2026" },
  { id: 3,  title: "Development of a Capstone",                        program: "Computer Science",       year_section: "4th Year - B", author: "Sarah Johnson", date_submitted: "2026-01-23", citations: 7,  pending_requests: 3, status: "Revision",  school_year: "2025-2026" },
  { id: 4,  title: "Development of a Capstone",                        program: "Computer Science",       year_section: "4th Year - B", author: "Sarah Johnson", date_submitted: "2026-01-23", citations: 7,  pending_requests: 3, status: "Approved",  school_year: "2025-2026" },
  { id: 5,  title: "Development of a Capstone",                        program: "Computer Science",       year_section: "4th Year - B", author: "Sarah Johnson", date_submitted: "2026-01-23", citations: 7,  pending_requests: 3, status: "Approved",  school_year: "2025-2026" },
  { id: 6,  title: "AI-Based Grading System",                          program: "Information Technology", year_section: "4th Year - A", author: "Mark Reyes",    date_submitted: "2026-01-15", citations: 4,  pending_requests: 1, status: "Approved",  school_year: "2025-2026" },
  { id: 7,  title: "Blockchain in Academic Record Verification",        program: "Information Systems",    year_section: "3rd Year - B", author: "Ana Torres",    date_submitted: "2026-01-10", citations: 2,  pending_requests: 5, status: "Pending",   school_year: "2025-2026" },
  { id: 8,  title: "Smart Library Management",                         program: "Computer Science",       year_section: "3rd Year - A", author: "Luis Garcia",   date_submitted: "2026-01-08", citations: 9,  pending_requests: 0, status: "Approved",  school_year: "2025-2026" },
  { id: 9,  title: "Predictive Analytics for Student Performance",      program: "Information Technology", year_section: "4th Year - B", author: "Clara Santos",  date_submitted: "2025-12-20", citations: 3,  pending_requests: 2, status: "Revision",  school_year: "2025-2026" },
  { id: 10, title: "IoT-Based Attendance System",                       program: "Computer Science",       year_section: "4th Year - A", author: "Ryan Lim",      date_submitted: "2025-12-15", citations: 6,  pending_requests: 1, status: "Approved",  school_year: "2025-2026" },
  { id: 11, title: "Mobile App for Campus Navigation",                  program: "Information Systems",    year_section: "3rd Year - A", author: "Nina Cruz",     date_submitted: "2025-06-10", citations: 5,  pending_requests: 0, status: "Approved",  school_year: "2024-2025" },
  { id: 12, title: "Machine Learning Approaches for Healthcare",        program: "Computer Science",       year_section: "4th Year - B", author: "James Uy",      date_submitted: "2025-05-22", citations: 12, pending_requests: 2, status: "Approved",  school_year: "2024-2025" },
  { id: 13, title: "E-Commerce Platform for Local Vendors",             program: "Information Technology", year_section: "4th Year - A", author: "Maria Lopez",   date_submitted: "2024-11-30", citations: 8,  pending_requests: 0, status: "Approved",  school_year: "2023-2024" },
];

const ITEMS_PER_PAGE = 10;

const SY_TABS = [
  { label: "SY 2025 - 2026", value: "2025-2026", current: true },
  { label: "SY 2024 - 2025", value: "2024-2025" },
  { label: "SY 2023 - 2024", value: "2023-2024" },
  { label: "All Years",      value: "all" },
];

function StatusBadge({ status }) {
  const map = {
    Approved: "bg-green-100 text-green-700",
    Pending:  "bg-yellow-100 text-yellow-700",
    Revision: "bg-purple-100 text-purple-700",
    Rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-3 py-1 rounded-md text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

export default function LibrarianRepository() {
  const [search, setSearch]           = useState("");
  const [program, setProgram]         = useState("");
  const [section, setSection]         = useState("");
  const [activeSY, setActiveSY]       = useState("2025-2026");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return MOCK_PAPERS.filter((p) => {
      const matchSY      = activeSY === "all" || p.school_year === activeSY;
      const matchSearch  = !search  || p.title.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase());
      const matchProgram = !program || p.program === program;
      const matchSection = !section || p.year_section === section;
      return matchSY && matchSearch && matchProgram && matchSection;
    });
  }, [search, program, section, activeSY]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSY      = (val) => { setActiveSY(val);          setCurrentPage(1); };
  const handleSearch  = (e)   => { setSearch(e.target.value); setCurrentPage(1); };
  const handleProgram = (e)   => { setProgram(e.target.value);setCurrentPage(1); };
  const handleSection = (e)   => { setSection(e.target.value);setCurrentPage(1); };
  const goTo          = (p)   => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1));

  return (
    <div className="space-y-5">

      {/* School Year Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-1 flex-wrap">
        {SY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleSY(tab.value)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSY === tab.value
                ? "bg-[#134F4F] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
            {tab.current && activeSY === tab.value && (
              <span className="ml-1.5 text-[10px] font-semibold opacity-80">(Current)</span>
            )}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
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
            <select value={program} onChange={handleProgram} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">All Programs</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Information Systems">Information Systems</option>
            </select>
            <select value={section} onChange={handleSection} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">All Sections</option>
              <option value="4th Year - A">4th Year - A</option>
              <option value="4th Year - B">4th Year - B</option>
              <option value="3rd Year - A">3rd Year - A</option>
              <option value="3rd Year - B">3rd Year - B</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 font-medium">Research Title</th>
                <th className="text-left px-4 py-3 font-medium">Academic Program</th>
                <th className="text-left px-4 py-3 font-medium">Year & Section</th>
                <th className="text-left px-4 py-3 font-medium">Submitted By</th>
                <th className="text-left px-4 py-3 font-medium">Date Submitted</th>
                <th className="text-left px-4 py-3 font-medium">PDF</th>
                <th className="text-left px-4 py-3 font-medium">Citations</th>
                <th className="text-left px-4 py-3 font-medium">Pending Request</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length > 0 ? (
                paginated.map((paper) => (
                  <tr key={paper.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900 max-w-[160px]">
                      <span className="line-clamp-2">{paper.title}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{paper.program}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{paper.year_section}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{paper.author}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(paper.date_submitted).toLocaleDateString("en-US")}
                    </td>
                    <td className="px-4 py-3">
                      <button className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-semibold">
                        <IoDocumentTextOutline className="w-4 h-4" /> PDF
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">
                        {paper.citations}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-md">
                        {paper.pending_requests}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={paper.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 bg-[#134F4F] text-white rounded-md hover:bg-teal-800 transition-colors">
                        <IoEyeOutline className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400 text-sm">
                    No papers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing {filtered.length > 0
              ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}`
              : "0"} of {filtered.length} papers
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <IoChevronBackOutline className="w-4 h-4" />
            </button>
            {pageNums.map((p) => (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium border transition-colors ${
                  p === currentPage
                    ? "bg-[#134F4F] text-white border-[#134F4F]"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => goTo(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <IoChevronForwardOutline className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}