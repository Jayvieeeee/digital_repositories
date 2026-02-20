import {
  IoHomeOutline,
  IoSearchOutline,
  IoDocumentTextOutline,
  IoSendOutline,
  IoSettingsOutline,
  IoLogOutOutline,
} from "react-icons/io5";

import { NavLink, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Sidebar({ user }) {
  const navigate = useNavigate();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: IoHomeOutline, path: "/student-dashboard", section: "main" },
    { id: "browse", label: "Browse Research", icon: IoSearchOutline, path: "/browse-research", section: "main" },
    { id: "my-researches", label: "My Researches", icon: IoDocumentTextOutline, path: "/my-researches", section: "activity" },
    { id: "access", label: "Access Requests", icon: IoSendOutline, path: "/access-requests", section: "activity" },
    { id: "settings", label: "Settings", icon: IoSettingsOutline, path: "/settings", section: "profile" },
  ];

  const renderSection = (sectionName) => (
    <div className="mb-6">
      <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3 px-3">
        {sectionName === "main" && "Main"}
        {sectionName === "activity" && "My Activity"}
        {sectionName === "profile" && "Profile"}
      </p>

      <div className="space-y-1">
        {navItems
          .filter((item) => item.section === sectionName)
          .map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#3E6F6F] text-white"
                      : "text-white hover:bg-teal-700/50"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            );
          })}
      </div>
    </div>
  );

  const getInitials = () => {
    if (!user) return "";
    return `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`;
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <div className="w-64 bg-[#134F4F] h-screen flex flex-col text-white fixed left-0 top-0">
      
      {/* User Profile Section */}
      <div className="p-6 mt-12 border-b-2 border-t-2 border-[#3E6F6F] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-[#427272] border-4 border-[#80A0A0] rounded-full flex items-center justify-center text-base font-semibold">
            {getInitials()}
          </div>

          <div>
            <h3 className="text-base font-semibold text-white">
              {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
            </h3>

            <span className="text-[10px] p-1.5 text-white bg-[#3E6F6F] rounded-md uppercase tracking-wide">
              {user?.role || ""}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {renderSection("main")}
        {renderSection("activity")}
        {renderSection("profile")}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-teal-700 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-teal-700/50 rounded-lg transition-colors"
        >
          <IoLogOutOutline className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}