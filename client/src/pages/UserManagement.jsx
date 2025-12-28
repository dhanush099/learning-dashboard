import React, { useState, useEffect, useContext } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import { AuthContext } from "../context/AuthContext";
import { getRoleLabel, getRoleLabelPlural } from "../utils/roleLabels";
import api from "../utils/api";

const UserManagement = ({ filterRole: initialFilterRole }) => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterRole, setFilterRole] = useState(initialFilterRole || "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "learner",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (filterRole !== "all") {
      result = result.filter((u) => u.role === filterRole);
    }
    if (searchTerm) {
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredUsers(result);
  }, [filterRole, searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/users/${currentUserId}`, formData);
      } else {
        // For new users, registration should be used, but we can allow coordinators to create users
        alert(
          "Please use the registration page to create new users, or implement a create user endpoint."
        );
        return;
      }
      setIsModalOpen(false);
      setFormData({ name: "", email: "", role: "learner" });
      setIsEditing(false);
      setCurrentUserId(null);
      fetchUsers();
    } catch (error) {
      alert("Operation failed");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (error) {
      alert("Delete failed");
    }
  };

  const openEditModal = (userData) => {
    setIsEditing(true);
    setCurrentUserId(userData._id);
    setFormData({
      name: userData.name,
      email: userData.email,
      role: userData.role,
    });
    setIsModalOpen(true);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "coordinator":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case "educator":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "learner":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="text-gray-500 text-sm">
              Manage {getRoleLabelPlural("learner").toLowerCase()},{" "}
              {getRoleLabelPlural("educator").toLowerCase()}, and{" "}
              {getRoleLabelPlural("coordinator").toLowerCase()}.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            {/* <span className="absolute left-3 top-3 text-gray-400">🔍</span> */}
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
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="learner">{getRoleLabelPlural("learner")}</option>
            <option value="educator">{getRoleLabelPlural("educator")}</option>
            <option value="coordinator">
              {getRoleLabelPlural("coordinator")}
            </option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total Users
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {users.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {getRoleLabelPlural("learner")}
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {users.filter((u) => u.role === "learner").length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {getRoleLabelPlural("educator")}
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {users.filter((u) => u.role === "educator").length}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((userData) => (
                    <tr
                      key={userData._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold mr-3">
                            {userData.name.charAt(0)}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {userData.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                            userData.role
                          )}`}
                        >
                          {getRoleLabel(userData.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {userData.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(userData)}
                            className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              ></path>
                            </svg>
                          </button>
                          {userData._id !== user._id && (
                            <button
                              onClick={() => handleDelete(userData._id)}
                              className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormData({ name: "", email: "", role: "learner" });
            setIsEditing(false);
            setCurrentUserId(null);
          }}
          title={isEditing ? "Edit User" : "Create User"}
        >
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Name
              </label>
              <input
                type="text"
                required
                className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                Role
              </label>
              <select
                className="w-full mt-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="learner">{getRoleLabel("learner")}</option>
                <option value="educator">{getRoleLabel("educator")}</option>
                <option value="coordinator">
                  {getRoleLabel("coordinator")}
                </option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
            >
              {isEditing ? "Update User" : "Create User"}
            </button>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
