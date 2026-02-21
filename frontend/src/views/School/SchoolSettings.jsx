import { useState } from "react";
import { IoSaveOutline, IoLockClosedOutline, IoCheckmarkOutline } from "react-icons/io5";

// ─── Input Field ──────────────────────────────────────────────────────────────
function Field({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 transition-colors"
      />
    </div>
  );
}

export default function Settings() {
  // ── University Info ──
  const [uniForm, setUniForm] = useState({
    university_name: "Metro Manila University",
    address:         "Manila, Philippines",
    school_type:     "Public",
    contact_number:  "+63 2 8123 4567",
    official_email:  "library@um.edu.ph",
  });

  // ── Librarian Info ──
  const [libForm, setLibForm] = useState({
    first_name:      "Teresa",
    last_name:       "Dela Cruz",
    contact_number:  "+63 2 8123 4567",
    email_address:   "library@um.edu.ph",
  });

  // ── Password ──
  const [passForm, setPassForm] = useState({
    current_password:  "",
    new_password:      "",
    confirm_password:  "",
  });
  const [passError, setPassError] = useState("");

  // ── Saved feedback ──
  const [uniSaved, setUniSaved]   = useState(false);
  const [libSaved, setLibSaved]   = useState(false);
  const [passSaved, setPassSaved] = useState(false);

  const handleUni  = (e) => setUniForm ((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleLib  = (e) => setLibForm ((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handlePass = (e) => setPassForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const saveUni = () => {
    // TODO: api.put("/librarian/settings/university", uniForm)
    setUniSaved(true);
    setTimeout(() => setUniSaved(false), 2000);
  };

  const saveLib = () => {
    // TODO: api.put("/librarian/settings/profile", libForm)
    setLibSaved(true);
    setTimeout(() => setLibSaved(false), 2000);
  };

  const updatePassword = () => {
    setPassError("");
    if (!passForm.current_password || !passForm.new_password || !passForm.confirm_password) {
      return setPassError("All password fields are required.");
    }
    if (passForm.new_password !== passForm.confirm_password) {
      return setPassError("New password and confirm password do not match.");
    }
    if (passForm.new_password.length < 6) {
      return setPassError("Password must be at least 6 characters.");
    }
    // TODO: api.put("/librarian/settings/password", { ... })
    setPassSaved(true);
    setPassForm({ current_password: "", new_password: "", confirm_password: "" });
    setTimeout(() => setPassSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Top row: University + Librarian Info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* University Information */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">University Information</h2>

          <Field label="University Name"  name="university_name" value={uniForm.university_name} onChange={handleUni} placeholder="Metro Manila University" />
          <Field label="Address"          name="address"         value={uniForm.address}         onChange={handleUni} placeholder="Manila, Philippines" />
          <Field label="School Type"      name="school_type"     value={uniForm.school_type}     onChange={handleUni} placeholder="Public" />
          <Field label="Contact Number"   name="contact_number"  value={uniForm.contact_number}  onChange={handleUni} placeholder="+63 2 8123 4567" />
          <Field label="Official Email"   name="official_email"  value={uniForm.official_email}  onChange={handleUni} placeholder="library@um.edu.ph" type="email" />

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={saveUni}
              className="flex items-center gap-2 px-4 py-2 bg-[#134F4F] hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {uniSaved ? <IoCheckmarkOutline className="w-4 h-4" /> : <IoSaveOutline className="w-4 h-4" />}
              {uniSaved ? "Saved!" : "Save Changes"}
            </button>
            <button
              onClick={() => setUniForm({ university_name: "Metro Manila University", address: "Manila, Philippines", school_type: "Public", contact_number: "+63 2 8123 4567", official_email: "library@um.edu.ph" })}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Librarian Information */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Librarian Information</h2>

          <Field label="First Name"      name="first_name"     value={libForm.first_name}     onChange={handleLib} placeholder="Teresa" />
          <Field label="Last Name"       name="last_name"      value={libForm.last_name}      onChange={handleLib} placeholder="Dela Cruz" />
          <Field label="Contact Number"  name="contact_number" value={libForm.contact_number} onChange={handleLib} placeholder="+63 2 8123 4567" />
          <Field label="Email Address"   name="email_address"  value={libForm.email_address}  onChange={handleLib} placeholder="library@um.edu.ph" type="email" />

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={saveLib}
              className="flex items-center gap-2 px-4 py-2 bg-[#134F4F] hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {libSaved ? <IoCheckmarkOutline className="w-4 h-4" /> : <IoSaveOutline className="w-4 h-4" />}
              {libSaved ? "Saved!" : "Save Changes"}
            </button>
            <button
              onClick={() => setLibForm({ first_name: "Teresa", last_name: "Dela Cruz", contact_number: "+63 2 8123 4567", email_address: "library@um.edu.ph" })}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* ── Change Password ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Change Password</h2>

        {/* Current password full width */}
        <Field
          label="Current Password"
          name="current_password"
          type="password"
          value={passForm.current_password}
          onChange={handlePass}
          placeholder="Enter Current Password"
        />

        {/* New + Confirm side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Password"
            name="new_password"
            type="password"
            value={passForm.new_password}
            onChange={handlePass}
            placeholder="Enter New Password"
          />
          <Field
            label="Confirm Password"
            name="confirm_password"
            type="password"
            value={passForm.confirm_password}
            onChange={handlePass}
            placeholder="Confirm New Password"
          />
        </div>

        <p className="text-xs text-gray-400">
          Password must be at least 6 characters with uppercase, lowercase, and numbers
        </p>

        {passError && (
          <p className="text-xs text-red-500 font-medium">{passError}</p>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={updatePassword}
            className="flex items-center gap-2 px-5 py-2 bg-[#134F4F] hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <IoLockClosedOutline className="w-4 h-4" />
            {passSaved ? "Updated!" : "Update Password"}
          </button>
          <button
            onClick={() => { setPassForm({ current_password: "", new_password: "", confirm_password: "" }); setPassError(""); }}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}