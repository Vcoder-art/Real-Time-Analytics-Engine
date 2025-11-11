import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import { useEffect, useState } from "react";
import VisionEye from "../assets/icons-eye.png";
import { getChannelsHttp } from "../features/slices/channelService";
import CreateAppModal from "../components/CreateModal";
// import { LogOut, BarChart3, Users, Layers } from "@heroicons/react";

export default function Dashboard() {
    const { user } = useSelector((state) => state.auth);
    const [channels, setChannels] = useState([]);

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

    return (
        <div style={{ width: "198%" }} className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
            <CreateAppModal isOpen={true}/>
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
                    <h2 className="text-lg font-semibold mb-4">Your Apps</h2>
                    <ul className="space-y-3">

                        {channels.map(ch => <li className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition">
                            {/* <Layers className="inline-block w-4 h-4 mr-2 text-blue-400" /> */}
                            {ch.appName}
                        </li>)}

                    </ul>
                </aside>

                {/* Main Content */}
                <section className="col-span-9 bg-gray-900 rounded-2xl p-8 shadow-lg">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        {/* <Users className="w-5 h-5 text-blue-400" /> */}
                        Dashboard Overview
                    </h2>

                    <div className="grid grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="bg-gray-800 rounded-xl p-6 hover:scale-[1.02] transition">
                            <p className="text-gray-400 text-sm">Total Events</p>
                            <h3 className="text-2xl font-bold mt-2">12,438</h3>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-gray-800 rounded-xl p-6 hover:scale-[1.02] transition">
                            <p className="text-gray-400 text-sm">Active Users (24h)</p>
                            <h3 className="text-2xl font-bold mt-2">864</h3>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-gray-800 rounded-xl p-6 hover:scale-[1.02] transition">
                            <p className="text-gray-400 text-sm">Events per Second</p>
                            <h3 className="text-2xl font-bold mt-2">42</h3>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
