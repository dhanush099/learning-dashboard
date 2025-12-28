import React from "react";
import { Link } from "react-router-dom";
import { getCategoryLabel, getCategoryStyle } from "../utils/courseCategories";

const CourseCard = ({
  course,
  isCoordinator,
  onEdit,
  onDelete,
  onEnroll,
  isEnrolled,
  isEducator,
  isDashboard = false,
}) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Development":
        return (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "Design":
        return (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "Business":
        return (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getCategoryBorderStyle = (category) => {
    switch (category) {
      case "Development":
        return "border-l-4 border-l-blue-500";
      case "Design":
        return "border-l-4 border-l-purple-500";
      case "Business":
        return "border-l-4 border-l-green-500";
      default:
        return "border-l-4 border-l-gray-500";
    }
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group h-full ${getCategoryBorderStyle(
        course.category || "Development"
      )}`}
    >
      {/* Thumbnail Image */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={
            course.thumbnail ||
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80"
          }
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm border flex items-center ${getCategoryStyle(
            course.category || "Development"
          )}`}
        >
          {getCategoryIcon(course.category || "Development")}
          {getCategoryLabel(course.category || "Development")}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-2">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
          {course.description}
        </p>

        {/* Footer: Price & Author */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
              {course.coordinator?.name?.charAt(0) || "A"}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
              {course.coordinator?.name}
            </span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {course.price === 0 ? "Free" : `₹${course.price}`}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {isCoordinator ? (
            isDashboard ? (
              <Link
                to={`/course/${course._id}`}
                className="flex-1 text-center px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Course
              </Link>
            ) : (
              <div className="flex gap-2 w-full">
                <Link
                  to={`/course/${course._id}`}
                  className="flex-1 text-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  View
                </Link>
                <button
                  onClick={() => onEdit(course)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(course._id)}
                  className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  🗑
                </button>
              </div>
            )
          ) : isEducator ? (
            <Link
              to={`/course/${course._id}`}
              className="flex-1 text-center px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage Course
            </Link>
          ) : isEnrolled ? (
            <Link
              to={`/course/${course._id}`}
              className="flex-1 text-center px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue Learning
            </Link>
          ) : (
            <button
              onClick={() => onEnroll(course)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
            >
              {course.price === 0 ? "Enroll Now" : "Buy Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
