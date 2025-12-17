import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import { useEffect, useState } from "react";
import { getChannelsHttp } from "../features/services/channelService";
import { initialAggregatedResult } from "../features/services/insightService"
import CreateAppModal from "../components/CreateModal";
import AppDetailsCard from "../components/AppDetailsCard";
import AppDetailsModal from "../components/App-Details-Model";
import { ws } from "../services/ws";
import SelectAppPlaceholder from "../components/EmptyStatePlaceholder";

export default function Dashboard() {
    const { user } = useSelector((state) => state.auth);
    const [channels, setChannels] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null)
    const [selectedAppDetails, setSelectedAppDetails] = useState(null);
    const [isCreatingApp, setIsCreatingApp] = useState(false);
    const [isOpenAppDetails, setIsOpenAppDetails] = useState();
    const [stats, setStats] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    useEffect(() => {
        getChannels();
    }, [])

    const getChannels = async () => {
        try {
            const data = await getChannelsHttp();
            setChannels(data.channels)
        } catch (err) {
            console.log(err)
            setChannels([])
        }
    }

    const onAppCreation = () => {
        getChannels();
    }

    const onSubscribeChannel = async (app) => {
        let initialData = await initialAggregatedResult(app.appId);
        setStats(initialData.data)
        setSelectedApp(app)
        ws.subscribe(app.channel, (e) => {
            if (e.data) {
                setStats(e.data)
            }
        });
    }


    return (
        <div style={{ width: "100%" }} className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
            <CreateAppModal onAppCreated={onAppCreation} isOpen={isCreatingApp} onClose={() => setIsCreatingApp(false)} />
            <AppDetailsModal onClose={() => setIsOpenAppDetails(false)} app={selectedAppDetails} open={isOpenAppDetails} />            {/* Body */}
            <main className="flex-1 grid grid-cols-12 gap-6 p-8">
                {/* Sidebar */}
                <aside className="col-span-3 bg-gray-900 rounded-2xl p-6 shadow-lg">
                    <Button text="Create App" type="button" onClick={() => setIsCreatingApp(true)} />
                    <h2 className="text-lg font-semibold mb-4">Your Apps</h2>
                    <ul className="space-y-3">
                        {channels.map(app =>
                            <li
                                onClick={() => onSubscribeChannel(app)}
                                className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition flex justify-between items-center"
                            >
                                <span>{app.appName}</span>

                                <button
                                    className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-200"
                                    onClick={(e) => {
                                        e.stopPropagation();  // prevent selecting app when clicking button
                                        setSelectedAppDetails(app)
                                        setIsOpenAppDetails(true)
                                    }}
                                >
                                    Keys
                                </button>
                            </li>
                        )}


                    </ul>
                </aside>
          
                {/* Main Content */}
                <section className="col-span-9 bg-gray-900 rounded-2xl p-8 shadow-lg">
                    <AppDetailsCard app={selectedApp} stats={stats} />
                     {!selectedApp && <SelectAppPlaceholder />}
                </section>
            </main>
        </div>
    );
}
