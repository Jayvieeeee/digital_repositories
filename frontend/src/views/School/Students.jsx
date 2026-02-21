import { useState, useMemo } from "react";
import {
  IoSearchOutline,
  IoAddOutline,
  IoCreateOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoFolderOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
} from "react-icons/io5";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STUDENTS = [
  // SY 2025-2026
  { id: 1,  name: "Ramon Pascual", program: "Computer Science",       year_level: "4th Year", adviser: "Ramon Pascual", status: "Active",   school_year: "2025-2026" },
  { id: 2,  name: "Ramon Pascual", program: "Computer Science",       year_level: "4th Year", adviser: "Ramon Pascual", status: "Active",   school_year: "2025-2026" },
  { id: 3,  name: "Ramon Pascual", program: "Computer Science",       year_level: "4th Year", adviser: "Ramon Pascual", status: "Active",   school_year: "2025-2026" },
  { id: 4,  name: "Ramon Pascual", program: "Computer Science",       year_level: "4th Year", adviser: "Ramon Pascual", status: "Active",   school_year: "2025-2026" },
  { id: 5,  name: "Ramon Pascual", program: "Computer Science",       year_level: "4th Year", adviser: "Ramon Pascual", status: "Active",   school_year: "2025-2026" },
  { id: 6,  name: "Ramon Pascual", program: "Computer Science",       year_level: "4th Year", adviser: "Ramon Pascual", status: "Active",   school_year: "2025-2026" },
  { id: 7,  name: "Ramon Pascual", program: "Computer Science",       year_level: "4th Year", adviser: "Ramon Pascual", status: "Active",   school_year: "2025-2026" },
  { id: 8,  name: "Sarah Johnson", program: "Information Technology", year_level: "3rd Year", adviser: "Maria Santos",  status: "Inactive", school_year: "2025-2026" },
  { id: 9,  name: "Mark Reyes",    program: "Information Systems",    year_level: "4th Year", adviser: "Jose Reyes",   status: "Active",   school_year: "2025-2026" },
  { id: 10, name: "Ana Torres",    program: "Computer Science",       year_level: "3rd Year", adviser: "Ramon Pascual", status: "Active",   school_year: "2025-2026" },
  // SY 2024-2025
  { id: 11, name: "Luis Garcia",   program: "Computer Science",       year_level: "4th Year", adviser: "Ramon Pascual", status: "Active",   school_year: "2024-2025" },
  { id: 12, name: "Clara Santos",  program: "Information Technology", year_level: "4th Year", adviser: "Maria Santos",  status: "Active",   school_year: "2024-2025" },
  // SY 2023-2024
  { id: 13, name: "Ryan Lim",      program: "Computer Science",       year_level: "4th Year", adviser: "Ramon Pascual", status: "Active",   school_year: "2023-2024" },
];

const SCHOOL_YEARS = [
  { value: "2025-2026", label: "SY 2025 - 2026", current: true  },
  { value: "2024-2025", label: "SY 2024 - 2025", current: false },
  { value: "2023-2024", label: "SY 2023 - 2024", current: false },
];

const ITEMS_PER_PAGE = 10;

function StatusBadge({ status }) {
  return (
    <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
      status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
    }`}>
      {status}
    </span>
  );
}

// ─── Per-SY accordion section ─────────────────────────────────────────────────
function SYSection({ syConfig, allStudents, search, program, statusFilter }) {
  const [expanded, setExpanded]   = useState(syConfig.current);
  const [currentPage, setCurrentPage] = useState(1);

  const syStudents = allStudents.filter((s) => s.school_year === syConfig.value);

  const filtered = useMemo(() => {
    return syStudents.filter((s) => {
      const matchSearch  = !search  || s.name.toLowerCase().includes(search.toLowerCase());
      const matchProgram = !program || s.program === program;
      const matchStatus  = !statusFilter || s.status === statusFilter;
      return matchSearch && matchProgram && matchStatus;
    });
  }, [syStudents, search, program, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const goTo       = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));
  const pageNums   = Array.from({ length: totalPages }, (_, i) => i + 1)
    .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Section header */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <IoFolderOutline className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-semibold text-gray-900">{syConfig.label}</span>
          {syConfig.current && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
              Current
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!syConfig.current && (
            <button
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1 text-xs font-medium border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
            >
              Archive
            </button>
          )}
          {syConfig.current && (
            <button
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1 text-xs font-medium border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
            >
              Archive
            </button>
          )}
          <span className="text-xs text-gray-500 font-medium">{syStudents.length} Students</span>
          {expanded
            ? <IoChevronUpOutline className="w-4 h-4 text-gray-400" />
            : <IoChevronDownOutline className="w-4 h-4 text-gray-400" />
          }
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <>
          <div className="overflow-x-auto border-t border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Academic Program</th>
                  <th className="text-left px-4 py-3 font-medium">Year Level</th>
                  <th className="text-left px-4 py-3 font-medium">Research Adviser</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left pl-12 px-4 py-3 font-medium ">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length > 0 ? (
                  paginated.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900">{student.name}</td>
                      <td className="px-4 py-3 text-gray-600">{student.program}</td>
                      <td className="px-4 py-3 text-gray-600">{student.year_level}</td>
                      <td className="px-4 py-3 text-gray-600">{student.adviser}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
                            <IoCreateOutline className="w-4 h-4" />
                          </button>
                          <button className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                            student.status === "Active"
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}>
                            {student.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-500">
              Showing {filtered.length > 0
                ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}`
                : "0"} of {filtered.length} pages
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goTo(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <IoChevronBackOutline className="w-3.5 h-3.5" />
              </button>
              {pageNums.map((p) => (
                <button
                  key={p}
                  onClick={() => goTo(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium border transition-colors ${
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
                className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <IoChevronForwardOutline className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Students() {
  const [search, setSearch]       = useState("");
  const [program, setProgram]     = useState("");
  const [statusFilter, setStatus] = useState("");

  return (
    <div className="space-y-5">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">{MOCK_STUDENTS.length} Students</span>
          <span className="ml-1 text-gray-400">across all academic years</span>
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select value={program} onChange={(e) => setProgram(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">All Programs</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Information Systems">Information Systems</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Per-SY accordion sections */}
      {SCHOOL_YEARS.map((sy) => (
        <SYSection
          key={sy.value}
          syConfig={sy}
          allStudents={MOCK_STUDENTS}
          search={search}
          program={program}
          statusFilter={statusFilter}
        />
      ))}
    </div>
  );
}