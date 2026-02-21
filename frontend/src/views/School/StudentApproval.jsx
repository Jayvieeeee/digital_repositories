import { useState, useMemo } from "react";
import { IoSearchOutline, IoSchoolOutline, IoPersonOutline } from "react-icons/io5";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_APPROVALS = [
  { id: 1,  name: "Sarah Johnson", student_id: "2023-0226", institution: "TUP", program: "Computer Science", year_level: "4th Year", requested_date: "1/23/2026", status: "Pending"  },
  { id: 2,  name: "Sarah Johnson", student_id: "2023-0226", institution: "TUP", program: "Computer Science", year_level: "4th Year", requested_date: "1/23/2026", status: "Pending"  },
  { id: 3,  name: "Sarah Johnson", student_id: "2023-0226", institution: "TUP", program: "Computer Science", year_level: "4th Year", requested_date: "1/23/2026", status: "Pending"  },
  { id: 4,  name: "Sarah Johnson", student_id: "2023-0226", institution: "TUP", program: "Computer Science", year_level: "4th Year", requested_date: "1/23/2026", status: "Pending"  },
  { id: 5,  name: "Sarah Johnson", student_id: "2023-0226", institution: "TUP", program: "Computer Science", year_level: "4th Year", requested_date: "1/23/2026", status: "Approved" },
  { id: 6,  name: "Mark Reyes",    student_id: "2023-0180", institution: "TUP", program: "Information Technology", year_level: "3rd Year", requested_date: "1/20/2026", status: "Approved" },
  { id: 7,  name: "Ana Torres",    student_id: "2022-0341", institution: "TUP", program: "Computer Science",       year_level: "4th Year", requested_date: "1/18/2026", status: "Approved" },
  { id: 8,  name: "Luis Garcia",   student_id: "2023-0099", institution: "TUP", program: "Information Systems",    year_level: "3rd Year", requested_date: "1/15/2026", status: "Approved" },
  { id: 9,  name: "Clara Santos",  student_id: "2022-0452", institution: "TUP", program: "Computer Science",       year_level: "4th Year", requested_date: "1/12/2026", status: "Approved" },
  { id: 10, name: "Ryan Lim",      student_id: "2023-0317", institution: "TUP", program: "Information Technology", year_level: "4th Year", requested_date: "1/10/2026", status: "Approved" },
  { id: 11, name: "Nina Cruz",     student_id: "2022-0198", institution: "TUP", program: "Information Systems",    year_level: "4th Year", requested_date: "1/08/2026", status: "Approved" },
  { id: 12, name: "James Uy",      student_id: "2023-0254", institution: "TUP", program: "Computer Science",       year_level: "3rd Year", requested_date: "1/05/2026", status: "Approved" },
  { id: 13, name: "Maria Lopez",   student_id: "2022-0375", institution: "TUP", program: "Information Technology", year_level: "4th Year", requested_date: "1/03/2026", status: "Approved" },
  { id: 14, name: "Kevin Tan",     student_id: "2023-0412", institution: "TUP", program: "Computer Science",       year_level: "4th Year", requested_date: "12/28/2025", status: "Approved" },
  { id: 15, name: "Joy Ramos",     student_id: "2022-0163", institution: "TUP", program: "Information Systems",    year_level: "3rd Year", requested_date: "12/25/2025", status: "Approved" },
  { id: 16, name: "Ben Dela Cruz", student_id: "2023-0501", institution: "TUP", program: "Computer Science",       year_level: "4th Year", requested_date: "12/22/2025", status: "Approved" },
  { id: 17, name: "Nina Flores",   student_id: "2022-0289", institution: "TUP", program: "Information Technology", year_level: "4th Year", requested_date: "12/20/2025", status: "Approved" },
  { id: 18, name: "Dan Aquino",    student_id: "2023-0137", institution: "TUP", program: "Information Systems",    year_level: "3rd Year", requested_date: "12/18/2025", status: "Approved" },
  { id: 19, name: "Carl Mendoza",  student_id: "2022-0466", institution: "TUP", program: "Computer Science",       year_level: "4th Year", requested_date: "12/15/2025", status: "Approved" },
  { id: 20, name: "Ed Villanueva", student_id: "2023-0322", institution: "TUP", program: "Information Technology", year_level: "4th Year", requested_date: "12/12/2025", status: "Approved" },
  { id: 21, name: "Grace Navarro", student_id: "2022-0514", institution: "TUP", program: "Computer Science",       year_level: "3rd Year", requested_date: "12/10/2025", status: "Approved" },
  { id: 22, name: "Leo Castillo",  student_id: "2023-0078", institution: "TUP", program: "Information Systems",    year_level: "4th Year", requested_date: "12/08/2025", status: "Approved" },
  { id: 23, name: "Rosa Bautista", student_id: "2022-0231", institution: "TUP", program: "Information Technology", year_level: "4th Year", requested_date: "12/05/2025", status: "Approved" },
  { id: 24, name: "Felix Hizon",   student_id: "2023-0395", institution: "TUP", program: "Computer Science",       year_level: "3rd Year", requested_date: "12/03/2025", status: "Approved" },
  { id: 25, name: "Liza Enriquez", student_id: "2022-0108", institution: "TUP", program: "Information Systems",    year_level: "4th Year", requested_date: "12/01/2025", status: "Approved" },
  { id: 26, name: "Vic Tolentino", student_id: "2023-0443", institution: "TUP", program: "Computer Science",       year_level: "4th Year", requested_date: "11/28/2025", status: "Approved" },
  { id: 27, name: "Cris Palma",    student_id: "2022-0356", institution: "TUP", program: "Information Technology", year_level: "3rd Year", requested_date: "11/25/2025", status: "Approved" },
  { id: 28, name: "Andy Salazar",  student_id: "2023-0189", institution: "TUP", program: "Information Systems",    year_level: "4th Year", requested_date: "11/22/2025", status: "Approved" },
  { id: 29, name: "Tina Ocampo",   student_id: "2022-0477", institution: "TUP", program: "Computer Science",       year_level: "4th Year", requested_date: "11/20/2025", status: "Approved" },
  { id: 30, name: "Rex Domingo",   student_id: "2023-0264", institution: "TUP", program: "Information Technology", year_level: "3rd Year", requested_date: "11/18/2025", status: "Approved" },
  { id: 31, name: "Mia Pascua",    student_id: "2022-0143", institution: "TUP", program: "Computer Science",       year_level: "4th Year", requested_date: "11/15/2025", status: "Approved" },
  { id: 32, name: "Don Aguilar",   student_id: "2023-0531", institution: "TUP", program: "Information Systems",    year_level: "4th Year", requested_date: "11/12/2025", status: "Approved" },
  { id: 33, name: "Sol Macaraeg",  student_id: "2022-0397", institution: "TUP", program: "Computer Science",       year_level: "3rd Year", requested_date: "11/10/2025", status: "Approved" },
  { id: 34, name: "Jay Fajardo",   student_id: "2023-0215", institution: "TUP", program: "Information Technology", year_level: "4th Year", requested_date: "11/08/2025", status: "Approved" },
  { id: 35, name: "Kim Soriano",   student_id: "2022-0062", institution: "TUP", program: "Information Systems",    year_level: "4th Year", requested_date: "11/05/2025", status: "Approved" },
  { id: 36, name: "Lyn Medina",    student_id: "2023-0488", institution: "TUP", program: "Computer Science",       year_level: "3rd Year", requested_date: "11/03/2025", status: "Approved" },
  { id: 37, name: "Pat Vergara",   student_id: "2022-0329", institution: "TUP", program: "Information Technology", year_level: "4th Year", requested_date: "11/01/2025", status: "Approved" },
  { id: 38, name: "Sam Guerrero",  student_id: "2023-0152", institution: "TUP", program: "Computer Science",       year_level: "4th Year", requested_date: "10/28/2025", status: "Approved" },
  { id: 39, name: "Luz Reyes",     student_id: "2022-0421", institution: "TUP", program: "Information Systems",    year_level: "3rd Year", requested_date: "10/25/2025", status: "Approved" },
  { id: 40, name: "Gab Herrera",   student_id: "2023-0076", institution: "TUP", program: "Computer Science",       year_level: "4th Year", requested_date: "10/22/2025", status: "Approved" },
  { id: 41, name: "Che Alcantara", student_id: "2022-0508", institution: "TUP", program: "Information Technology", year_level: "4th Year", requested_date: "10/20/2025", status: "Approved" },
  { id: 42, name: "Ric Ibarra",    student_id: "2023-0341", institution: "TUP", program: "Information Systems",    year_level: "3rd Year", requested_date: "10/18/2025", status: "Approved" },
  { id: 43, name: "May Austria",   student_id: "2022-0187", institution: "TUP", program: "Computer Science",       year_level: "4th Year", requested_date: "10/15/2025", status: "Approved" },
  { id: 44, name: "Jun Diaz",      student_id: "2023-0429", institution: "TUP", program: "Information Technology", year_level: "4th Year", requested_date: "10/12/2025", status: "Approved" },
  { id: 45, name: "Amy Trinidad",  student_id: "2022-0275", institution: "TUP", program: "Information Systems",    year_level: "3rd Year", requested_date: "10/10/2025", status: "Approved" },
  { id: 46, name: "Bong Llanes",   student_id: "2023-0113", institution: "TUP", program: "Computer Science",       year_level: "4th Year", requested_date: "10/08/2025", status: "Approved" },
  { id: 47, name: "Dave Manalo",   student_id: "2023-0567", institution: "TUP", program: "Information Technology", year_level: "3rd Year", requested_date: "10/01/2025", status: "Rejected" },
  { id: 48, name: "Nora Esteban",  student_id: "2022-0093", institution: "TUP", program: "Computer Science",       year_level: "4th Year", requested_date: "09/28/2025", status: "Rejected" },
  { id: 49, name: "Ian Quizon",    student_id: "2023-0384", institution: "TUP", program: "Information Systems",    year_level: "4th Year", requested_date: "09/25/2025", status: "Rejected" },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-[#134F4F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

// ─── Approval Card ────────────────────────────────────────────────────────────
function ApprovalCard({ student, onApprove, onReject }) {
  const isApproved = student.status === "Approved";
  const isRejected = student.status === "Rejected";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar name={student.name} />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">{student.name}</p>
              <span className="text-xs text-gray-400">ID: {student.student_id}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <IoSchoolOutline className="w-3.5 h-3.5" /> {student.institution}
              </span>
              <span className="text-xs text-gray-500">{student.program}</span>
              <span className="text-xs text-gray-500">{student.year_level}</span>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3">
              {isApproved ? (
                <>
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
                    Approved
                  </span>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md hover:bg-gray-200 transition-colors">
                    View
                  </button>
                </>
              ) : isRejected ? (
                <>
                  <span className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded-md">
                    Rejected
                  </span>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md hover:bg-gray-200 transition-colors">
                    View
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onApprove(student.id)}
                    className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md hover:bg-green-200 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(student.id)}
                    className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded-md hover:bg-red-200 transition-colors"
                  >
                    Reject
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md hover:bg-gray-200 transition-colors">
                    View
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-gray-400 whitespace-nowrap">
            {isApproved ? "Approved Date:" : isRejected ? "Rejected Date:" : "Requested Date:"}
          </p>
          <p className="text-xs font-medium text-gray-600">{student.requested_date}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentApprovals() {
  const [students, setStudents]   = useState(MOCK_APPROVALS);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("");

  const counts = useMemo(() => ({
    Pending:  students.filter((s) => s.status === "Pending").length,
    Approved: students.filter((s) => s.status === "Approved").length,
    Rejected: students.filter((s) => s.status === "Rejected").length,
  }), [students]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchTab    = activeTab === "All" || s.status === activeTab;
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.student_id.includes(search);
      const matchStatus = !statusFilter || s.status === statusFilter;
      return matchTab && matchSearch && matchStatus;
    });
  }, [students, activeTab, search, statusFilter]);

  const handleApprove = (id) =>
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, status: "Approved" } : s));

  const handleReject = (id) =>
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, status: "Rejected" } : s));

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status tabs */}
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
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((student) => (
            <ApprovalCard
              key={student.id}
              student={student}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        ) : (
          <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
            No student approvals found.
          </div>
        )}
      </div>
    </div>
  );
}