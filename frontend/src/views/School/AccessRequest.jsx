import { useState, useMemo } from "react";
import {
  IoSearchOutline,
  IoPersonOutline,
  IoSchoolOutline,
  IoDocumentTextOutline,
} from "react-icons/io5";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_REQUESTS = [
  {
    id: 1,
    title: "Machine Learning Approaches for Predictive Healthcare Analytics",
    requester: "Santos, Maria",
    institution: "TUP",
    program: "Computer Science",
    year_level: "4th Year",
    reason: "I need this paper for my thesis on decentralized credentialing systems at TUP.",
    requested_date: "1/23/2026",
    status: "Pending",
  },
  {
    id: 2,
    title: "Machine Learning Approaches for Predictive Healthcare Analytics",
    requester: "Santos, Maria",
    institution: "TUP",
    program: "Computer Science",
    year_level: "4th Year",
    reason: "I need this paper for my thesis on decentralized credentialing systems at TUP.",
    requested_date: "1/23/2026",
    status: "Pending",
  },
  {
    id: 3,
    title: "Machine Learning Approaches for Predictive Healthcare Analytics",
    requester: "Santos, Maria",
    institution: "TUP",
    program: "Computer Science",
    year_level: "4th Year",
    reason: "I need this paper for my thesis on decentralized credentialing systems at TUP.",
    requested_date: "1/23/2026",
    status: "Pending",
  },
  {
    id: 4,
    title: "Machine Learning Approaches for Predictive Healthcare Analytics",
    requester: "Santos, Maria",
    institution: "TUP",
    program: "Computer Science",
    year_level: "4th Year",
    reason: "I need this paper for my thesis on decentralized credentialing systems at TUP.",
    requested_date: "1/23/2026",
    status: "Approved",
  },
  {
    id: 5,
    title: "Blockchain in Academic Record Verification",
    requester: "Reyes, Mark",
    institution: "TUP",
    program: "Information Technology",
    year_level: "3rd Year",
    reason: "Needed for our capstone project research on distributed ledger technology.",
    requested_date: "1/20/2026",
    status: "Approved",
  },
  {
    id: 6,
    title: "IoT-Based Attendance System",
    requester: "Cruz, Ana",
    institution: "TUP",
    program: "Computer Science",
    year_level: "4th Year",
    reason: "Reference material for our ongoing system development thesis.",
    requested_date: "1/18/2026",
    status: "Approved",
  },
  {
    id: 7,
    title: "Smart Library Management System",
    requester: "Lim, Ryan",
    institution: "TUP",
    program: "Information Systems",
    year_level: "4th Year",
    reason: "Comparison study for our proposed library management system.",
    requested_date: "1/15/2026",
    status: "Approved",
  },
  {
    id: 8,  title: "AI-Based Grading System",        requester: "Garcia, Luis",  institution: "TUP", program: "Computer Science",       year_level: "3rd Year", reason: "Research reference for AI integration in education.", requested_date: "1/10/2026", status: "Approved"  },
  {
    id: 9,  title: "Predictive Analytics for Students", requester: "Torres, Clara", institution: "TUP", program: "Information Technology", year_level: "4th Year", reason: "Supporting material for predictive modelling thesis.",   requested_date: "1/08/2026", status: "Approved"  },
  {
    id: 10, title: "E-Commerce for Local Vendors",    requester: "Uy, James",     institution: "TUP", program: "Computer Science",       year_level: "4th Year", reason: "Required reading for e-commerce capstone project.",       requested_date: "1/05/2026", status: "Approved"  },
  {
    id: 11, title: "Mobile App for Campus Navigation", requester: "Lopez, Maria",  institution: "TUP", program: "Information Systems",    year_level: "3rd Year", reason: "UX research reference for mobile application thesis.",     requested_date: "1/03/2026", status: "Approved"  },
  {
    id: 12, title: "Deep Learning for Image Recognition", requester: "Tan, Kevin",   institution: "TUP", program: "Computer Science",       year_level: "4th Year", reason: "Baseline comparison for our CNN-based research.",          requested_date: "12/28/2025", status: "Approved" },
  {
    id: 13, title: "Natural Language Processing Research", requester: "Ramos, Joy",    institution: "TUP", program: "Information Technology", year_level: "4th Year", reason: "Reference for NLP-based chatbot thesis.",                  requested_date: "12/20/2025", status: "Rejected" },
  {
    id: 14, title: "Data Privacy in Cloud Systems",       requester: "Dela Cruz, Ben", institution: "TUP", program: "Computer Science",       year_level: "3rd Year", reason: "Supporting reference for cybersecurity thesis.",             requested_date: "12/15/2025", status: "Rejected" },
  {
    id: 15, title: "Augmented Reality in Education",      requester: "Flores, Nina",   institution: "TUP", program: "Information Systems",    year_level: "4th Year", reason: "Visual reference for AR-based learning app project.",        requested_date: "12/10/2025", status: "Rejected" },
  {
    id: 16, title: "Cybersecurity Threat Detection",      requester: "Aquino, Dan",    institution: "TUP", program: "Computer Science",       year_level: "4th Year", reason: "Needed for threat-modelling section of our thesis.",         requested_date: "12/05/2025", status: "Rejected" },
  {
    id: 17, title: "Cloud Computing for SMEs",            requester: "Mendoza, Carl",  institution: "TUP", program: "Information Technology", year_level: "3rd Year", reason: "Background study for cloud migration thesis.",              requested_date: "12/01/2025", status: "Rejected" },
  {
    id: 18, title: "Robotics in Manufacturing",           requester: "Villanueva, Ed", institution: "TUP", program: "Information Systems",    year_level: "4th Year", reason: "Reference for automation and robotics capstone.",            requested_date: "11/28/2025", status: "Rejected" },
];

