import { useEffect, useState } from "react";
import api from "../../api/axios";
import { IoDocumentTextOutline, IoEyeOutline, IoSendOutline, IoCloudUploadOutline, IoAddOutline, IoEllipseSharp } from "react-icons/io5";
import UploadResearchModal from "../../components/Student/UploadResearchModal";

export default function Dashboard() {
  const [stats, setStats] = useState({
    uploadedPapers: 0,
    citations: 0,
    accessRequests: 0
  });

  const [submissions, setSubmissions] = useState({
    pendingReview: 0,
    needsRevision: 0,
    approved: 0,
    rejected: 0
  });

  const [accessRequests, setAccessRequests] = useState([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const summaryRes = await api.get("/student/dashboard");
      setStats({
        uploadedPapers: summaryRes.data.uploads || 0,
        citations: summaryRes.data.citations || 0,
        accessRequests: summaryRes.data.requests || 0
      });

      const submissionsRes = await api.get("/student/submissions-status");
      setSubmissions({
        pendingReview: submissionsRes.data.pendingReview || 0,
        needsRevision: submissionsRes.data.needsRevision || 0,
        approved: submissionsRes.data.approved || 0,
        rejected: submissionsRes.data.rejected || 0
      });

      const requestsRes = await api.get("/student/access-requests");
      const formattedRequests = requestsRes.data.map((request, index) => ({
        id: request.id || index + 1,
        title: request.title || "Untitled Research",
        subject: request.subject || "N/A",
        requestedDate: request.requestedDate || "2/1/2026",
        status: request.status || "Pending"
      }));
      setAccessRequests(formattedRequests);
    } catch (err) {
      console.error("Dashboard load failed:", err.response?.data || err.message);
    }
  };

useEffect(() => {
  const loadDashboard = async () => {
    try {
      const [summaryRes, submissionsRes, requestsRes] = await Promise.all([
        api.get("/student/dashboard"),
        api.get("/student/submissions-status"),
        api.get("/student/access-requests")
      ]);

      setStats({
        uploadedPapers: summaryRes.data.uploads || 0,
        citations: summaryRes.data.citations || 0,
        accessRequests: summaryRes.data.requests || 0
      });

      setSubmissions({
        pendingReview: submissionsRes.data.pendingReview || 0,
        needsRevision: submissionsRes.data.needsRevision || 0,
        approved: submissionsRes.data.approved || 0,
        rejected: submissionsRes.data.rejected || 0
      });

      const formattedRequests = requestsRes.data.map((request, index) => ({
        id: request.id || index + 1,
        title: request.title || "Untitled Research",
        subject: request.subject || "N/A",
        requestedDate: request.requestedDate || "2/1/2026",
        status: request.status || "Pending"
      }));

      setAccessRequests(formattedRequests);
    } catch (err) {
      console.error("Dashboard load failed:", err.response?.data || err.message);
    }
  };

  loadDashboard();
}, []);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-4 mx-4">
        {/* Uploaded Papers */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <IoDocumentTextOutline className="w-10 h-10 text-blue-600" />
            <span className="text-4xl font-bold">{stats.uploadedPapers}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Uploaded Papers</h3>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            Click to view →
          </button>
        </div>

        {/* Citations */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <IoEyeOutline className="w-10 h-10 text-purple-600" />
            <span className="text-4xl font-bold">{stats.citations}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Citations</h3>
          <button className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
            View Cited Research →
          </button>
        </div>

        {/* Access Requests */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <IoSendOutline className="w-10 h-10 text-green-600" />
            <span className="text-4xl font-bold">{stats.accessRequests}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Access Request</h3>
          <button className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
            View Request →
          </button>
        </div>

        {/* Upload Research */}
        <button
          onClick={() => setUploadModalOpen(true)}
          className="w-full text-left bg-gradient-to-r from-[#134F4F] to-[#1F606B] rounded-xl p-4 shadow-md hover:opacity-90 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <IoCloudUploadOutline className="w-10 h-10 text-white" />
            <IoAddOutline className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-sm font-medium text-white mb-1">Upload Research</h3>
          <span className="text-xs text-white font-medium flex items-center gap-1">Add new paper →</span>
        </button>
      </div>

      {/* Upload Modal — now a separate component */}
      <UploadResearchModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmitSuccess={fetchDashboardData}
      />

      {/* Submissions & Access Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-4">
        {/* My Submissions Donut Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">My Submissions</h2>
          <div className="flex items-center justify-center gap-8">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                {(() => {
                  const total = submissions.pendingReview + submissions.needsRevision + 
                                submissions.approved + submissions.rejected;
                  const circumference = 440;

                  const approvedDash = total ? (submissions.approved / total) * circumference : 0;
                  const revisionDash = total ? (submissions.needsRevision / total) * circumference : 0;
                  const pendingDash = total ? (submissions.pendingReview / total) * circumference : 0;
                  const rejectedDash = total ? (submissions.rejected / total) * circumference : 0;

                  let approvedOffset = 0;
                  let revisionOffset = -approvedDash;
                  let pendingOffset = revisionOffset - revisionDash;
                  let rejectedOffset = pendingOffset - pendingDash;

                  return (
                    <>
                      {submissions.approved > 0 && <circle cx="100" cy="100" r="70" fill="none" stroke="#22C55E" strokeWidth="40" strokeDasharray={`${approvedDash} ${circumference}`} strokeDashoffset={approvedOffset} />}
                      {submissions.needsRevision > 0 && <circle cx="100" cy="100" r="70" fill="none" stroke="#FCD34D" strokeWidth="40" strokeDasharray={`${revisionDash} ${circumference}`} strokeDashoffset={revisionOffset} />}
                      {submissions.pendingReview > 0 && <circle cx="100" cy="100" r="70" fill="none" stroke="#FB923C" strokeWidth="40" strokeDasharray={`${pendingDash} ${circumference}`} strokeDashoffset={pendingOffset} />}
                      {submissions.rejected > 0 && <circle cx="100" cy="100" r="70" fill="none" stroke="#EF4444" strokeWidth="40" strokeDasharray={`${rejectedDash} ${circumference}`} strokeDashoffset={rejectedOffset} />}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <IoEllipseSharp className="w-3 h-3 text-orange-400" />
                <span className="text-sm text-gray-700">Pending Review</span>
                <span className="text-sm font-semibold text-gray-900 ml-auto">{submissions.pendingReview}</span>
              </div>
              <div className="flex items-center gap-3">
                <IoEllipseSharp className="w-3 h-3 text-yellow-300" />
                <span className="text-sm text-gray-700">Needs Revision</span>
                <span className="text-sm font-semibold text-gray-900 ml-auto">{submissions.needsRevision}</span>
              </div>
              <div className="flex items-center gap-3">
                <IoEllipseSharp className="w-3 h-3 text-green-500" />
                <span className="text-sm text-gray-700">Approved</span>
                <span className="text-sm font-semibold text-gray-900 ml-auto">{submissions.approved}</span>
              </div>
              <div className="flex items-center gap-3">
                <IoEllipseSharp className="w-3 h-3 text-red-500" />
                <span className="text-sm text-gray-700">Rejected</span>
                <span className="text-sm font-semibold text-gray-900 ml-auto">{submissions.rejected}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Access Request List */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Access Request</h2>
          <div className="space-y-3">
            {accessRequests.length > 0 ? (
              accessRequests.map((request) => (
                <div key={request.id} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 flex-1 pr-4">{request.title}</h3>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full whitespace-nowrap">
                      {request.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{request.subject}</p>
                  <p className="text-xs text-gray-500">Requested: {request.requestedDate}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No access requests found</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}