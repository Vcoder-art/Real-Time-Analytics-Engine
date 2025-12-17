import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSettings, updateSett as updateSettings } from "../features/slices/settingSlice";
import {logout} from "../features/slices/authSlice"
import { IoIosCloseCircle, IoMdLogOut } from "react-icons/io";
import LogoutModal from "../components/LogoutModal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function SettingsDrawer({ open, onClose }) {
  const dispatch = useDispatch();
  const [isLogoutOpen,setIsLogoutOpen] = useState(false)
  const { settings, loading, saving } = useSelector((s) => s.settings);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    retentionDays: 30,
    realtimeEnabled: true,
    allowedDomains: "",
  });

  useEffect(() => {
    if (open) dispatch(fetchSettings());
  }, [open]);

  useEffect(() => {
    console.log("settings", settings)
    if (settings) {
      setForm({
        retentionDays: settings.retentionDays,
        realtimeEnabled: settings.realtimeEnabled,
        allowedDomains: settings.allowedDomains?.join(", ") || "",
      });
    }
  }, [settings]);

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const save = async () => {
    const payload = {
      retentionDays: Number(form.retentionDays),
      realtimeEnabled: form.realtimeEnabled,
      allowedDomains: form.allowedDomains
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
    };

    const res = await dispatch(updateSettings(payload));

    if (res.type.endsWith("fulfilled")) toast.success("Settings Updated");
    else toast.error("Update failed");
  };


  const logoutFromDashboard = ()=> {
    setIsLogoutOpen(false)
    dispatch(logout())
    navigate("/login")
  } 

  return (
    <>
      <LogoutModal onCancel={()=>setIsLogoutOpen(false)} open={isLogoutOpen} onConfirm={()=>logoutFromDashboard()} />
      {/* Background blur overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
          onClick={()=>dispatch(onClose())}
        />
      )}

      {/* Right Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] bg-gray-900 text-white shadow-2xl z-50 p-6 transform transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">⚙ Settings</h2>
          <button onClick={()=>dispatch(onClose())}>
            <IoIosCloseCircle className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : (
          <div className="space-y-5">

            {/* Retention Days */}
            <div>
              <label className="text-gray-400 text-sm">Data Retention (Days)</label>
              <input
                type="number"
                name="retentionDays"
                value={form.retentionDays}
                onChange={update}
                className="w-full mt-1 p-3 rounded bg-gray-800 border border-gray-700"
              />
            </div>

            {/* Realtime Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="realtimeEnabled"
                checked={form.realtimeEnabled}
                onChange={update}
              />
              <label className="text-gray-300">Enable Real-Time Analytics</label>
            </div>

            {/* Allowed Domains */}
            <div>
              <label className="text-gray-400 text-sm">
                Allowed Domains (comma-separated)
              </label>
              <input
                type="text"
                name="allowedDomains"
                value={form.allowedDomains}
                onChange={update}
                className="w-full mt-1 p-3 rounded bg-gray-800 border border-gray-700"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={save}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded mt-4 disabled:bg-gray-600"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}


        <div style={{marginTop:"80%",textAlign:"right"}}>
          <button>
            <IoMdLogOut size={30} onClick={()=>setIsLogoutOpen(true)} />
          </button>
        </div>
      </div>

    </>
  );
}