const TABS = ["All", "Pending", "Approved", "Rejected"];

const STATUS_STYLES = {
  Pending:  { tab: "text-yellow-600 font-bold", badge: "bg-yellow-100 text-yellow-700" },
  Approved: { tab: "text-green-600",            badge: "bg-green-100 text-green-700"   },
  Rejected: { tab: "text-red-500",              badge: "bg-red-100 text-red-700"       },
};

// ─── Request Card ─────────────────────────────────────────────────────────────
function RequestCard({ request, onApprove, onReject }) {
  const isApproved = request.status === "Approved";
  const isRejected = request.status === "Rejected";

  // Avatar initials from institution
  const initials = request.institution?.slice(0, 3).toUpperCase() || "TUP";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#134F4F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 leading-snug">{request.title}</h3>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <IoPersonOutline className="w-3.5 h-3.5" />
                {request.requester}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <IoSchoolOutline className="w-3.5 h-3.5" />
                {request.institution}
              </span>
              <span className="text-xs text-gray-500">{request.program}</span>
              <span className="text-xs text-gray-500">{request.year_level}</span>
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-gray-400 whitespace-nowrap">
            {isApproved ? "Approved Date:" : isRejected ? "Rejected Date:" : "Requested Date:"}
          </p>
          <p className="text-xs font-medium text-gray-600">{request.requested_date}</p>
        </div>
      </div>

      {/* Reason */}
      <div className="bg-gray-50 rounded-lg px-4 py-2.5">
        <p className="text-xs text-gray-600 italic">"{request.reason}"</p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {isApproved ? (
          <>
            <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
              Approved
            </span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 text-xs font-semibold rounded-md hover:bg-red-100 transition-colors">
              <IoDocumentTextOutline className="w-3.5 h-3.5" /> Preview
            </button>
          </>
        ) : isRejected ? (
          <span className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded-md">
            Rejected
          </span>
        ) : (
          <>
            <button
              onClick={() => onApprove(request.id)}
              className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md hover:bg-green-200 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => onReject(request.id)}
              className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded-md hover:bg-red-200 transition-colors"
            >
              Reject
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 text-xs font-semibold rounded-md hover:bg-red-100 transition-colors">
              <IoDocumentTextOutline className="w-3.5 h-3.5" /> PDF Preview
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AccessRequests() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("");

  const counts = useMemo(() => ({
    Pending:  requests.filter((r) => r.status === "Pending").length,
    Approved: requests.filter((r) => r.status === "Approved").length,
    Rejected: requests.filter((r) => r.status === "Rejected").length,
  }), [requests]);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchTab    = activeTab === "All" || r.status === activeTab;
      const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.requester.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || r.status === statusFilter;
      return matchTab && matchSearch && matchStatus;
    });
  }, [requests, activeTab, search, statusFilter]);

  const handleApprove = (id) =>
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "Approved" } : r));

  const handleReject = (id) =>
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "Rejected" } : r));

  return (
    <div className="space-y-5">

      {/* Header filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("Pending")}
            className={`text-sm transition-colors ${activeTab === "Pending" ? "text-yellow-600 font-bold" : "text-gray-500 hover:text-gray-800"}`}
          >
            <span className="font-bold">{counts.Pending}</span> Pending
          </button>
          <button
            onClick={() => setActiveTab("Approved")}
            className={`text-sm transition-colors ${activeTab === "Approved" ? "text-green-600 font-bold" : "text-gray-500 hover:text-gray-800"}`}
          >
            <span className="font-bold">{counts.Approved}</span> Approved
          </button>
          <button
            onClick={() => setActiveTab("Rejected")}
            className={`text-sm transition-colors ${activeTab === "Rejected" ? "text-red-500 font-bold" : "text-gray-500 hover:text-gray-800"}`}
          >
            <span className="font-bold">{counts.Rejected}</span> Rejected
          </button>
          {activeTab !== "All" && (
            <button onClick={() => setActiveTab("All")} className="text-xs text-gray-400 hover:text-gray-600 underline">
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        ) : (
          <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
            No requests found.
          </div>
        )}
      </div>
    </div>
  );
}