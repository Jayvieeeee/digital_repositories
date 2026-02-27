import {
  IoHomeOutline,
  IoFolderOpenOutline,
  IoPeopleOutline,
  IoSendOutline,
  IoCheckmarkCircleOutline,
  IoSettingsOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { LuGraduationCap } from "react-icons/lu";

import { NavLink, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function LibrarianSidebar({ user, notifications = {} }) {
  const navigate = useNavigate();

  const navItems = [
    { id: "dashboard",         label: "Dashboard",         icon: IoHomeOutline,            path: "/school-dashboard", section: "admin"    },
    { id: "repository",        label: "Repository",        icon: IoFolderOpenOutline,      path: "/repository",          section: "admin"    },
    { id: "students",          label: "Students",          icon: LuGraduationCap ,         path: "/students",            section: "people"   },
    { id: "access-requests",   label: "Access Requests",   icon: IoSendOutline,            path: "/school-access-requests",     section: "requests", badge: notifications.accessRequests   },
    { id: "student-approvals", label: "Student Approvals", icon: IoCheckmarkCircleOutline, path: "/student-approvals",   section: "requests", badge: notifications.studentApprovals },
    { id: "settings",          label: "Settings",          icon: IoSettingsOutline,        path: "/school-settings",            section: "profile"  },
  ];

  const sections = [
    { key: "admin",    label: "Admin"    },
    { key: "people",   label: "People"   },
    { key: "requests", label: "Requests" },
    { key: "profile",  label: "Profile"  },
  ];

  const renderSection = ({ key, label }) => {
    const items = navItems.filter((item) => item.section === key);
    if (!items.length) return null;

    return (
      <div key={key} className="mb-6">
        <p className="text-[10px] font-semibold text-teal-300/70 uppercase tracking-widest mb-2 px-3">
          {label}
        </p>
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#3E6F6F] text-white"
                      : "text-white/80 hover:bg-teal-700/50 hover:text-white"
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className="w-5 h-5 bg-yellow-400 text-[#134F4F] text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    );
  };

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
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#427272] border-4 border-[#80A0A0] rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {getInitials()}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 text-white bg-[#3E6F6F] rounded-md uppercase tracking-wide inline-block mt-0.5">
              {user?.role || "Librarian"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        {sections.map(renderSection)}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-teal-700 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-teal-700/50 hover:text-white rounded-lg transition-colors"
        >
          <IoLogOutOutline className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}