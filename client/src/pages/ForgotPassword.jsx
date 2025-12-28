import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would call api.post('/auth/forgot-password', { email }) here.
    // For now, we simulate success.
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive reset instructions"
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full transform rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-lg"
          >
            Send Reset Link
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      ) : (
        <div className="text-center space-y-6">
          <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <span className="text-2xl">✉️</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Check your email
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              We have sent a password reset link to <strong>{email}</strong>
            </p>
          </div>
          <Link
            to="/login"
            className="block w-full rounded-lg bg-gray-100 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-200"
          >
            Back to Login
          </Link>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
