import clsx from "clsx";

export default function ManageEmployeeModal({
  open,
  employee,
  onClose,
  onChangeRole,
  onToggleStatus,
  onOpenChat,
  isOwn,
}) {
  if (!open || !employee) return null;

  const isAdmin = employee.role === "admin";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-white">
            Manage Employee
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* Employee Info */}
        <div
          className={clsx(
            "rounded-lg p-4 mb-5 border transition-all",
            isOwn
              ? "bg-gray-800 border-white/40 ring-1 ring-white/30"
              : "bg-gray-800 border-gray-700"
          )}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="text-white font-medium">
                {employee.name}
              </div>
              <div className="text-sm text-gray-400">
                {employee.email}
              </div>
            </div>

            {isOwn && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                You
              </span>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            User ID: {employee.userId}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-300 mb-6">
          <div className="flex justify-between">
            <span>Role</span>
            <span className="font-semibold">
              {employee.role.toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Last Active</span>
            <span>
              {employee.lastActiveAt
                ? new Date(employee.lastActiveAt).toLocaleString()
                : "—"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Joined</span>
            <span>
              {new Date(employee.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        {!isOwn ? (
          <div className="space-y-3">
            {/* Change Role */}
            {

            }
            {employee.isActive && <button
              onClick={() => onChangeRole(employee)}
              className={clsx(
                "w-full px-4 py-2 rounded-md text-sm font-medium transition",
                isAdmin
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-purple-600 hover:bg-purple-500 text-white"
              )}
            >
              {isAdmin ? "Demote to Employee" : "Promote to Admin"}
            </button>}


            {/* Open Chat */}
            {employee.isActive && <button
              onClick={() => onOpenChat(employee)}
              className="w-full px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
            >
              Open Private Chat
            </button>
            }

            {/* Disable / Enable */}
            <button
              onClick={() => onToggleStatus(employee)}
              className="w-full px-4 py-2 rounded-md bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium transition"
            >
              {employee.isActive ? "Disable Account" : "Enable Account"}
            </button>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-400">
            You cannot manage your own account.
          </div>
        )}

      </div>
    </div>
  );
}
