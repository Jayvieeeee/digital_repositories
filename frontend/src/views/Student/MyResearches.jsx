import { useState } from "react";
import { FiUser, FiCalendar, FiPlus, FiEdit2 } from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";

const mockResearches = [
  {
    id: 1,
    status: "Approved",
    type: "Thesis",
    title: "Machine Learning Approaches for Predictive Healthcare Analytics",
    author: "Santos, Maria",
    institution: "University School",
    date: "January 28, 2026",
    score: 66,
    citations: 0,
  },
  {
    id: 2,
    status: "Rejected",
    type: "Capstone",
    title: "Machine Learning Approaches for Predictive Healthcare Analytics",
    author: "Santos, Maria",
    institution: "University School",
    date: "January 28, 2026",
    score: 66,
    citations: 0,
  },
  {
    id: 3,
    status: "Pending",
    type: "Capstone",
    title: "Machine Learning Approaches for Predictive Healthcare Analytics",
    author: "Santos, Maria",
    institution: "University School",
    date: "January 28, 2026",
    score: 66,
    citations: 0,
  },
];

const statusStyles = {
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

const tabs = ["All", "Pending", "Approved", "Rejected"];

function ResearchCard({ item }) {
  const canEdit = item.status === "Pending";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      {/* Top badges */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[item.status]}`}
          >
            {item.status}
          </span>
          <span className="text-xs font-medium text-gray-500">{item.type}</span>
        </div>
        {item.publishStatus && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            {item.publishStatus}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 mb-2 leading-snug">
        {item.title}
      </h3>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-500 mb-1">
        <span className="flex items-center gap-1.5">
          <FiUser className="w-4 h-4" />
          {item.author}
        </span>
        <span className="flex items-center gap-1.5">
          <HiOutlineOfficeBuilding className="w-4 h-4" />
          {item.institution}
        </span>
        <span className="flex items-center gap-1.5">
          <FiCalendar className="w-4 h-4" />
          {item.date}
        </span>
        <span className="flex items-center gap-1.5 font-medium text-gray-700">
          <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">
            {item.score}
          </span>
          {item.citations} Citations
        </span>
      </div>

      {/* Adviser + Actions */}
    <div className="flex justify-end items-center gap-2 mt-1">
      <button className="text-sm text-white bg-[#1A6C6C] px-4 py-1.5 rounded-lg hover:bg-teal-700 transition-colors font-medium">
        View Details
      </button>

      {canEdit && (
        <button className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium">
          <FiEdit2 className="w-3.5 h-3.5" />
          Edit
        </button>
      )}
    </div>

    </div>
  );
}

export default function MyResearches() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered =
    activeTab === "All"
      ? mockResearches
      : mockResearches.filter((r) => r.status === activeTab);

  return (
    <div className="p-6 mx-auto">

      {/* Tabs + Upload Button */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button className="flex items-center gap-2 bg-[#1A6C6C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors">
          <FiPlus className="w-4 h-4" />
          Upload Research
        </button>
      </div>

      {/* Research Cards */}
      <div className="flex flex-col gap-4">
        {filtered.map((item) => (
          <ResearchCard key={item.id} item={item} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No research found for this status.
          </div>
        )}
      </div>
    </div>
  );
}