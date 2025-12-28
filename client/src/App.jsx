// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ProfilePage from "./pages/ProfilePage";
import ContactUs from "./pages/ContactUs";

import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Notifications from "./pages/Notifications";
import TaskSubmission from "./pages/TaskSubmission";
import QuizTaking from "./pages/QuizTaking";
import AssignmentEvaluation from "./pages/AssignmentEvaluation";
import UserManagement from "./pages/UserManagement";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // 1. If still loading, show nothing (or a spinner)
  if (loading) return <div>Loading...</div>;

  // 2. If not logged in, go to login
  if (!user) return <Navigate to="/login" />;

  // 3. If logged in, show the page
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course/:id"
            element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <ContactUs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course/:courseId/task/:assignmentId"
            element={
              <ProtectedRoute>
                <TaskSubmission />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course/:courseId/quiz/:assignmentId"
            element={
              <ProtectedRoute>
                <QuizTaking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course/:courseId/assignment/:assignmentId/evaluate"
            element={
              <ProtectedRoute>
                <AssignmentEvaluation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users/students"
            element={
              <ProtectedRoute>
                <UserManagement filterRole="learner" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users/educators"
            element={
              <ProtectedRoute>
                <UserManagement filterRole="educator" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
