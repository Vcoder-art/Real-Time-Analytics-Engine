import RealtimeStatsPage from "../pages/RealtimeSatatsPage";


export default function AppDetailsCard({ app, stats }) {

    if (!app) {
        return null;
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-blue-500/20 hover:border-blue-500/30">
            <h2 className="text-lg font-semibold text-white mb-2">{app.appName}</h2>
            <RealtimeStatsPage stats={stats} />
        </div>
    );
}
