import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import api from "../utils/api";

const QuizTaking = () => {
  const { courseId, assignmentId } = useParams();
  const { user } = useContext(AuthContext);
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assignment details
        const { data: assignments } = await api.get(`/assignments/${courseId}`);
        const foundAssignment = assignments.find((a) => a._id === assignmentId);

        if (!foundAssignment) {
          setError("Quiz not found");
          setLoading(false);
          return;
        }

        if (foundAssignment.type !== "quiz") {
          navigate(`/course/${courseId}/task/${assignmentId}`);
          return;
        }

        // Validate quiz has questions
        if (
          !foundAssignment.questions ||
          foundAssignment.questions.length === 0
        ) {
          const errorMsg =
            "This quiz has no questions. Please contact your educator.";
          setError(errorMsg);
          showError(errorMsg);
          setLoading(false);
          return;
        }

        setAssignment(foundAssignment);
        const answersArrayLength = foundAssignment.questions.length;
        setAnswers(new Array(answersArrayLength).fill(null));

        // Check if already submitted
        try {
          const { data: existingSubmission } = await api.get(
            `/submissions/assignment/${assignmentId}/my-submission`
          );
          if (existingSubmission) {
            setSubmission(existingSubmission);
            setAnswers(existingSubmission.quizAnswers || []);
          }
        } catch (err) {
          // No submission yet, that's fine
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load quiz");
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, assignmentId, navigate]);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    if (submission) return; // Don't allow changes if already submitted

    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = answers.some((ans) => ans === null);
    if (unanswered) {
      if (
        !window.confirm(
          "You have unanswered questions. Are you sure you want to submit?"
        )
      ) {
        return;
      }
    }

    if (submission) {
      setError("You have already submitted this quiz.");
      return;
    }

    // Validate quiz has questions before submission
    if (
      !assignment ||
      !assignment.questions ||
      assignment.questions.length === 0
    ) {
      setError("Cannot submit: This quiz has no questions.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data } = await api.post("/submissions", {
        assignmentId,
        quizAnswers: answers,
      });

      setSubmission(data);
      success(`Quiz submitted! Your score: ${data.score.toFixed(1)}%`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner text="Loading quiz..." />
      </DashboardLayout>
    );
  }

  if (error && !assignment) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
                <button
                  onClick={() => navigate(`/course/${courseId}`)}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Back to Course
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isSubmitted = submission !== null;
  const isPastDue = new Date(assignment.dueDate) < new Date();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 mb-2">
                QUIZ
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
              <span>
                {assignment.questions.length} Question
                {assignment.questions.length !== 1 ? "s" : ""}
              </span>
              {isPastDue && !isSubmitted && (
                <span className="text-red-500 font-semibold">Overdue</span>
              )}
              {isSubmitted && (
                <span className="text-green-500 font-semibold">
                  ✓ Completed - Score: {submission.score.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quiz Questions */}
        {isSubmitted ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <svg
                  className="w-16 h-16 text-green-600 dark:text-green-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Quiz Completed!
              </h2>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                Score: {submission.score.toFixed(1)}%
              </p>
            </div>

            {/* Review Answers */}
            <div className="space-y-6 mt-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Review Your Answers
              </h3>
              {assignment.questions.map((question, qIndex) => {
                const userAnswer = submission.quizAnswers[qIndex];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div
                    key={qIndex}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? "bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-700"
                        : "bg-red-50 dark:bg-red-900 border-red-300 dark:border-red-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Question {qIndex + 1}: {question.questionText}
                      </h4>
                      {isCorrect ? (
                        <span className="text-green-600 dark:text-green-300 font-bold">
                          ✓ Correct
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-300 font-bold">
                          ✗ Incorrect
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => {
                        const isUserChoice = userAnswer === oIndex;
                        const isCorrectAnswer =
                          oIndex === question.correctAnswer;

                        return (
                          <div
                            key={oIndex}
                            className={`p-2 rounded ${
                              isCorrectAnswer
                                ? "bg-green-200 dark:bg-green-800 font-semibold"
                                : isUserChoice
                                ? "bg-red-200 dark:bg-red-800"
                                : "bg-gray-100 dark:bg-gray-700"
                            }`}
                          >
                            {option}
                            {isCorrectAnswer && (
                              <span className="ml-2 text-green-700 dark:text-green-300">
                                (Correct Answer)
                              </span>
                            )}
                            {isUserChoice && !isCorrectAnswer && (
                              <span className="ml-2 text-red-700 dark:text-red-300">
                                (Your Answer)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>
                  Question {currentQuestion + 1} of{" "}
                  {assignment.questions.length}
                </span>
                <span>{answers.filter((a) => a !== null).length} answered</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      ((currentQuestion + 1) / assignment.questions.length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Current Question */}
            {assignment.questions[currentQuestion] && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {assignment.questions[currentQuestion].questionText}
                </h3>
                <div className="space-y-2">
                  {assignment.questions[currentQuestion].options.map(
                    (option, oIndex) => (
                      <button
                        key={oIndex}
                        onClick={() =>
                          handleAnswerSelect(currentQuestion, oIndex)
                        }
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          answers[currentQuestion] === oIndex
                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900 dark:border-indigo-400"
                            : "border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500"
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-5 h-5 rounded-full border-2 mr-3 ${
                              answers[currentQuestion] === oIndex
                                ? "border-indigo-600 bg-indigo-600"
                                : "border-gray-400"
                            }`}
                          >
                            {answers[currentQuestion] === oIndex && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <span className="text-gray-900 dark:text-white">
                            {option}
                          </span>
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() =>
                  setCurrentQuestion(Math.max(0, currentQuestion - 1))
                }
                disabled={currentQuestion === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              {currentQuestion < assignment.questions.length - 1 ? (
                <button
                  onClick={() =>
                    setCurrentQuestion(
                      Math.min(
                        assignment.questions.length - 1,
                        currentQuestion + 1
                      )
                    )
                  }
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </button>
              )}
            </div>

            {/* Question Navigation */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Jump to question:
              </p>
              <div className="flex flex-wrap gap-2">
                {assignment.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      currentQuestion === index
                        ? "bg-indigo-600 text-white"
                        : answers[index] !== null
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuizTaking;
