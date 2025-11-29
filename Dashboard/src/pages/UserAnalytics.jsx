
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux"
import { useEffect, useState } from "react";
import VisionEye from "../assets/icons-eye.png";
import axios from "../apis/axiosInstance"
import toast from "react-hot-toast";
import UserStatsCard from "../components/UserStatsCard";
import UserActivityChart from "../components/UserActivityCart";
import UserBreakdownChart from "../components/UserBreakdownCart";
import UserEventStream from "../components/UserEventStream";
import { ws } from "../services/ws";

export default function UserAnalytics() {

    const [summary, setSummary] = useState(null);
    const [activity, setActivity] = useState([]);
    const [breakdown, setBreakdown] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);
    const { user } = useSelector((state) => state.auth);
    const { appId, userId, channel } = useParams();


    useEffect(() => {
        fetchInitialData()
    }, [])

    useEffect(() => {
        initWebSocket()
    }, [ws.ws])

    const initWebSocket = () => {
        ws.subscribe(channel, (e) => {
            const data = e.data;
            if (data) {
                setSummary(data.summary);
                setActivity(data.activityTimeline.data);
                setBreakdown(data.eventBreakdown.data.map(el => ({ ...el, count: Number(el.count) })));
                setRecentEvents(data.recentEvents.data);
            }
            console.log("New Data Found.")
        })
    }

    const fetchInitialData = async () => {
        try {
            const res = await axios.get(`http://localhost:4000/api/company-users/${userId}/initial-snapshot`, {
                params: { appId, days: 30 },
            });

            const data = res.data.data;
            console.log(data)
            setSummary(data.summary);
            setActivity(data.activityTimeline.data);
            setBreakdown(data.eventBreakdown.data.map(el => ({ ...el, count: Number(el.count) })));
            setRecentEvents(data.recentEvents.data);
        } catch (e) {
            console.log(e)
            toast.error("Failed to load user analytics");
        }
    };

    return (
        <div style={{ width: "118%" }} className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
            {/* Header */}
            <header className="flex justify-between items-center px-8 py-4 border-b border-gray-800 bg-gray-900/70 backdrop-blur-md">
                <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <img width={50} height={50} src={VisionEye} />
                    Vision Pro
                </h3>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                        {user?.user?.email || "Anonymous"}
                    </span>
                </div>
            </header>

            {/* Body */}
            <main className="flex-1 grid grid-cols-12 gap-6 p-8">
                {/* Sidebar */}
                <aside className="col-span-3 bg-gray-900 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-lg font-semibold mb-4">Users Options</h2>
                    <ul className="space-y-3">
                    </ul>
                </aside>

                {/* Main Content */}
                <section className="col-span-9 bg-gray-900 rounded-2xl p-8 shadow-lg">
                    {summary && <UserStatsCard summary={summary} />}
                    <div className="grid grid-cols-12 gap-6 mt-3">
                        <div className="col-span-8 bg-gray-800 p-6 rounded-xl">
                            <h2 className="text-lg mb-3">Activity Timeline</h2>
                            <UserActivityChart data={activity} />
                        </div>

                        <div className="col-span-4 bg-gray-800 p-6 rounded-xl">
                            <h2 className="text-lg mb-3">Event Breakdown</h2>
                            <UserBreakdownChart data={breakdown} />
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl mt-3">
                        <h2 className="text-lg mb-3">Recent Events (Live)</h2>
                        <UserEventStream events={recentEvents} />
                    </div>

                </section>
            </main>
        </div>
    );
}
