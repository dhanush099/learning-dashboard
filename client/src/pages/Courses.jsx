import React, { useState, useEffect, useContext } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import CourseCard from "../components/CourseCard";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

const Courses = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Development",
    price: 0,
    thumbnail: "",
  });

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Fetch Courses
  const fetchCourses = async () => {
    try {
      const { data } = await api.get("/api/courses");
      setCourses(data);
      setFilteredCourses(data);
    } catch (error) {
      console.error("Error fetching courses", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = courses;
    if (filterCategory !== "All") {
      result = result.filter((c) => c.category === filterCategory);
    }
    if (searchTerm) {
      result = result.filter((c) =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredCourses(result);
  }, [searchTerm, filterCategory, courses]);

  // Handlers
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/api/courses/${currentCourseId}`, formData);
      } else {
        await api.post("/api/courses", formData);
      }
      setIsModalOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "Development",
        price: 0,
        thumbnail: "",
      });
      fetchCourses();
    } catch (error) {
      alert("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await api.delete(`/api/courses/${id}`);
      fetchCourses();
    } catch (error) {
      alert("Delete failed");
    }
  };

  const openEditModal = (course) => {
    setIsEditing(true);
    setCurrentCourseId(course._id);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category || "Development",
      price: course.price || 0,
      thumbnail: course.thumbnail || "",
    });
    setIsModalOpen(true);
  };

  // Mock Payment Handler
  const handleBuyClick = (course) => {
    setSelectedCourse(course);
    setIsPaymentModalOpen(true);
  };

  const processPayment = async () => {
    setPaymentProcessing(true);
    // Simulate network delay
    setTimeout(async () => {
      try {
        await api.post(`/api/courses/${selectedCourse._id}/enroll`);
        setPaymentProcessing(false);
        setIsPaymentModalOpen(false);
        alert(`Successfully enrolled in ${selectedCourse.title}!`);
        fetchCourses(); // Refresh to update "enrolled" status logic
      } catch (error) {
        alert("Enrollment failed");
        setPaymentProcessing(false);
      }
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Explore Courses
            </h1>
            <p className="text-gray-500 text-sm">
              Discover new skills or teach what you know.
            </p>
          </div>
          {user.role === "coordinator" && (
            <button
              onClick={() => {
                setIsEditing(false);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-200 transition-all"
            >
              + Create New Course
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="Business">Business</option>
          </select>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                isCoordinator={user.role === "coordinator"}
                isEducator={
                  user.role === "educator" &&
                  course.educators?.some((e) => e._id === user._id)
                }
                onEdit={openEditModal}
                onDelete={handleDelete}
                onEnroll={handleBuyClick}
                isEnrolled={course.enrolledStudents?.includes(user._id)}
                isDashboard={false}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-500">
              No courses found matching your filters.
            </div>
          )}
        </div>

        {/* --- COURSE MODAL --- */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isEditing ? "Edit Course" : "Create New Course"}
        >
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <input
              type="text"
              placeholder="Course Title"
              required
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <textarea
              placeholder="Description"
              required
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                required
                className="p-2 border rounded dark:bg-gray-700 dark:text-white"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <input
              type="text"
              placeholder="Thumbnail URL (https://...)"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              value={formData.thumbnail}
              onChange={(e) =>
                setFormData({ ...formData, thumbnail: e.target.value })
              }
            />
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700"
            >
              {isEditing ? "Update Course" : "Create Course"}
            </button>
          </form>
        </Modal>

        {/* --- MOCK PAYMENT MODAL --- */}
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="Secure Checkout"
        >
          {selectedCourse && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <img
                  src={
                    selectedCourse.thumbnail || "https://via.placeholder.com/50"
                  }
                  alt=""
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h4 className="font-bold dark:text-white">
                    {selectedCourse.title}
                  </h4>
                  <p className="text-indigo-600 font-bold text-lg">
                    ₹{selectedCourse.price}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Card Details (Mock)
                </label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  disabled
                  className="w-full p-3 border rounded bg-gray-100 cursor-not-allowed"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    disabled
                    className="w-full p-3 border rounded bg-gray-100 cursor-not-allowed"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    disabled
                    className="w-full p-3 border rounded bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                onClick={processPayment}
                disabled={paymentProcessing}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all flex justify-center"
              >
                {paymentProcessing
                  ? "Processing..."
                  : `Pay ₹${selectedCourse.price} & Enroll`}
              </button>
              <p className="text-xs text-center text-gray-500">
                This is a mock payment. No real money will be deducted.
              </p>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
