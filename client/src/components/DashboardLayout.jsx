import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { getRoleLabel } from "../utils/roleLabels";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  // const getLinks = (role) => {
  //   const links = [{ name: "Dashboard", path: "/" }];

  //   if (role === "coordinator") {
  //     links.push({ name: "Browse Courses", path: "/courses" });
  //     links.push({ name: "Notifications", path: "/notifications" });
  //     links.push({ name: "Manage Users", path: "/users" });
  //   }

  //   if (role === "educator") {
  //     links.push({ name: "My Classes", path: "/my-classes" });
  //   }

  //   if (role === "learner") {
  //     links.push({ name: "My Courses", path: "/my-courses" });
  //     links.push({ name: "Assignments", path: "/assignments" });
  //   }

  //   return links;
  // };

  // Define navigation links based on roles
  const getLinks = (role) => {
    const links = [
      { name: "Dashboard", path: "/" },
      { name: "Browse Courses", path: "/courses" }, // Marketplace
      { name: "Notifications", path: "/notifications" }, // <--- ADD THIS HERE (Visible to everyone)
      { name: "Contact Us", path: "/contact" }, // <--- ADD THIS HERE (Visible to everyone)
    ];

    if (role === "coordinator") {
      links.push({ name: "Manage Users", path: "/users" });
    }

    return links;
  };

  const navLinks = getLinks(user?.role);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-gray-900 shadow-lg hidden md:flex flex-col">
        <div className="h-16 flex items-center justify-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            CourseWare
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-16 bg-white dark:bg-gray-900 shadow-sm flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center md:hidden">
            {/* Mobile Menu Button Placeholder */}
            <button className="text-gray-500 hover:text-gray-700">☰</button>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg
                  className="w-5 h-5 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            <Link
              to="/profile"
              className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors cursor-pointer"
            >
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                  {getRoleLabel(user?.role)}
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold overflow-hidden">
                {user?.profileImage ? (
                  <img
                    src={`${
                      import.meta.env.VITE_API_URL || "http://localhost:5000"
                    }/uploads/${user.profileImage}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase()
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
