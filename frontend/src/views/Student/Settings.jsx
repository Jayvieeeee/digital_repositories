import { useState } from "react";
import { FiShield, FiCheck, FiLock } from "react-icons/fi";

export default function Settings() {
  const [email, setEmail] = useState("sarah.williams@mmu.edu");
  const [adviser, setAdviser] = useState("");
  const [course, setCourse] = useState("Bachelor of Science in Computer Science");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="p-6 mx-auto space-y-6">
        
      {/* Personal Information */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Personal Information</h2>

        {/* Protected Fields Notice */}
        <div className="flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-6">
          <FiShield className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-teal-700 mb-0.5">Protected Fields</p>
            <p className="text-xs text-teal-600 leading-relaxed">
              Your name and university information are managed by the registrar's office and cannot be
              modified here. Please contact the registrar for any updates.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Student ID + Year Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Student ID</label>
              <input
                type="text"
                value="20211 2345"
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Year Level</label>
              <input
                type="text"
                value="4th Year - A"
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* First Name + Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">First Name</label>
              <input
                type="text"
                value="Juan"
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Last Name</label>
              <input
                type="text"
                value="Dela Cruz"
                disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* University */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">University</label>
            <input
              type="text"
              value="Metro Manila University"
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
            />
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Course / Academic Program</label>
            <div className="relative">
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option>Bachelor of Science in Computer Science</option>
                <option>Bachelor of Science in Information Technology</option>
                <option>Bachelor of Science in Information Systems</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              This is your primary email for notifications and account recovery.
            </p>
          </div>

          {/* Research Adviser */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Research Adviser</label>
            <div className="relative">
              <select
                value={adviser}
                onChange={(e) => setAdviser(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">Select your Research Adviser</option>
                <option value="jessie">Jessie Alamil</option>
                <option value="maria">Maria Santos</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Select the faculty member who is supervising your research project.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-6">
          <button className="flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors">
            <FiCheck className="w-4 h-4" />
            Save Changes
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Change Password</h2>

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter Current Password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-300"
            />
          </div>

          {/* New Password + Confirm */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter New Password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-300"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Password must be at least 8 characters with uppercase, lowercase, and numbers.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-6">
          <button className="flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors">
            <FiLock className="w-4 h-4" />
            Update Password
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}