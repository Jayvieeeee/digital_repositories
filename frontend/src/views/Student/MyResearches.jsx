import { useState, useEffect, useCallback } from "react";
import { FiUser, FiCalendar, FiPlus, FiEdit2 } from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import api from "../../api/axios";

const statusStyles = {
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Flagged: "bg-orange-100 text-orange-700",
};

const tabs = ["All", "Pending", "Approved", "Rejected"];

// ─── Helper Functions ─────────────────────────────────────────────────────
function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDocumentTypeLabel(type) {
  const types = {
    thesis: "Thesis",
    capstone: "Capstone",
    journal: "Journal",
    article: "Article",
  };
  return types[type?.toLowerCase()] || type || "—";
}

function ResearchCard({ item, onViewDetails, onEdit }) {
  const canEdit = item.status === "Pending" || item.status === "Flagged";
  const status = item.status?.charAt(0).toUpperCase() + item.status?.slice(1).toLowerCase();
  const documentType = getDocumentTypeLabel(item.document_type);
  const similarityScore = item.similarity_percentage || 0;
  const citations = item.citations_count || 0;
  
  // Get author name - updated to handle both formats
  const authorName = item.student?.user?.name ?? "Unknown Author";

  // Get institution/program 
  const institution = item.school?.school_name || 
    item.institution ||
    item.program?.program_name || 
    item.program?.name || 
    item.student?.program?.program_name ||
    item.student?.program?.name ||
    "—";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      {/* Top badges */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[status] || statusStyles.Pending}`}
          >
            {status}
          </span>
          <span className="text-xs font-medium text-gray-500">{documentType}</span>
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
          {authorName}
        </span>
        <span className="flex items-center gap-1.5">
          <HiOutlineOfficeBuilding className="w-4 h-4" />
          {institution}
        </span>
        <span className="flex items-center gap-1.5">
          <FiCalendar className="w-4 h-4" />
          {formatDate(item.date_submitted || item.created_at)}
        </span>
        <span className="flex items-center gap-1.5 font-medium text-gray-700">
          <span className={`w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold ${
            similarityScore <= 20 ? 'bg-green-600' : 
            similarityScore <= 40 ? 'bg-orange-500' : 
            'bg-red-600'
          }`}>
            {similarityScore}
          </span>
          {citations} {citations === 1 ? 'Citation' : 'Citations'}
        </span>
      </div>

      {/* Adviser + Actions */}
      <div className="flex justify-end items-center gap-2 mt-1">
        <button 
          onClick={() => onViewDetails(item)}
          className="text-sm text-white bg-[#1A6C6C] px-4 py-1.5 rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          View Details
        </button>

        {canEdit && (
          <button 
            onClick={() => onEdit(item)}
            className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <FiEdit2 className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
      </div>

    </div>
  );
}

// ─── Edit Modal (simplified version) ─────────────────────────────────────
function EditModal({ isOpen, onClose, paper, onSave }) {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (paper) {
      setTitle(paper.title || "");
      setAbstract(paper.abstract || "");
      setKeywords(paper.keywords || "");
    }
  }, [paper]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(paper.paper_id || paper.id, { title, abstract, keywords });
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" id="modal-title">
                Edit Research Paper
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Separate keywords with commas"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abstract</label>
                  <textarea
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    rows={5}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-[#1A6C6C] text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Details Modal ─────────────────────────────────────────────────────
function DetailsModal({ isOpen, onClose, paper }) {
  if (!isOpen || !paper) return null;

  const status = paper.status?.charAt(0).toUpperCase() + paper.status?.slice(1).toLowerCase();
  const documentType = getDocumentTypeLabel(paper.document_type);
  const authorName = paper.student?.user?.name || "Unknown Author";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 mb-2" id="modal-title">
                  {paper.title}
                </h3>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[status] || statusStyles.Pending}`}>
                  {status}
                </span>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Author</p>
                    <p className="font-medium">{authorName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Document Type</p>
                    <p className="font-medium">{documentType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date Submitted</p>
                    <p className="font-medium">{formatDate(paper.date_submitted || paper.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Similarity Score</p>
                    <p className="font-medium">{paper.similarity_percentage || 0}%</p>
                  </div>
                  {paper.keywords && (
                    <div className="col-span-2">
                      <p className="text-gray-500">Keywords</p>
                      <p className="font-medium">{paper.keywords}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">Abstract</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{paper.abstract || "No abstract available."}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function MyResearches() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [researches, setResearches] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, paper: null });
  const [editModal, setEditModal] = useState({ isOpen: false, paper: null });

  // ─── Fetch User's Research Papers ─────────────────────────────────────
  const fetchMyResearches = useCallback(async () => {
    setLoading(true);
    try {
      // Get current user's papers
      const res = await api.get('/student/papers');
      
    if (res.data?.data?.data) {
      setResearches(res.data.data.data);      
    } else if (Array.isArray(res.data?.data)) {
      setResearches(res.data.data);
    } else if (Array.isArray(res.data)) {
      setResearches(res.data);
    } else {
      setResearches([]);
    }
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch researches:', err);
      setError(err.response?.data?.message || err.message);
      setResearches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyResearches();
  }, [fetchMyResearches]);

  // ─── Filter by Tab ───────────────────────────────────────────────────
  const filtered = activeTab === "All"
    ? researches
    : researches.filter((r) => {
        const status = r.status?.toLowerCase();
        return status === activeTab.toLowerCase();
      });

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleViewDetails = (paper) => {
    setDetailsModal({ isOpen: true, paper });
  };

  const handleEdit = (paper) => {
    setEditModal({ isOpen: true, paper });
  };

  const handleSaveEdit = async (paperId, updatedData) => {
    try {
      await api.patch(`/research-papers/${paperId}`, updatedData);
      // Refresh the list
      fetchMyResearches();
    } catch (err) {
      console.error('Failed to update paper:', err);
      alert(err.response?.data?.message || 'Failed to update paper');
      throw err;
    }
  };

  const handleUploadClick = () => {
    // Navigate to upload page or open upload modal
    window.location.href = '/upload-research';
  };

  return (
    <div className="p-6 mx-auto">

      {/* Modals */}
      <DetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, paper: null })}
        paper={detailsModal.paper}
      />

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, paper: null })}
        paper={editModal.paper}
        onSave={handleSaveEdit}
      />

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
              {tab !== "All" && (
                <span className="ml-2 text-xs text-gray-400">
                  ({researches.filter(r => r.status?.toLowerCase() === tab.toLowerCase()).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <button 
          onClick={handleUploadClick}
          className="flex items-center gap-2 bg-[#1A6C6C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Upload Research
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-teal-600 mb-4"></div>
          <p className="text-gray-500">Loading your research papers...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="py-16 text-center">
          <p className="text-red-500 mb-2">Error loading your research papers</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      )}

      {/* Research Cards */}
      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <ResearchCard 
                key={item.paper_id || item.id} 
                item={item} 
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
              />
            ))
          ) : (
            <div className="text-center py-16 text-gray-400 text-sm">
              {activeTab === "All" 
                ? "You haven't uploaded any research papers yet."
                : `No ${activeTab.toLowerCase()} research papers found.`}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 