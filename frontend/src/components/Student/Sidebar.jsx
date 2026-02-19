import { 
  IoHomeOutline, 
  IoSearchOutline, 
  IoDocumentTextOutline, 
  IoSendOutline, 
  IoSettingsOutline,
  IoLogOutOutline 
} from "react-icons/io5";

export default function Sidebar({ active, setActive }) {
  const navItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: IoHomeOutline,
      section: "main" 
    },
    { 
      id: "browse", 
      label: "Browse Research", 
      icon: IoSearchOutline,
      section: "main" 
    },
    { 
      id: "my-researches", 
      label: "My Researches", 
      icon: IoDocumentTextOutline,
      section: "activity" 
    },
    { 
      id: "access", 
      label: "Access Requests", 
      icon: IoSendOutline,
      section: "activity" 
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: IoSettingsOutline,
      section: "profile" 
    },
  ];

  return (
    <div className="w-64 bg-[#134F4F] h-screen flex flex-col text-white fixed left-0 top-0">
      {/* User Profile Section */}
      <div className="p-6 mt-12 border-b-2 border-t-2 border-[#3E6F6F] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-[#427272] border-4 border-[#80A0A0] rounded-full flex items-center justify-center text-base font-semibold">
            SJ
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Sarah Johnson</h3>
            <span className="text-[10px] p-1.5 text-white bg-[#3E6F6F] rounded-md uppercase tracking-wide">Student</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {/* MAIN Section */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-teal-300 uppercase tracking-wider mb-3 px-3">
            Main
          </p>
          <div className="space-y-1">
            {navItems
              .filter(item => item.section === "main")
              .map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-teal-700 text-white"
                        : "text-teal-100 hover:bg-teal-700/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* MY ACTIVITY Section */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-teal-300 uppercase tracking-wider mb-3 px-3">
            My Activity
          </p>
          <div className="space-y-1">
            {navItems
              .filter(item => item.section === "activity")
              .map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-teal-700 text-white"
                        : "text-teal-100 hover:bg-teal-700/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* PROFILE Section */}
        <div>
          <p className="text-xs font-semibold text-teal-300 uppercase tracking-wider mb-3 px-3">
            Profile
          </p>
          <div className="space-y-1">
            {navItems
              .filter(item => item.section === "profile")
              .map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-teal-700 text-white"
                        : "text-teal-100 hover:bg-teal-700/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-teal-700 flex-shrink-0">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-teal-100 hover:bg-teal-700/50 rounded-lg transition-colors">
          <IoLogOutOutline className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}