import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

const AssignmentEvaluation = () => {
  const { courseId, assignmentId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assignment
        const { data: assignments } = await api.get(`/assignments/${courseId}`);
        const foundAssignment = assignments.find((a) => a._id === assignmentId);
        setAssignment(foundAssignment);

        // Fetch submissions
        const { data: subs } = await api.get(
          `/submissions/assignment/${assignmentId}`
        );
        setSubmissions(subs);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, assignmentId]);

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!grade || grade < 0 || grade > 100) {
      alert("Please enter a valid grade (0-100)");
      return;
    }

    try {
      await api.put(`/submissions/${selectedSubmission._id}/grade`, {
        grade: Number(grade),
        feedback,
      });

      // Refresh submissions
      const { data: subs } = await api.get(
        `/submissions/assignment/${assignmentId}`
      );
      setSubmissions(subs);

      setIsGradingModalOpen(false);
      setSelectedSubmission(null);
      setGrade("");
      setFeedback("");
      alert("Submission graded successfully!");
    } catch (error) {
      alert("Failed to grade submission");
    }
  };

  const openGradingModal = (submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || "");
    setFeedback(submission.feedback || "");
    setIsGradingModalOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-red-500">
          Assignment not found
        </div>
      </DashboardLayout>
    );
  }

  const isQuiz = assignment.type === "quiz";
  const gradedCount = submissions.filter((s) => s.status === "graded").length;
  const pendingCount = submissions.filter((s) => s.status === "submitted")
    .length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                  isQuiz
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                }`}
              >
                {assignment.type.toUpperCase()}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {assignment.title}
              </h1>
            </div>
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Course
            </button>
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Total Submissions:
              </span>{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {submissions.length}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Pending:
              </span>{" "}
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {pendingCount}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Graded:</span>{" "}
              <span className="font-bold text-green-600 dark:text-green-400">
                {gradedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No submissions yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                        {submission.student.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {submission.student.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {submission.student.email}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          submission.status === "graded"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {submission.status === "graded" ? "Graded" : "Pending"}
                      </span>
                    </div>

                    {isQuiz ? (
                      <div className="ml-14 space-y-2">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Score:
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {submission.score !== undefined
                              ? `${submission.score.toFixed(1)}%`
                              : "Not calculated"}
                          </span>
                        </div>
                        {submission.status === "graded" && (
                          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Final Grade:{" "}
                              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                {submission.grade}%
                              </span>
                            </p>
                            {submission.feedback && (
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                Feedback: {submission.feedback}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="ml-14">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-3">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Submission:
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {submission.content}
                          </p>
                        </div>
                        {submission.status === "graded" && (
                          <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Grade:{" "}
                              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                {submission.grade}%
                              </span>
                            </p>
                            {submission.feedback && (
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                Feedback: {submission.feedback}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="ml-14 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Submitted: {new Date(submission.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="ml-4">
                    {submission.status === "submitted" && !isQuiz ? (
                      <button
                        onClick={() => openGradingModal(submission)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Grade
                      </button>
                    ) : submission.status === "graded" ? (
                      <button
                        onClick={() => openGradingModal(submission)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                      >
                        Update Grade
                      </button>
                    ) : isQuiz ? (
                      <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg font-medium">
                        Auto-graded
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grading Modal */}
        <Modal
          isOpen={isGradingModalOpen}
          onClose={() => {
            setIsGradingModalOpen(false);
            setSelectedSubmission(null);
            setGrade("");
            setFeedback("");
          }}
          title="Grade Submission"
        >
          {selectedSubmission && (
            <form onSubmit={handleGrade} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grade (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  rows={4}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback to the student..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors"
                >
                  Save Grade
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsGradingModalOpen(false);
                    setSelectedSubmission(null);
                    setGrade("");
                    setFeedback("");
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AssignmentEvaluation;

