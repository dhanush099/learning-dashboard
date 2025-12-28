import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { getCategoryLabel, getCategoryStyle } from "../utils/courseCategories";
import api from "../utils/api";

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Data State
  const [plans, setPlans] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [educators, setEducators] = useState([]);
  const [selectedEducator, setSelectedEducator] = useState("");

  // UI State for Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEducatorModalOpen, setIsEducatorModalOpen] = useState(false);

  // Form State
  const [newPlan, setNewPlan] = useState({
    week: "",
    topic: "",
    content: "",
    resources: "",
  });
  const [newAssign, setNewAssign] = useState({
    title: "",
    description: "",
    dueDate: "",
    type: "task",
    questions: [],
  });
  const [tempQuestion, setTempQuestion] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

  const isEducatorOrCoord =
    user.role === "coordinator" ||
    (user.role === "educator" &&
      course?.educators?.some((e) => e._id === user._id));

  const [isEditing, setIsEditing] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);

  // Delete confirmation states
  const [deletePlanId, setDeletePlanId] = useState(null);
  const [deleteAssignId, setDeleteAssignId] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const { data } = await api.get(`/courses`);
        setCourse(data.find((c) => c._id === id));
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        if (activeTab === "plan") {
          const { data } = await api.get(`/studyplans/${id}`);
          setPlans(data.sort((a, b) => a.week - b.week));
        } else if (activeTab === "assignments") {
          const { data } = await api.get(`/assignments/${id}`);
          setAssignments(data);
        } else if (activeTab === "overview" && user.role === "coordinator") {
          // Fetch educators list for assignment (only for coordinators)
          const { data: users } = await api.get("/users");
          setEducators(users.filter((u) => u.role === "educator"));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [activeTab, id]);

  // --- HANDLERS (CREATE) ---
  const handleCreateOrUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // UPDATE LOGIC
        await api.put(`/studyplans/${currentPlanId}`, newPlan);
      } else {
        // CREATE LOGIC
        await api.post("/studyplans", { ...newPlan, courseId: id });
      }

      // Reset and Close
      setIsPlanModalOpen(false);
      setNewPlan({ week: "", topic: "", content: "", resources: "" });
      setIsEditing(false);
      setCurrentPlanId(null);

      // Refresh Data
      const { data } = await api.get(`/studyplans/${id}`);
      setPlans(data.sort((a, b) => a.week - b.week));
      success(
        isEditing
          ? "Study plan updated successfully!"
          : "Study plan created successfully!"
      );
    } catch (error) {
      showError("Operation failed");
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    // Validate quiz has questions
    if (newAssign.type === "quiz") {
      if (!newAssign.questions || newAssign.questions.length === 0) {
        showError("Please add at least one question to the quiz.");
        return;
      }

      // Validate each question has all fields filled
      const invalidQuestion = newAssign.questions.find(
        (q) =>
          !q.questionText?.trim() ||
          q.options.some((opt) => !opt?.trim()) ||
          q.correctAnswer === undefined
      );

      if (invalidQuestion) {
        showError(
          "Please ensure all questions have question text, all 4 options filled, and a correct answer selected."
        );
        return;
      }
    }

    // Validate due date is not in the past
    if (new Date(newAssign.dueDate) < new Date()) {
      showError("Due date cannot be in the past.");
      return;
    }

    try {
      await api.post("/assignments", { ...newAssign, courseId: id });
      setIsAssignModalOpen(false);
      setNewAssign({
        title: "",
        description: "",
        dueDate: "",
        type: "task",
        questions: [],
      });
      const { data } = await api.get(`/assignments/${id}`);
      setAssignments(data);
      success("Assignment created successfully!");
    } catch (error) {
      showError(error.response?.data?.message || "Failed to create assignment");
    }
  };

  const addQuestion = () => {
    setNewAssign({
      ...newAssign,
      questions: [...newAssign.questions, tempQuestion],
    });
    setTempQuestion({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
  };

  // --- HANDLERS (DELETE) ---
  const handleDeletePlan = async () => {
    try {
      await api.delete(`/studyplans/${deletePlanId}`);
      setPlans(plans.filter((p) => p._id !== deletePlanId));
      success("Study plan deleted successfully");
      setDeletePlanId(null);
    } catch (error) {
      showError("Failed to delete study plan");
    }
  };

  const handleDeleteAssignment = async () => {
    try {
      await api.delete(`/assignments/${deleteAssignId}`);
      setAssignments(assignments.filter((a) => a._id !== deleteAssignId));
      success("Assignment deleted successfully");
      setDeleteAssignId(null);
    } catch (error) {
      showError("Failed to delete assignment");
    }
  };

  const handleUnassignEducator = async (educatorId) => {
    if (!window.confirm("Remove this educator from the course?")) return;
    try {
      await api.post(`/courses/${id}/unassign-educator`, { educatorId });
      // Refresh course data
      const { data } = await api.get(`/courses`);
      setCourse(data.find((c) => c._id === id));
      success("Educator removed successfully");
    } catch (error) {
      showError("Failed to remove educator");
    }
  };

  const handleAssignEducator = async (e) => {
    e.preventDefault();
    if (!selectedEducator) {
      showError("Please select an educator");
      return;
    }
    try {
      await api.post(`/courses/${id}/assign-educator`, {
        educatorId: selectedEducator,
      });
      setIsEducatorModalOpen(false);
      setSelectedEducator("");
      // Refresh course data
      const { data } = await api.get(`/courses`);
      setCourse(data.find((c) => c._id === id));
      success("Educator assigned successfully");
    } catch (error) {
      showError("Failed to assign educator");
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="p-8">Loading...</div>
      </DashboardLayout>
    );
  if (!course)
    return (
      <DashboardLayout>
        <div className="p-8">Course not found</div>
      </DashboardLayout>
    );

  const openEditModal = (plan) => {
    setIsEditing(true);
    setCurrentPlanId(plan._id);
    setNewPlan({
      week: plan.week,
      topic: plan.topic,
      content: plan.content,
      resources: plan.resources || "",
    });
    setIsPlanModalOpen(true);
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
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div
          className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm p-8 ${getCategoryBorderStyle(
            course.category
          )}`}
        >
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getCategoryStyle(
              course.category
            )}`}
          >
            {getCategoryLabel(course.category).toUpperCase()}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {course.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {course.description}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4">
          {["overview", "plan", "assignments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 text-sm font-medium transition-colors border-b-2 capitalize ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="min-h-[300px]">
          {/* --- OVERVIEW TAB --- */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Course Info */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Course Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Coordinator
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {course?.coordinator?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Category
                    </p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryStyle(
                        course?.category
                      )}`}
                    >
                      {getCategoryLabel(course?.category)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Price
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {course?.price === 0 ? "Free" : `₹${course?.price}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enrolled Students
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {course?.enrolledStudents?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Description
                  </p>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {course?.description}
                  </p>
                </div>
              </div>

              {/* Educators Section - Only show for coordinators and educators */}
              {(user.role === "coordinator" || user.role === "educator") && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Assigned Educators
                    </h3>
                    {user.role === "coordinator" && (
                      <button
                        onClick={() => setIsEducatorModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-all"
                      >
                        + Assign Educator
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {course?.educators?.length > 0 ? (
                      course.educators.map((educator) => (
                        <div
                          key={educator._id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                              {educator.name?.charAt(0)}
                            </div>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {educator.name}
                            </span>
                          </div>
                          {user.role === "coordinator" && (
                            <button
                              onClick={() =>
                                handleUnassignEducator(educator._id)
                              }
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No educators assigned yet.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {plans.length}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Study Weeks
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {assignments.length}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Assignments
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {assignments.filter((a) => a.type === "quiz").length}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Quizzes
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* --- STUDY PLAN TAB --- */}
          {activeTab === "plan" && (
            <div className="space-y-6">
              {isEducatorOrCoord && (
                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm transition-all"
                >
                  + Add Week Schedule
                </button>
              )}

              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-6 hover:shadow-md transition-all"
                  >
                    <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                      W{plan.week}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                          {plan.topic}
                        </h4>
                        {/* {isEducatorOrCoord && (
                          <button
                            onClick={() => setDeletePlanId(plan._id)}
                            className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )} */}

                        {/* Edit Button */}
                        {isEducatorOrCoord && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(plan)}
                              className="text-gray-400 hover:text-blue-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {/* Edit Icon (Pencil) */}
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>

                            <button
                              onClick={() => setDeletePlanId(plan._id)}
                              className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {plan.content}
                      </p>
                      {plan.resources && (
                        <a
                          href={plan.resources}
                          target="_blank"
                          className="text-sm text-indigo-600 mt-2 inline-block hover:underline"
                        >
                          View Resources
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- ASSIGNMENTS TAB --- */}
          {activeTab === "assignments" && (
            <div className="space-y-6">
              {isEducatorOrCoord && (
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm transition-all"
                >
                  + Create Assignment
                </button>
              )}

              <div className="grid grid-cols-1 gap-4">
                {assignments.map((assign) => (
                  <div
                    key={assign._id}
                    className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                            assign.type === "quiz"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {assign.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          Due: {new Date(assign.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                        {assign.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {assign.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {user.role === "learner" ? (
                        <button
                          onClick={() =>
                            navigate(
                              `/course/${id}/${assign.type}/${assign._id}`
                            )
                          }
                          className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                        >
                          {assign.type === "quiz"
                            ? "Start Quiz"
                            : "Submit Task"}
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            navigate(
                              `/course/${id}/assignment/${assign._id}/evaluate`
                            )
                          }
                          className="px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                        >
                          View Submissions
                        </button>
                      )}
                      {isEducatorOrCoord && (
                        <button
                          onClick={() => setDeleteAssignId(assign._id)}
                          className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- MODALS --- */}

        {/* Study Plan Modal */}
        <Modal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          title="Add Week Schedule"
        >
          <form onSubmit={handleCreateOrUpdatePlan} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Week
                </label>
                <input
                  type="number"
                  required
                  className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newPlan.week}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, week: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Topic
                </label>
                <input
                  type="text"
                  required
                  className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newPlan.topic}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, topic: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Content
              </label>
              <textarea
                required
                rows={3}
                className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPlan.content}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, content: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Resources URL
              </label>
              <input
                type="text"
                className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPlan.resources}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, resources: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold"
            >
              {isEditing ? "Update Schedule" : "Save Schedule"}
            </button>
          </form>
        </Modal>

        {/* Assignment Modal */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title="Create Assignment"
        >
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Title
              </label>
              <input
                type="text"
                required
                className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newAssign.title}
                onChange={(e) =>
                  setNewAssign({ ...newAssign, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Description
              </label>
              <textarea
                required
                className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newAssign.description}
                onChange={(e) =>
                  setNewAssign({ ...newAssign, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newAssign.dueDate}
                  onChange={(e) =>
                    setNewAssign({ ...newAssign, dueDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Type
                </label>
                <select
                  className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newAssign.type}
                  onChange={(e) =>
                    setNewAssign({ ...newAssign, type: e.target.value })
                  }
                >
                  <option value="task">Task</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
            </div>

            {newAssign.type === "quiz" && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600">
                <h4 className="font-bold text-sm mb-2 dark:text-white">
                  Add Question
                </h4>
                <input
                  type="text"
                  placeholder="Question?"
                  className="w-full mb-2 p-2 text-sm border rounded"
                  value={tempQuestion.questionText}
                  onChange={(e) =>
                    setTempQuestion({
                      ...tempQuestion,
                      questionText: e.target.value,
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {tempQuestion.options.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Opt ${i + 1}`}
                      className="p-1 text-sm border rounded"
                      value={opt}
                      onChange={(e) => {
                        const n = [...tempQuestion.options];
                        n[i] = e.target.value;
                        setTempQuestion({ ...tempQuestion, options: n });
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    className="flex-1 p-1 text-sm border rounded"
                    value={tempQuestion.correctAnswer}
                    onChange={(e) =>
                      setTempQuestion({
                        ...tempQuestion,
                        correctAnswer: Number(e.target.value),
                      })
                    }
                  >
                    <option value={0}>Correct: Opt 1</option>
                    <option value={1}>Correct: Opt 2</option>
                    <option value={2}>Correct: Opt 3</option>
                    <option value={3}>Correct: Opt 4</option>
                  </select>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {newAssign.questions.length} question
                  {newAssign.questions.length !== 1 ? "s" : ""} added
                </p>
                {newAssign.questions.length === 0 && (
                  <p className="text-xs text-red-500 mt-2 text-center">
                    ⚠️ At least one question is required for a quiz
                  </p>
                )}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                newAssign.type === "quiz" && newAssign.questions.length === 0
              }
            >
              Create Assignment
            </button>
          </form>
        </Modal>

        {/* Educator Assignment Modal */}
        <Modal
          isOpen={isEducatorModalOpen}
          onClose={() => setIsEducatorModalOpen(false)}
          title="Assign Educator"
        >
          <form onSubmit={handleAssignEducator} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Select Educator
              </label>
              <select
                required
                className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedEducator}
                onChange={(e) => setSelectedEducator(e.target.value)}
              >
                <option value="">Choose an educator...</option>
                {educators
                  .filter(
                    (edu) => !course?.educators?.some((e) => e._id === edu._id)
                  )
                  .map((educator) => (
                    <option key={educator._id} value={educator._id}>
                      {educator.name} ({educator.email})
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEducatorModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Assign
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmations */}
        <ConfirmDialog
          isOpen={!!deletePlanId}
          onClose={() => setDeletePlanId(null)}
          onConfirm={handleDeletePlan}
          title="Delete Study Plan"
          message="Are you sure you want to delete this study plan? This action cannot be undone."
          confirmText="Delete"
          type="danger"
        />

        <ConfirmDialog
          isOpen={!!deleteAssignId}
          onClose={() => setDeleteAssignId(null)}
          onConfirm={handleDeleteAssignment}
          title="Delete Assignment"
          message="Are you sure you want to delete this assignment? All submissions will also be deleted. This action cannot be undone."
          confirmText="Delete"
          type="danger"
        />
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
