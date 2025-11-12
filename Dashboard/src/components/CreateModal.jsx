// src/components/CreateAppModal.jsx
import { useState } from "react";
import {createApiKeysHttp} from "../features/slices/publicKeysService"

export default function CreateAppModal({ isOpen, onClose, onAppCreated }) {
  const [appName, setAppName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await createApiKeysHttp(appName)
      if (data.success) {
        setResult(data);
        onAppCreated && onAppCreated(data);
      } else {
        setError("Failed to create app. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Error creating app.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-6 w-[400px] relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-gray-400 hover:text-gray-200"
        >
          ✖
        </button>

        <h2 className="text-xl font-semibold mb-4">Create a New App</h2>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="App Name"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              style={{color:"black"}}
              className="w-full bg-blue-600 hover:bg-blue-700  py-2 rounded-lg"
            >
              {loading ? "Creating..." : "Create App"}
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </form>
        ) : (
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-green-400">✅ App Created!</h3>
            <p><strong>App ID:</strong> {result.appId}</p>
            <p><strong>App Name:</strong> {result.appName}</p>
            <p><strong>API Key:</strong> <span className="text-blue-400">{result.apiKey.slice(0,20)} ...</span></p>
            <button
              color="black"
              onClick={onClose}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
