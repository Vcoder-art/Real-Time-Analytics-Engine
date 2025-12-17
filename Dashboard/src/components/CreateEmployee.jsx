
import { useState } from "react";

export default function CreateEmployeeModal({
    open,
    onClose,
    onCreate,
    loading = false
}) {
    const [form, setForm] = useState({
        email: "",
        password: "",
        name: "",
    });

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.email || !form.password || !form.name) {
            return alert("All fields are required");
        }

        onCreate(form);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

            {/* Modal */}
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-6">

                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold text-white">
                        Add Employee
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Name */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Santosh"
                            className="w-full bg-gray-800 text-white px-4 py-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="santoshranawat012@gmail.com"
                            className="w-full bg-gray-800 text-white px-4 py-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Temporary Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full bg-gray-800 text-white px-4 py-2 rounded-md outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Employee can change this later
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Employee"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
