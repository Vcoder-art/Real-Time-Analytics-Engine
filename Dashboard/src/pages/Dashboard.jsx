import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import { useEffect, useState } from "react";
import VisionEye from "../assets/icons-eye.png";
import { getChannelsHttp } from "../features/slices/channelService";
import CreateAppModal from "../components/CreateModal";
import AppDetailsCard from "../components/AppDetailsCard";

// import { LogOut, BarChart3, Users, Layers } from "@heroicons/react";

export default function Dashboard() {
    const { user } = useSelector((state) => state.auth);
    const [channels, setChannels] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null)
    const [isCreatingApp, setIsCreatingApp] = useState(false);

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

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload();
    };

    const onAppCreation = () => {

    }

    return (
        <div style={{ width: "198%" }} className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
            <CreateAppModal onAppCreated={onAppCreation} isOpen={isCreatingApp} onClose={() => setIsCreatingApp(false)} />
            {/* Header */}
            <header className="flex justify-between items-center px-8 py-4 border-b border-gray-800 bg-gray-900/70 backdrop-blur-md">
                <h3 className="text-2xl font-semibold flex items-center gap-2">
                    {/* <BarChart3 className="w-6 h-6 text-blue-500" /> */}
                    <img width={50} height={50} src={VisionEye} />
                    Vision Pro
                </h3>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                        {user?.company?.email || "Anonymous"}
                    </span>
                    <Button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                    >
                        {/* <LogOut size={16} /> Logout */}
                    </Button>
                </div>
            </header>

            {/* Body */}
            <main className="flex-1 grid grid-cols-12 gap-6 p-8">
                {/* Sidebar */}
                <aside className="col-span-3 bg-gray-900 rounded-2xl p-6 shadow-lg">
                    <Button text="Create App" type="button" onClick={() => setIsCreatingApp(true)} />
                    <h2 className="text-lg font-semibold mb-4">Your Apps</h2>
                    <ul className="space-y-3">

                        {channels.map(ch => <li onClick={() => setSelectedApp(ch)} className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition">
                            {/* <Layers className="inline-block w-4 h-4 mr-2 text-blue-400" /> */}
                            {ch.appName}
                        </li>)}

                    </ul>
                </aside>

                {/* Main Content */}
                <section className="col-span-9 bg-gray-900 rounded-2xl p-8 shadow-lg">
                    <AppDetailsCard app={selectedApp} />
                </section>
            </main>
        </div>
    );
}
