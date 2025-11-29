import { useEffect, useRef, useState } from "react";
import MessageItem from "./Message";
import Composer from "./Composer";
import {useSelector} from "react-redux"
import { ws } from "../services/ws"


export default function ChatPanel() {

    const [messages, setMessages] = useState([]);
    const { user } = useSelector((state) => state.auth); 
    const messagesEndRef = useRef(null);
    const channel = "chat:"+user?.user?.companyId;
    const currentUserName = user?.user?.name;

    console.log("messages",messages)

    // connect and subscribe
    useEffect(() => {
      
        ws.subscribe(channel, (e) => {
            if (e.data) {
                const data = e.data;
                setMessages(prev => [...prev, { text: data.message, sender: data.sender, timestamp: new Date(data.timeStamp) }]);
            }
        })

        return () => {
            // cleanup
            try {
                // ws.send(JSON.stringify({ action: "unsubscribe", channel }));
            } catch (err) {
                console.log("Closing Error", err)
            }
        };
    }, [channel]);

    // scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
       
    }, [messages]);

    // send message helper (via WS)
    const sendMessage = (text) => {
        const payload = {
            action: "chat_message",
            channel,
            text,
            sender: currentUserName,
            timestamp: Date.now()
        };

        try {
            ws.ws.send(JSON.stringify(payload));
        } catch (err) {
            console.warn("WS send failed, message will be retried by server if using HTTP fallback", err);
            // Optionally save to local queue to retry later
        }
    };



    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-md border border-gray-800">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <div>
                    <div className="text-white font-semibold">Team Chat</div>
                    <div className="text-xs text-gray-400">{channel}</div>
                </div>
                <div className="text-sm text-gray-400">
                    <span className="text-green-400">Live</span>
                </div>
            </div>

            {/* Messages area */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3" style={{ minHeight: 200 }}>
                {messages.length === 0 && <div className="text-gray-500 text-center mt-6">No messages yet — say hi 👋</div>}
                {messages.map((m, idx) => (
                    <MessageItem key={idx + "-" + (m.timestamp || idx)} msg={m} isOwn={m.sender === currentUserName} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <Composer onSend={sendMessage} />
        </div>
    );
}
