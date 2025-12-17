import RealtimeStatsPage from "../pages/RealtimeSatatsPage";
import { useNavigate } from "react-router-dom";

export default function AppDetailsCard({ app, stats }) {
    const navigate = useNavigate();
    if (!app) {
        return null;
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-blue-500/20 hover:border-blue-500/30">
            <div class="flex justify-between">
                <span className="text-lg font-semibold text-white mb-2">{app.appName}</span>
                <button className="w-20 rounded-xl py-2" onClick={() => navigate(`/users-list/${app.appId}`)}>Users</button>
            </div>
            <RealtimeStatsPage stats={stats} />
        </div>
    );
}
