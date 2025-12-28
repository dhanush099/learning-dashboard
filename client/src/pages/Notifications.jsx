import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../utils/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notifications
        </h1>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading alerts...
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((note) => (
                <div
                  key={note._id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-start space-x-4"
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
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
                          d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21V9m0 0l8.359-3.359M12 9L3.641 5.641M12 9v12"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {note.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.createdAt).toLocaleDateString()} at{" "}
                      {new Date(note.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {!note.isRead && (
                    <span className="h-2 w-2 bg-red-500 rounded-full mt-2"></span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <div className="text-4xl mb-3 text-gray-400">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21V9m0 0l8.359-3.359M12 9L3.641 5.641M12 9v12"
                  ></path>
                </svg>
              </div>
              <p>No new notifications yet.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
