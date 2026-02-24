import { useState, useEffect } from "react";
import { FiCheck, FiLock } from "react-icons/fi";
import api from "../../api/axios";

export default function Settings() {
  // STATE
  const [studentNo, setStudentNo] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [university, setUniversity] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [programs, setPrograms] = useState([]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get("student/profile");

      setStudentNo(res.data.student_no || "");
      setYearLevel(res.data.year_level || "");
      setFirstName(res.data.first_name || "");
      setLastName(res.data.last_name || "");
      setEmail(res.data.email || "");
      setUniversity(res.data.school_name || "");
      setCourse(res.data.program_id || "");
    } catch (error) {
      console.error("Profile load error:", error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await api.get("/programs");
      setPrograms(res.data);
    } catch (error) {
      console.error("Programs load error:", error);
    }
  };

  // UPDATE PROFILE
  const handleSaveChanges = async () => {
    try {
      setLoading(true);

      await api.put("student/update-profile", {
        first_name: firstName,
        last_name: lastName,
        email: email,
        student_no: studentNo, 
        year_level: yearLevel,
        program_id: course,
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // UPDATE PASSWORD
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      await api.put("student/update-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert(error.response?.data?.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  };

    // LOAD DATA ON PAGE LOAD
    useEffect(() => {
      fetchProfile();
      fetchPrograms();
    }, []);


  // UI
  return (
    <div className="p-6 mx-auto space-y-6 max-w-3xl">

      {/* PERSONAL INFORMATION */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Personal Information
        </h2>

        <div className="space-y-4">

          {/* Student No + Year Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Student ID
              </label>
              <input
                type="text"
                value={studentNo}
                onChange={(e) => setStudentNo(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Year Level
              </label>
              <select
                value={yearLevel ?? ""}
                onChange={(e) => setYearLevel(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Year Level</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          {/* First + Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* University */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              University
            </label>
            <input
              type="text"
              value={university}
              disabled
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Program / Course */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Course / Academic Program
            </label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select Program</option>
              {programs.map((program) => (
                <option key={program.program_id} value={program.program_id}>
                  {program.program_name}
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveChanges}
            disabled={loading}
            className="flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            <FiCheck className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* CHANGE PASSWORD */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Change Password
        </h2>

        <div className="space-y-4">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current Password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleUpdatePassword}
            disabled={loading}
            className="flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            <FiLock className="w-4 h-4" />
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}