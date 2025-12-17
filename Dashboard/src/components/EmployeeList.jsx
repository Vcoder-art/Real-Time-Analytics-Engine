import clsx from "clsx";

export default function EmployeeList({
  employees = [],
  onManage,
  isOwn, // function: (emp) => boolean
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        Company Employees
      </h2>

      {employees.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No employees found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="py-3">Employee</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Active</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => {
                const own = isOwn?.(emp.userId);
                const disabled = emp.isActive === false;

                return (
                  <tr key={emp.userId} className="border-b border-gray-800">
                    <td colSpan={5} className="p-0">
                      {/* ROW WRAPPER */}
                      <div
                        className={clsx(
                          "grid grid-cols-5 items-center px-4 py-4 rounded-lg transition",
                          disabled
                            ? "opacity-50 cursor-not-allowed bg-gray-900"
                            : own
                              ? "bg-purple-500/5 shadow-[0_0_18px_rgba(168,85,247,0.7)]"
                              : "hover:bg-gray-800/40"
                        )}
                      >
                        {/* NAME */}
                        <div className="flex items-center gap-3">
                          <div
                            className={clsx(
                              "w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold",
                              disabled ? "bg-gray-600" : "bg-blue-600"
                            )}
                          >
                            {emp.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <div className="text-white font-medium">
                              {emp.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {emp.userId}
                            </div>
                          </div>

                          {own && !disabled && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30">
                              You
                            </span>
                          )}

                          {disabled && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                              Disabled
                            </span>
                          )}
                        </div>

                        {/* EMAIL */}
                        <div className="text-gray-300">
                          {emp.email}
                        </div>

                        {/* ROLE */}
                        <div>
                          <span
                            className={clsx(
                              "px-3 py-1 rounded-full text-xs font-semibold",
                              emp.role === "admin"
                                ? "bg-purple-600/20 text-purple-400"
                                : "bg-gray-700 text-gray-300"
                            )}
                          >
                            {emp.role.toUpperCase()}
                          </span>
                        </div>

                        {/* LAST ACTIVE */}
                        <div className="text-gray-400 text-sm">
                          {emp.lastActiveAt
                            ? new Date(emp.lastActiveAt).toLocaleString()
                            : "—"}
                        </div>

                        {/* ACTIONS */}
                        <div className="text-right">
                          <button
                            onClick={() => onManage(emp)}
                            className={"px-3 py-1 rounded-md text-sm transition"}
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}
