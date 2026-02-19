import { useState } from "react";
import Sidebar from "../components/Student/SideBar";

export default function StudentLayout({ children }) {
  const [active, setActive] = useState("dashboard");

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "browse", label: "Browse Research" },
    { id: "my-researches", label: "My Researches" },
    { id: "access", label: "Access Request" },
    { id: "settings", label: "Settings" },
  ];

  const activeItem = navItems.find((item) => item.id === active)?.label;

  return (
    <div className="flex">
      {/* Sidebar - Fixed */}
      <Sidebar active={active} setActive={setActive} />

      {/* Main Content - With left margin for fixed sidebar */}
      <div className="flex-1 ml-64 p-6 bg-[#F9FAFB] min-h-screen">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          {activeItem}
        </h1>
        {children}
      </div>
    </div>
  );
}