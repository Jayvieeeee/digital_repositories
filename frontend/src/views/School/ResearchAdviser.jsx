import { useState, useMemo } from "react";
import {
  IoSearchOutline,
  IoAddOutline,
  IoCreateOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ADVISERS = [
  { id: 1,  name: "Ramon Pascual",   program: "Computer Science",       sections: ["4th Year - A", "4th Year - B"], papers_approved: 19, status: "Active"   },
  { id: 2,  name: "Ramon Pascual",   program: "Computer Science",       sections: ["4th Year - A"],                 papers_approved: 19, status: "Active"   },
  { id: 3,  name: "Ramon Pascual",   program: "Computer Science",       sections: ["4th Year - A"],                 papers_approved: 19, status: "Active"   },
  { id: 4,  name: "Ramon Pascual",   program: "Computer Science",       sections: ["4th Year - A"],                 papers_approved: 19, status: "Active"   },
  { id: 5,  name: "Ramon Pascual",   program: "Computer Science",       sections: ["4th Year - A"],                 papers_approved: 19, status: "Active"   },
  { id: 6,  name: "Ramon Pascual",   program: "Computer Science",       sections: ["4th Year - A"],                 papers_approved: 19, status: "Active"   },
  { id: 7,  name: "Maria Santos",    program: "Information Technology", sections: ["3rd Year - A", "3rd Year - B"], papers_approved: 12, status: "Inactive" },
  { id: 8,  name: "Jose Reyes",      program: "Information Systems",    sections: ["4th Year - B"],                 papers_approved: 8,  status: "Inactive" },
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

function SectionChip({ label }) {
  return (
    <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 text-xs font-medium rounded-md border border-teal-100">
      {label}
    </span>
  );
}

export default function ResearchAdvisers() {
  const [search, setSearch]           = useState("");
  const [program, setProgram]         = useState("");
  const [statusFilter, setStatus]     = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return MOCK_ADVISERS.filter((a) => {
      const matchSearch  = !search  || a.name.toLowerCase().includes(search.toLowerCase());
      const matchProgram = !program || a.program === program;
      const matchStatus  = !statusFilter || a.status === statusFilter;
      return matchSearch && matchProgram && matchStatus;
    });
  }, [search, program, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const activeCount   = MOCK_ADVISERS.filter((a) => a.status === "Active").length;
  const inactiveCount = MOCK_ADVISERS.filter((a) => a.status === "Inactive").length;

  const handleSearch  = (e) => { setSearch(e.target.value);  setCurrentPage(1); };
  const handleProgram = (e) => { setProgram(e.target.value); setCurrentPage(1); };
  const handleStatus  = (e) => { setStatus(e.target.value);  setCurrentPage(1); };
  const goTo          = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1));

  return (
    <div className="space-y-5">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">{MOCK_ADVISERS.length} Advisers</span>
          <span className="ml-3 text-green-600 font-semibold">{activeCount} Active</span>
          <span className="ml-2 text-gray-400">{inactiveCount} Inactive</span>
        </p>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#134F4F] hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors">
          <IoAddOutline className="w-4 h-4" />
          Create Adviser Account
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="relative w-full sm:w-64">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search advisers..."
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
            <select value={statusFilter} onChange={handleStatus} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Academic Program</th>
                <th className="text-left px-4 py-3 font-medium">Sections Handled</th>
                <th className="text-left px-4 py-3 font-medium">Papers Approved</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length > 0 ? (
                paginated.map((adviser) => (
                  <tr key={adviser.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{adviser.name}</td>
                    <td className="px-4 py-4 text-gray-600">{adviser.program}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {adviser.sections.map((s) => (
                          <SectionChip key={s} label={s} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-700 font-medium">{adviser.papers_approved}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={adviser.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {/* Edit */}
                        <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
                          <IoCreateOutline className="w-4 h-4" />
                        </button>
                        {/* Deactivate / Activate */}
                        <button
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                            adviser.status === "Active"
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {adviser.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    No advisers found.
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
              : "0"} of {filtered.length} pages
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