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
    const messagesEndRef = useRef(null);
    const currentUserName = user?.user?.name;
    const currentUserRefId = user?.user?._id;
    const currentUserId = user?.user?.id;


    // connect and subscribe
    useEffect(() => {
        if (groupId && channel) {
            fetchInitialMessages()
            ws.subscribe(channel, (e) => {
                if (e.data) {
                    const data = e.data;
                    setMessages(prev => [...prev, data]);
                }
            })
        }
        return () => {
            // cleanup
            try {
                // ws.send(JSON.stringify({ action: "unsubscribe", channel }));
            } catch (err) {
                console.log("Closing Error", err)
            }
        };
    }, [groupId]);

    // scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);


    const fetchInitialMessages = async () => {
        try {
            const response = await axiosInstance.get(`http://localhost:4000/api/chat/get-initial-messages/${groupId}`)
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
            await axiosInstance.post(`http://localhost:4000/api/chat/upload-file`, formData, {
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
                <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <Composer onSendMessage={sendMessage} onSendFile={sendFile} />
        </div>
    );
}
