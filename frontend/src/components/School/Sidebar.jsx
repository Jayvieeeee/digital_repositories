import {
  IoHomeOutline,
  IoFolderOutline,
  IoPeopleOutline,
  IoSendOutline,
  IoCheckmarkCircleOutline,
  IoArchiveOutline,
  IoSettingsOutline,
  IoLogOutOutline,
} from "react-icons/io5";

import { NavLink, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Sidebar({ user, notifications = {} }) {
  const navigate = useNavigate();

  // notifications: { accessRequests: number, studentApprovals: number }

  const sections = [
    {
      key: "main",
      label: "MAIN",
      items: [
        { id: "dashboard", label: "Dashboard", icon: IoHomeOutline, path: "/school-dashboard" },
        { id: "repository", label: "Repository", icon: IoFolderOutline, path: "/repository" },
        { id: "students", label: "Students", icon: IoPeopleOutline, path: "/students" },
      ],
    },
    {
      key: "requests",
      label: "REQUESTS",
      items: [
        {
          id: "access-requests",
          label: "Access Requests",
          icon: IoSendOutline,
          path: "/access-requests",
          badge: notifications.accessRequests,
        },
        {
          id: "student-approvals",
          label: "Student Approvals",
          icon: IoCheckmarkCircleOutline,
          path: "/student-approvals",
          badge: notifications.studentApprovals,
        },
      ],
    },
    {
      key: "profile",
      label: "PROFILE",
      items: [
        { id: "archive", label: "Archive", icon: IoArchiveOutline, path: "/archive" },
        { id: "settings", label: "Settings", icon: IoSettingsOutline, path: "/settings" },
      ],
    },
  ];

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
    <div className="w-56 bg-[#0f3d3d] h-screen flex flex-col text-white fixed left-0 top-0">

      {/* User Profile Section */}
      <div className="px-4 py-5 border-b border-[#1e5555]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2a6060] border-2 border-[#4a8888] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
            {getInitials()}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
            </h3>
            <span className="text-[9px] px-2 py-0.5 text-teal-200 bg-[#1e5555] rounded-sm uppercase tracking-widest font-medium">
              {user?.role || ""}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {sections.map((section) => (
          <div key={section.key}>
            {/* Section Label */}
            <p className="text-[10px] font-bold text-teal-400/70 uppercase tracking-widest mb-1 px-2">
              {section.label}
            </p>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative ${
                        isActive
                          ? "bg-[#1e5c5c] text-white"
                          : "text-teal-100/80 hover:bg-[#1a4f4f] hover:text-white"
                      }`
                    }
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {/* Notification Badge */}
                    {item.badge > 0 && (
                      <span className="w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-3 py-4 border-t border-[#1e5555]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-teal-100/80 hover:bg-[#1a4f4f] hover:text-white rounded-lg transition-colors"
        >
          <IoLogOutOutline className="w-[18px] h-[18px]" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}