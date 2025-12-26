import { useEffect, useRef, useState } from "react";
import MessageItem from "./Message";
import Composer from "./Composer";
import { useSelector } from "react-redux"
import { ws } from "../services/ws"
import axiosInstance from "../apis/axiosInstance";
import toast from "react-hot-toast";


export default function ChatPanel({ groupId, channel }) {

    const [messages, setMessages] = useState([]);
    const { user } = useSelector((state) => state.auth);
    const [typingUsers, setTypingUsers] = useState({});
    const messagesEndRef = useRef(null);
    const currentUserName = user?.user?.name;
    const currentUserRefId = user?.user?._id;
    const currentUserId = user?.user?.id;
    ``

    // connect and subscribe
    useEffect(() => {
        if (groupId && channel) {
            fetchInitialMessages();

            ws.subscribe(channel, (e) => {
                if (!e.data) return;
                const evt = e.data;
                // 🔥 Handle typing events
                if (e.type === "typing") {
                    handleTypingEvent(evt);
                    return;
                }

                // 🔥 Normal chat message
                setMessages(prev => [...prev, evt]);
            });
        }

        return () => {
            // if needed later: ws.unsubscribe(channel)
        };
    }, [groupId, channel]);


    const handleTypingEvent = (evt) => {
        const { userId, userName, state } = evt;
       
        console.log("Typing event:", evt);

        setTypingUsers(prev => {
            const updated = { ...prev };

            if (state === "start") {
                updated[userId] = {
                    name: userName,
                    lastUpdate: Date.now(),
                };
            } else {
                delete updated[userId];
            }

            return updated;
        });
    };



    // // 🔥 Auto-clear typing after 3 seconds of inactivity
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setTypingUsers(prev => {
    //             const now = Date.now();
    //             const updated = {};

    //             Object.keys(prev).forEach(uid => {
    //                 if (now - prev[uid].lastUpdate < 3000) {
    //                     updated[uid] = prev[uid];
    //                 }
    //             });

    //             return updated;
    //         });
    //     }, 1000);

    //     return () => clearInterval(interval);
    // }, []);

    // scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);


    const fetchInitialMessages = async () => {
        try {
            const response = await axiosInstance.get(`http://192.168.18.109:4000/api/chat/get-initial-messages/${groupId}`)
            setMessages(response.data.data)
        } catch (err) {
            console.log(err)
            setMessages([])
        }
    }


    // send message helper (via WS)
    const sendMessage = (text) => {
        const payload = {
            action: "chat_message",
            channel,
            text,
            senderName: currentUserName,
            groupId,
            userRefId: user.user._id,
            userId: user.user.id,
            companyId: user.user.companyId
        };

        try {
            ws.ws.send(JSON.stringify(payload));
        } catch (err) {
            console.warn("WS send failed, message will be retried by server if using HTTP fallback", err);
            // Optionally save to local queue to retry later
        }
    };

    const sendFile = async (file) => {
        //groupId, sender, senderName, senderUserId   
        const formData = new FormData();
        formData.append("file", file);
        formData.append("groupId", groupId);
        formData.append("sender", currentUserRefId);
        formData.append("senderName", currentUserName);
        formData.append("senderUserId", currentUserId);
        try {
            await axiosInstance.post(`http://192.168.18.109:4000/api/chat/upload-file`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })

        } catch (err) {
            console.log(err)
            toast.error("Failed to upload file.");
        }

    }

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-md border border-gray-800">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <div>
                    <div className="text-white font-semibold">Team Chat</div>
                    <div className="text-xs text-gray-400">{channel} -- </div>
                </div>
                <div className="text-sm text-gray-400">
                    <span className="text-green-400">Live</span>
                </div>
            </div>

            {/* Messages area */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3" style={{ minHeight: 200 }}>
                {messages.length === 0 && <div className="text-gray-500 text-center mt-6">No messages yet — say hi 👋</div>}
                {messages.map((m, idx) => (
                    <MessageItem key={idx + "-" + (m.timestamp || idx)} msg={m} isOwn={m.sender === currentUserRefId} />
                ))}


                {/* 🔥 TYPING INDICATOR */}
                {Object.keys(typingUsers).length > 0 && (
                    <div className="text-gray-400 text-sm italic px-4 animate-pulse">
                        {Object.values(typingUsers)
                            .map(u => u.name)
                            .join(", ")}{" "}
                        {Object.keys(typingUsers).length > 1 ? "are" : "is"} …
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <Composer
                channel={channel}
                currentUserName={currentUserName}
                userId={currentUserId}
                onSendMessage={sendMessage}
                onSendFile={sendFile}
                ws={ws.ws}
            />
        </div>
    );
}
