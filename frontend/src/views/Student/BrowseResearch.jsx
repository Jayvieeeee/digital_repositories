import { useState } from "react";
import {
  FiSearch,
  FiFilter,
  FiUser,
  FiCalendar,
  FiEye,
  FiLock,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { BsFileText } from "react-icons/bs";

const mockResults = [
  {
    id: 1,
    title: "Machine Learning Approaches for Predictive Healthcare Analytics",
    author: "Santos, Maria",
    institution: "University School",
    date: "January 28, 2026",
    score: 66,
    citations: 0,
    tags: ["Machine Learning", "Healthcare", "AI"],
    abstract:
      "This research explores the integration of machine learning algorithms in medical diagnostics, focusing on early disease detection and pattern recognition in patient data. The study demonstrates significant improvements in diagnostic accuracy and efficiency across multiple healthcare scenarios.",
  },
  {
    id: 2,
    title: "Machine Learning Approaches for Predictive Healthcare Analytics",
    author: "Santos, Maria",
    institution: "University School",
    date: "January 28, 2026",
    score: 66,
    citations: 0,
    tags: ["Machine Learning", "Healthcare", "AI"],
    abstract:
      "This research explores the integration of machine learning algorithms in medical diagnostics, focusing on early disease detection and pattern recognition in patient data. The study demonstrates significant improvements in diagnostic accuracy and efficiency across multiple healthcare scenarios.",
  },
];

const tagColors = {
  "Machine Learning": "bg-blue-100 text-blue-700",
  Healthcare: "bg-green-100 text-green-700",
  AI: "bg-purple-100 text-purple-700",
};



function ResearchCard({ item }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      {/* Title + Status */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-base font-semibold text-gray-900 leading-snug flex-1">
          {item.title}
        </h3>
      </div>

      {/* Meta info */}
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

      {/* Abstract */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{item.abstract}</p>

      {/* Tags + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                tagColors[tag] || "bg-gray-100 text-gray-600"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <BsFileText className="w-4 h-4" />
            View Abstract
          </button>
          {item.isPrivate ? (
            <button className="flex items-center gap-1.5 text-sm text-white bg-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-900 transition-colors">
              <FiLock className="w-4 h-4" />
              Request Access
            </button>
          ) : (
            <button className="flex items-center gap-1.5 text-sm text-white bg-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors">
              <FiEye className="w-4 h-4" />
              View Full Document
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrowseResearch() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("Machine Learning");

  return (
    <>
      <div className="p-6 mx-auto">

        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, keywords, or department"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <button className="flex items-center gap-2 bg-[#1A6C6C] text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors">
            <FiSearch className="w-4 h-4" />
            Search
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {[
            { label: "All Programs", options: ["Computer Science", "Information Technology"] },
            { label: "All Years", options: ["2026", "2025", "2024"] },
            { label: "All Types", options: ["Thesis", "Capstone"] },
            { label: "Most Recent", options: ["Most Cited", "Highest Score"] },
          ].map(({ label, options }) => (
            <div key={label} className="relative">
              <select className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer">
                <option>{label}</option>
                {options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          ))}

          <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ml-auto">
            <FiFilter className="w-4 h-4" />
            Advance Filters
          </button>
        </div>

        {/* Results Info & Active Tag */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-800">156 results</span>
          </p>
          {activeTag && (
            <span className="flex items-center gap-1.5 text-sm bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full font-medium">
              {activeTag}
              <button
                onClick={() => setActiveTag("")}
                className="text-teal-500 hover:text-teal-700"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="flex flex-col gap-4">
          {mockResults.map((item) => (
            <ResearchCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}