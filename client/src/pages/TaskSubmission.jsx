import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

const TaskSubmission = () => {
  const { courseId, assignmentId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assignment details
        const { data: assignments } = await api.get(
          `/api/assignments/${courseId}`
        );
        const foundAssignment = assignments.find((a) => a._id === assignmentId);

        if (!foundAssignment) {
          setError("Assignment not found");
          setLoading(false);
          return;
        }

        if (foundAssignment.type !== "task") {
          navigate(`/course/${courseId}/quiz/${assignmentId}`);
          return;
        }

        setAssignment(foundAssignment);

        // Check if already submitted
        try {
          const { data: existingSubmission } = await api.get(
            `/api/submissions/assignment/${assignmentId}/my-submission`
          );
          if (existingSubmission) {
            setSubmission(existingSubmission);
            setContent(existingSubmission.content || "");
          }
        } catch (err) {
          // No submission yet, that's fine
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load assignment");
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, assignmentId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please provide your submission content");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (submission) {
        // Update existing submission (if allowed)
        setError(
          "You have already submitted this assignment. Contact your educator for updates."
        );
        setSubmitting(false);
        return;
      }

      await api.post("/api/submissions", {
        assignmentId,
        content,
      });

      alert("Assignment submitted successfully!");
      navigate(`/course/${courseId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">Loading...</div>
      </DashboardLayout>
    );
  }

  if (error && !assignment) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-red-500">{error}</div>
      </DashboardLayout>
    );
  }

  const isPastDue = new Date(assignment.dueDate) < new Date();
  const isSubmitted = submission !== null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 mb-2">
                TASK
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

          <div className="mt-4 space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              {assignment.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
              {isPastDue && !isSubmitted && (
                <span className="text-red-500 font-semibold">Overdue</span>
              )}
              {isSubmitted && (
                <span className="text-green-500 font-semibold">
                  ✓ Submitted
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Submission Form */}
        {isSubmitted ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Your Submission
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {submission.content}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Submitted on: {new Date(submission.createdAt).toLocaleString()}
              </p>
              {submission.status === "graded" && (
                <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Grade:
                    </span>
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-300">
                      {submission.grade !== undefined
                        ? `${submission.grade}%`
                        : "Not graded"}
                    </span>
                  </div>
                  {submission.feedback && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Feedback:
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {submission.feedback}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Submit Your Work
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Submission Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your assignment submission here..."
                  required
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  You can paste text, code, or any content required for this
                  assignment.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Assignment"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/course/${courseId}`)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TaskSubmission;
