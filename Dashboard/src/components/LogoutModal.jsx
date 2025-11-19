import { LuLogOut } from "react-icons/lu";
import { MdCancel } from "react-icons/md";

export default function LogoutModal({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
      >
        <div
          className="bg-gray-900 w-[350px] p-6 rounded-xl shadow-2xl border border-gray-700 animate-scaleIn"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Logout</h2>
            <button onClick={onCancel}>
              <MdCancel className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Body */}
          <p className="text-gray-300 mb-6">
            Are you sure you want to log out?  
            You will need to login again to access your dashboard.
          </p>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              onClick={onConfirm}
            >
              <LuLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
