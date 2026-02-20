import { useState } from "react";
import { FiSearch, FiChevronDown, FiEye } from "react-icons/fi";
import { BsFileText } from "react-icons/bs";

const mockRequests = [
  { id: 1, ref: "RR-123-131 232", title: "Development of a Ca", university: "University of Cal", date: "1/23/3036", status: "Pending" },
  { id: 2, ref: "RR-123-131 232", title: "Development of a Ca", university: "University of Cal", date: "1/23/3036", status: "Approved" },
  { id: 3, ref: "RR-123-131 232", title: "Development of a Ca", university: "University of Cal", date: "1/23/3036", status: "Rejected" },
  { id: 4, ref: "RR-123-131 232", title: "Development of a Ca", university: "University of Cal", date: "1/23/3036", status: "Pending" },
  { id: 5, ref: "RR-123-131 232", title: "Development of a Ca", university: "University of Cal", date: "1/23/3036", status: "Approved" },
  { id: 6, ref: "RR-123-131 232", title: "Development of a Ca", university: "University of Cal", date: "1/23/3036", status: "Rejected" },
];

const statusStyles = {
  Pending: "text-yellow-500 font-semibold",
  Approved: "text-green-600 font-semibold",
  Rejected: "text-red-500 font-semibold",
};

export default function AccessRequests() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Filter by Status");
  const [filterUniversity, setFilterUniversity] = useState("Filter by University");

  const filtered = mockRequests.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.ref.toLowerCase().includes(search.toLowerCase()) ||
      r.university.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "Filter by Status" || r.status === filterStatus;
    const matchUniversity =
      filterUniversity === "Filter by University" ||
      r.university === filterUniversity;
    return matchSearch && matchStatus && matchUniversity;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, keyword..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Filter by Status */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer"
          >
            <option>Filter by Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Filter by University */}
        <div className="relative">
          <select
            value={filterUniversity}
            onChange={(e) => setFilterUniversity(e.target.value)}
            className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer"
          >
            <option>Filter by University</option>
            <option>University of Cal</option>
          </select>
          <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4  font-medium">Request Ref.</th>
              <th className="text-left px-6 py-4  font-medium">Title</th>
              <th className="text-left px-6 py-4  font-medium">University</th>
              <th className="text-left px-6 py-4  font-medium">Date Requested</th>
              <th className="text-left px-6 py-4  font-medium">Status</th>
              <th className="text-center px-6 py-4 font-medium">View Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr
                key={row.id}
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  idx === filtered.length - 1 ? "border-b-0" : ""
                }`}>
                <td className="px-6 py-4 text-gray-600 whitespace-pre-line">{row.ref}</td>
                <td className="px-6 py-4 text-gray-800 font-medium">{row.title}</td>
                <td className="px-6 py-4 text-gray-600">{row.university}</td>
                <td className="px-6 py-4 text-gray-600">{row.date}</td>
                <td className={`px-6 py-4 ${statusStyles[row.status]}`}>{row.status}</td>
                <td className="px-6 py-4 flex justify-center items-center">
                  <button className="w-9 h-9 flex items-center justify-center bg-[#1A6C6C] text-white rounded-lg hover:bg-teal-700 transition-colors">
                    {row.status === "Approved" ? (
                      <BsFileText className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No access requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}