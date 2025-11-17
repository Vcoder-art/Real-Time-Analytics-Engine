export default function AppDetailsModal({ open, onClose, app }) {
  if (!open || !app) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      
      {/* Modal Container */}
      <div className="bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl p-6 border border-gray-800">
        
        {/* Header */}
        <h2 className="text-2xl font-semibold text-white mb-4">
          {app.appName}
        </h2>

        {/* Details */}
        <div className="space-y-4 text-gray-300 text-sm">
          
          <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
            <div className="text-gray-500">App ID</div>
            <div className="text-white font-mono break-all">{app.appId}</div>
          </div>

          <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
            <div className="text-gray-500">API Key</div>
            <div className="text-white font-mono break-all">{app.apiKey}</div>
          </div>

          <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
            <div className="text-gray-500">Channel</div>
            <div className="text-purple-400 font-mono break-all">
              {app.channel}
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
          >
            Close
          </button>
        </div>
      </div>

    </div>
  );
}
