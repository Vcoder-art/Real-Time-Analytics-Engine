import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import VisionEye from "../assets/icons-eye.png";
import ChatPanel from "../components/Chat-Panel";
import axiosInstance from "../apis/axiosInstance";

export default function MeetingRoom() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [messages,setMessages] = useState([]);
    const [group, setGroup] = useState("");

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    useEffect(() => {
        const fetchMeetingGroup = async () => {
            const response = await axiosInstance.get("http://localhost:4000/api/chat/get-group")
            setGroup(response.data.group)
            fetchInitialMessages(response.data.group._id);
        }

        const fetchInitialMessages = async (groupId)=> {
           const response =   await axiosInstance.get(`http://localhost:4000/api/chat/get-initial-messages/${groupId}`)
           console.log(response)
           setMessages(response.data.data)
        }
        fetchMeetingGroup();

    },[])

    return (
        <div style={{ width: "194%" }} className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
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
                    <h2 className="text-lg font-semibold mb-4">Peoples</h2>
                    <ul className="space-y-3">
                        {group && group.members.map((m) => {
                            return <li
                                className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition flex justify-between items-center"
                            >                                <span>{m.name}</span>
                            </li>
                        })}
                    </ul>
                </aside>

                {/* Main Content */}
                <section className="col-span-9 bg-gray-900 rounded-2xl p-8 shadow-lg">
                    <ChatPanel groupId={group._id} initialMessages={messages} />
                </section>
            </main>
        </div>
    );
}
