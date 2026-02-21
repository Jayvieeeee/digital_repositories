import { useState } from "react";
import {
  IoPeopleOutline,
  IoPersonOutline,
  IoDocumentTextOutline,
  IoSendOutline,
  IoCheckmarkCircleOutline,
  IoEyeOutline,
  IoArrowForwardOutline,
  IoSearchOutline,
  IoFunnelOutline,
} from "react-icons/io5";

/* ───────────────────── MOCK DATA ───────────────────── */

const MOCK_STATS = {
  advisers: 4,
  students: 128,
  uploadedPapers: 56,
  pendingAccessRequests: 3,
  pendingStudentApprovals: 2,
};

const MOCK_PAPERS = [
  {
    id: 1,
    title: "AI-Based Student Performance Prediction",
    program: "BSIT",
    year_section: "4-A",
    author: "Juan Dela Cruz",
    date_submitted: "2025-02-01",
    pdf_url: "#",
    citations: 12,
    year: 2025,
  },
  {
    id: 2,
    title: "Blockchain in Academic Records",
    program: "BSCS",
    year_section: "3-B",
    author: "Maria Santos",
    date_submitted: "2025-01-20",
    pdf_url: "#",
    citations: 7,
    year: 2025,
  },
  {
    id: 3,
    title: "IoT-Based Smart Library System",
    program: "BSIT",
    year_section: "4-C",
    author: "Pedro Reyes",
    date_submitted: "2024-11-10",
    pdf_url: "#",
    citations: 4,
    year: 2024,
  },
];

const MOCK_ADVISERS = [
  { id: 1, first_name: "Ana", last_name: "Lopez", sections: 3, papers: 12, status: "Active" },
  { id: 2, first_name: "Mark", last_name: "Reyes", sections: 2, papers: 8, status: "Active" },
  { id: 3, first_name: "John", last_name: "Cruz", sections: 4, papers: 15, status: "Active" },
  { id: 4, first_name: "Lea", last_name: "Santos", sections: 1, papers: 5, status: "Inactive" },
];

const MOCK_STUDENT_APPROVALS = [
  { id: 1, name: "Carlo Mendoza", status_label: "New Registration" },
  { id: 2, name: "Jenny Ramos", status_label: "Pending Verification" },
];

const MOCK_ACCESS_REQUESTS = [
  { id: 1, title: "AI-Based Student Performance Prediction", requester: "Guest User", date: "2025-02-18", status: "Pending" },
  { id: 2, title: "Blockchain in Academic Records", requester: "Alumni User", date: "2025-02-19", status: "Pending" },
];

/* ───────────────────── UI COMPONENTS ───────────────────── */

function StatCard({ icon: Icon, iconColor, count, label, linkLabel, onLink }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Icon className={`w-8 h-8 ${iconColor}`} />
        <span className="text-4xl font-bold text-gray-900">{count}</span>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      {linkLabel && (
        <button
          onClick={onLink}
          className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 w-fit"
        >
          {linkLabel} <IoArrowForwardOutline className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Pending:  "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Active:   "bg-green-100 text-green-700",
    Inactive: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function Avatar({ name, color = "bg-teal-700" }) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

/* ───────────────────── MAIN ───────────────────── */

export default function LibrarianDashboard() {
  const [stats] = useState(MOCK_STATS);
  const [papers] = useState(MOCK_PAPERS);
  const [advisers] = useState(MOCK_ADVISERS);
  const [studentApprovals] = useState(MOCK_STUDENT_APPROVALS);
  const [accessRequests] = useState(MOCK_ACCESS_REQUESTS);

  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const filteredPapers = papers.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase());

    const matchYear = !filterYear || String(p.year) === filterYear;

    return matchSearch && matchYear;
  });

  const STAT_CARDS = [
    { icon: IoPeopleOutline,          iconColor: "text-blue-500",   count: stats.advisers,                label: "Research Advisers",         linkLabel: "View List" },
    { icon: IoPersonOutline,          iconColor: "text-teal-500",   count: stats.students,                label: "Students",                  linkLabel: "View List" },
    { icon: IoDocumentTextOutline,    iconColor: "text-green-500",  count: stats.uploadedPapers,          label: "Uploaded Papers",           linkLabel: "View Papers" },
    { icon: IoSendOutline,            iconColor: "text-yellow-500", count: stats.pendingAccessRequests,   label: "Pending Access Requests",   linkLabel: "Review" },
    { icon: IoCheckmarkCircleOutline, iconColor: "text-orange-400", count: stats.pendingStudentApprovals, label: "Pending Student Approvals", linkLabel: "Review" },
  ];

  return (
    <div className="space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {STAT_CARDS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Repository Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Repository Overview</h2>

          <div className="flex items-center gap-2">
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, author, keyword…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-56"
              />
            </div>

            <div className="relative">
              <IoFunnelOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
              >
                <option value="">Filter by Year</option>
                {[2026, 2025, 2024, 2023, 2022].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium">Research Title</th>
                <th className="text-left px-4 py-3 font-medium">Academic Program</th>
                <th className="text-left px-4 py-3 font-medium">Year & Section</th>
                <th className="text-left px-4 py-3 font-medium">Submitted By</th>
                <th className="text-left px-4 py-3 font-medium">Date Submitted</th>
                <th className="text-left px-4 py-3 font-medium">PDF</th>
                <th className="text-left px-4 py-3 font-medium">Citations</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filteredPapers.map((paper) => (
                <tr key={paper.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900 max-w-[180px] truncate">{paper.title}</td>
                  <td className="px-4 py-3 text-gray-600">{paper.program}</td>
                  <td className="px-4 py-3 text-gray-600">{paper.year_section}</td>
                  <td className="px-4 py-3 text-gray-600">{paper.author}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(paper.date_submitted).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <a href={paper.pdf_url} className="flex items-center gap-1 text-red-500 text-xs font-medium">
                      <IoDocumentTextOutline className="w-4 h-4" /> PDF
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 bg-teal-50 text-teal-800 text-xs font-semibold rounded-md">
                      {paper.citations}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 bg-[#134F4F] text-white rounded-md">
                      <IoEyeOutline className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Advisers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Research Advisers</h2>
          </div>

          <div className="divide-y divide-gray-50">
            {advisers.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-6 py-3">
                <Avatar name={`${a.first_name} ${a.last_name}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{a.first_name} {a.last_name}</p>
                  <p className="text-xs text-gray-500">{a.sections} Sections · {a.papers} papers</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side */}
        <div className="space-y-6">

          {/* Student Approvals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Student Approvals</h2>
            </div>

            <div className="divide-y divide-gray-50">
              {studentApprovals.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-6 py-3">
                  <Avatar name={s.name} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.status_label}</p>
                  </div>
                  <button className="px-3 py-1 bg-[#134F4F] text-white text-xs font-semibold rounded-md">
                    Approve
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Access Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Pending Access Request</h2>
            </div>

            <div className="divide-y divide-gray-50">
              {accessRequests.map((r) => (
                <div key={r.id} className="flex justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.title}</p>
                    <p className="text-xs text-gray-500">Requested by {r.requester} · {r.date}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}