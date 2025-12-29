import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import CourseCard from "../components/CourseCard";
import { getRoleLabel } from "../utils/roleLabels";
import api from "../utils/api";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalCourses: 0, activeAssignments: 0 });
  const [recentCourses, setRecentCourses] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get("/api/courses");
        // If learner, only show enrolled. If educator, show assigned. If coordinator, show all.
        const myCourses =
          user.role === "learner"
            ? data.filter((c) => c.enrolledStudents?.includes(user._id))
            : user.role === "educator"
            ? data.filter((c) => c.educators?.some((e) => e._id === user._id))
            : data;

        setRecentCourses(myCourses.slice(0, 3)); // Top 3
        setStats({
          totalCourses: data.length,
          activeAssignments: 5, // Mock stat for now
        });
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchDashboardData();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* HERO BANNER - Professional Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 shadow-lg text-white">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name.split(" ")[0]}!
            </h1>
            <p className="text-blue-100 max-w-xl text-lg mb-6">
              Ready to continue your learning journey? Check out the latest
              courses or view your notifications.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/courses"
                className="px-6 py-2.5 bg-white text-blue-700 font-bold rounded-lg shadow-md hover:bg-gray-50 transition-all"
              >
                Browse Courses
              </Link>
              <Link
                to="/notifications"
                className="px-6 py-2.5 bg-blue-800 bg-opacity-40 border border-blue-400 text-white font-bold rounded-lg hover:bg-opacity-60 transition-all backdrop-blur-sm"
              >
                View Alerts
              </Link>
            </div>
          </div>
          {/* Decorative Background Circles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-purple-400 opacity-20 blur-2xl"></div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg text-xl">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                Total Courses
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalCourses}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg text-xl">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                Active Tasks
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeAssignments}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg text-xl">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                Role
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {getRoleLabel(user?.role)}
              </p>
            </div>
          </div>
        </div>

        {/* RECENT COURSES SECTION */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-l-4 border-indigo-600 pl-3">
              {user.role === "learner"
                ? "Your Enrolled Courses"
                : user.role === "educator"
                ? "Courses You're Teaching"
                : "Recently Added Courses"}
            </h2>
            <Link
              to="/courses"
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center"
            >
              View All <span className="ml-1">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCourses.length > 0 ? (
              recentCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  isCoordinator={user.role === "coordinator"}
                  isEducator={
                    user.role === "educator" &&
                    course.educators?.some((e) => e._id === user._id)
                  }
                  isEnrolled={
                    user.role === "learner" &&
                    course.enrolledStudents?.includes(user._id)
                  }
                  onEnroll={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  isDashboard={true}
                />
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 mb-4 text-lg">
                  {user.role === "learner"
                    ? "You aren't enrolled in any courses yet."
                    : user.role === "educator"
                    ? "You haven't been assigned to any courses yet."
                    : "No courses available yet."}
                </p>
                <Link
                  to="/courses"
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                  {user.role === "learner"
                    ? "Browse Marketplace"
                    : "View All Courses"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
