import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Student/SideBar";
import api from "../api/axios";

export default function StudentLayout() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Fetch logged-in user
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

  // Map route path to page title
  const routeTitles = {
    "/student-dashboard": "Dashboard",
    "/browse-research": "Browse Research",
    "/my-researches": "My Researches",
    "/access-requests": "Access Requests",
    "/settings": "Settings",
  };

  const pageTitle = routeTitles[location.pathname] || "";

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main content */}
      <div className="flex-1 ml-64 min-h-screen bg-[#F9FAFB] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white shadow-sm sticky top-0 z-10">
          <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>

          <div className="flex items-center gap-4">
            {/* Example: Student info */}
            <span className="px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-800">
              {user.program || "Computer Science - 4th Year"}
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