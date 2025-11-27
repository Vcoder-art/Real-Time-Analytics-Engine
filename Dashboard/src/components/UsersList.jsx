import { useEffect, useState } from "react";
import axiosInstance from "../apis/axiosInstance";
import { FaUsers, FaUser, FaClock } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

export default function UserList({ appId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [appId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`http://localhost:4000/api/company-users/fetch-users?appId=${appId}`);
      setUsers(res.data.usersList || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setUsers([])
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6  ">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <FaUsers className="w-5 h-5 text-blue-400" />
        Users List
      </h2>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400 text-sm">No users found.</p>
      ) : (
        <ul className="space-y-4">
          {users.map((u) => (
            <li
              key={u._id}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-medium text-white flex items-center gap-2">
                    <FaUser className="w-4 h-4 text-blue-300" />
                    {u.name || "Unknown User"}
                  </p>


                  <p className="text-gray-400 text-sm mt-1">
                    <span className="text-gray-500">Email:</span> {u.email}
                  </p>

                  <p className="text-gray-400 text-sm">
                    <span className="text-gray-500">User ID:</span> {u.userId}
                  </p>

                  <p className="text-gray-400 text-xs mt-1 flex gap-2 items-center">
                    <FaClock className="w-3 h-3 text-gray-500" />
                    <span>
                      Last Active: {new Date(u.lastActiveAt).toLocaleString()}
                    </span>
                  </p>

                  <p className="text-gray-500 text-xs mt-1">
                    Joined: {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-400 text-sm">
                    <span className="text-gray-500">Channel ID:</span> {u.channel}
                  </p>
                </div>

                <button
                  className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm"
                  onClick={() => navigate(`/user/${appId}/${u.userId}/${u.channel}`)}
                >
                  View
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}