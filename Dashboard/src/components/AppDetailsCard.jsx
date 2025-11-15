// src/components/AppDetailsCard.jsx
import { useState } from "react";
import axiosInstance from "../apis/axiosInstance";
// import { useNavigate } from "react-router-dom";
import { ws } from "../services/ws"


export default function AppDetailsCard({ app, companyId }) {
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    // const navigate = useNavigate();

    if (!app) {
        return null;
    }

    // const handleSubscribe = async () => {
    //     setLoading(true);
    //     try {
    //         const res = await axiosInstance.post("/apps/subscribe", {
    //             companyId,
    //             appId: app.appId,
    //         });
    //         if (res.data.success) {
    //             setSubscribed(true);
    //         }
    //     } catch (error) {
    //         console.error("Subscription failed", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-blue-500/20 hover:border-blue-500/30">
            <h2 className="text-lg font-semibold text-white mb-2">{app.appName}</h2>

            <div className="text-gray-400 text-sm space-y-1">
                <p>
                    <span className="text-gray-500">App ID:</span>{" "}
                    <span className="font-mono text-gray-300">{app.appId}</span>
                </p>
                <p>
                    <span className="text-gray-500">API Key:</span>{" "}
                    <span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-400 rounded-md font-mono font-semibold">{app.apiKey}</span>
                </p>
                <p>
                    <span className="text-gray-500">Channel:</span>{" "}
                    <span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-400 rounded-md font-mono font-semibold">
                        {app.channel}
                    </span>
                </p>
            </div>

            <div style={{ width: "10%" }} className="flex justify-between mt-6 space-x-2">

                <button
                    style={{ color: "black" }}
                    onClick={() => {
                        ws.subscribe(app.channel, (event) => {
                            console.log("🔵 Event Received:", event);
                        });
                        setSubscribed(true);
                    }}
                    // disabled={subscribed}
                    className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${loading
                        ? "bg-blue-400 cursor-not-allowed text-gray-200"
                        : "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-blue-500/30"
                        }`}
                >
                   {subscribed ? "Subscribed ✓" : "Subscribe"}
                </button>

            </div>

        </div>
    );
}
