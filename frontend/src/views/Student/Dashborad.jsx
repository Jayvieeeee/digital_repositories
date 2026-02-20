import { IoDocumentTextOutline, IoEyeOutline, IoSendOutline,IoCloudUploadOutline,IoAddOutline,IoEllipseSharp } from "react-icons/io5";

export default function Dashboard() {
  const stats = {
    uploadedPapers: 2,
    citations: 7,
    accessRequests: 3
  };

  const submissions = {
    pendingReview: 1,
    needsRevision: 1,
    approved: 3,
    rejected: 1
  };

  const accessRequests = [
    {
      id: 1,
      title: "Development of a Mobile Learning Platform for Remote Education",
      subject: "Psychology",
      requestedDate: "2/1/2026",
      status: "Pending"
    },
    {
      id: 2,
      title: "Development of a Mobile Learning Platform for Remote Education",
      subject: "Psychology",
      requestedDate: "2/1/2026",
      status: "Pending"
    },
    {
      id: 3,
      title: "Development of a Mobile Learning Platform for Remote Education",
      subject: "Psychology",
      requestedDate: "2/1/2026",
      status: "Pending"
    }
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-4 mx-4">
        {/* Uploaded Papers */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <IoDocumentTextOutline className="w-10 h-10 text-blue-600" />
            </div>
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
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <IoEyeOutline className="w-10 h-10 text-purple-600" />
            </div>
            <span className="text-4xl font-bold">{stats.citations}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Citations</h3>
          <button className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
            View Cited Research →
          </button>
        </div>

        {/* Access Request */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <IoSendOutline className="w-10 h-10 text-green-600" />
            </div>
            <span className="text-4xl font-bold">{stats.accessRequests}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Access Request</h3>
          <button className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
            View Request →
          </button>
        </div>

        {/* Upload Research */}
        <div className="bg-gradient-to-r from-[#134F4F] to-[#1F606B] rounded-xl p-4 shadow-md cursor-pointer hover:bg-teal-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <IoCloudUploadOutline className="w-10 h-10 text-white" />
            </div>
            <IoAddOutline className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-sm font-medium text-white mb-1">Upload Research</h3>
          <button className="text-xs text-white font-medium flex items-center gap-1">
            Add new paper →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-4">
        {/* My Submissions - Donut Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">My Submissions</h2>
          
          <div className="flex items-center justify-center gap-8">
            {/* Donut Chart */}
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                {/* Green - Approved (3) - 50% */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="40"
                  strokeDasharray="220 440"
                  strokeDashoffset="0"
                />
                {/* Yellow - Needs Revision (1) - 16.67% */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#FCD34D"
                  strokeWidth="40"
                  strokeDasharray="73.33 440"
                  strokeDashoffset="-220"
                />
                {/* Orange - Pending Review (1) - 16.67% */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#FB923C"
                  strokeWidth="40"
                  strokeDasharray="73.33 440"
                  strokeDashoffset="-293.33"
                />
                {/* Red - Rejected (1) - 16.67% */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="40"
                  strokeDasharray="73.34 440"
                  strokeDashoffset="-366.66"
                />
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
            {accessRequests.map((request) => (
              <div 
                key={request.id}
                className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 flex-1 pr-4">
                    {request.title}
                  </h3>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full whitespace-nowrap">
                    {request.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{request.subject}</p>
                <p className="text-xs text-gray-500">Requested: {request.requestedDate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}