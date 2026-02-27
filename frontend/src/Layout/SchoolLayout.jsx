import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LibrarianSidebar from "../components/School/Sidebar";
import api from "../api/axios";

export default function LibrarianLayout() {
  const [user, setUser] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/user");
        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  if (!user) return null; // Or a spinner

  const routeTitles = {
    "/librarian-dashboard": "Dashboard",
    "/repository":          "Repository",
    "/research-advisers":   "Research Advisers",
    "/students":            "Students",
    "/access-requests":     "Access Requests",
    "/student-approvals":   "Student Approvals",
    "/settings":            "Settings",
  };

  const pageTitle = routeTitles[location.pathname] || "";

  return (
    <div className="flex">
      {/* Sidebar */}
      <LibrarianSidebar user={user} />

      {/* Main content */}
      <div className="flex-1 ml-56 min-h-screen bg-[#F9FAFB] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white shadow-sm sticky top-0 z-10">
          <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>

          <div className="flex items-center gap-4">
            <span className="px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-800">
              {user.department || "Library Services"}
            </span>
            <span className="px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-800">
              ID: {user.librarian_id || user.id || ""}
            </span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}