import { useState, useRef, useEffect } from "react";
import { convertToRaw, Editor, EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import draftToHtml from "draftjs-to-html"
import clsx from "clsx";
import { searchEmployee } from "../features/services/EmployeeService"
import { IoIosCloseCircle, IoIosClose } from "react-icons/io";

export default function ComposeMail({ onClose, onSentMail }) {
    const [recipientInput, setRecipientInput] = useState(""); // Raw text input
    const [selectedRecipients, setSelectedRecipients] = useState([]); // Array of {userId, email, name}
    const [subject, setSubject] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

    const fileInputRef = useRef(null);

    // 🔍 Search users
    useEffect(() => {
        if (!recipientInput || recipientInput.length < 2) {
            setSearchResults([]);
            setShowSearch(false);
            return;
        }

        const t = setTimeout(async () => {
            const data = await searchEmployee(recipientInput);
            // Filter out users already selected
            const filtered = data.users.filter(
                user => !selectedRecipients.some(r => r.userId === user.userId)
            );
            setSearchResults(filtered);
            setShowSearch(true);
        }, 300);

        return () => clearTimeout(t);
    }, [recipientInput, selectedRecipients]);

    const addRecipient = (user) => {
        setSelectedRecipients(prev => [...prev, user]);
        setRecipientInput("");
        setSearchResults([]);
        setShowSearch(false);
    };

    const removeRecipient = (userId) => {
        setSelectedRecipients(prev => prev.filter(r => r.userId !== userId));
    };

    const handleFilePick = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
        fileInputRef.current.value = "";
    };

    const handleSend = async () => {
        const content = editorState.getCurrentContent();
        const plainText = content.getPlainText();
        const raw = convertToRaw(content);
        const html = draftToHtml(raw);

        if (selectedRecipients.length === 0 || !subject || !plainText) return;

        // Extract userIds for the backend, emails for the display
        const userIds = selectedRecipients.map(r => r.userId);
        const emails = selectedRecipients.map(r => r.email);

        await onSentMail(userIds, emails, subject, plainText, html, attachments);
        onClose();
    };

    return (
        <div className="fixed bottom-6 right-6 w-[520px] h-[600px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col z-50">
            
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                <span className="text-white font-semibold">New Message</span>
                <IoIosCloseCircle className="cursor-pointer text-gray-400 hover:text-white" size={25} onClick={onClose} />
            </div>

            {/* RECIPIENTS (Multiple) */}
            <div className="px-4 py-2 border-b border-gray-700 relative">
                <div className="flex flex-wrap gap-2 items-center min-h-[40px]">
                    <span className="text-gray-400 text-sm">To:</span>
                    
                    {/* Pills */}
                    {selectedRecipients.map(user => (
                        <div key={user.userId} className="flex items-center bg-blue-600/20 border border-blue-500/50 text-blue-200 text-sm px-2 py-0.5 rounded-full">
                            {user.email}
                            <IoIosClose 
                                className="ml-1 cursor-pointer hover:text-white" 
                                size={18} 
                                onClick={() => removeRecipient(user.userId)} 
                            />
                        </div>
                    ))}

                    <input
                        value={recipientInput}
                        onChange={(e) => setRecipientInput(e.target.value)}
                        placeholder={selectedRecipients.length === 0 ? "Recipients" : ""}
                        className="flex-1 bg-transparent text-white outline-none placeholder-gray-400 min-w-[120px]"
                    />
                </div>

                {/* SEARCH RESULTS DROPDOWN */}
                {showSearch && searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full bg-gray-800 border border-gray-700 rounded-md mt-1 z-[60] max-h-48 overflow-y-auto shadow-xl">
                        {searchResults.map(u => (
                            <div
                                key={u.userId}
                                onClick={() => addRecipient(u)}
                                className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-200 flex flex-col"
                            >
                                <span className="font-medium">{u.name}</span>
                                <span className="text-gray-400 text-xs">{u.email}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SUBJECT */}
            <div className="px-4 py-2 border-b border-gray-700">
                <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    className="w-full bg-transparent text-white outline-none placeholder-gray-400"
                />
            </div>

            {/* EDITOR */}
            <div className="flex-1 px-4 py-2 overflow-y-auto bg-gray-900">
                <Editor editorState={editorState} onChange={setEditorState} />
            </div>

            {/* ATTACHMENTS */}
            {attachments.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-700 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {attachments.map((file, idx) => (
                        <div key={idx} className="bg-gray-800 px-3 py-1 rounded-md text-xs text-gray-300 flex items-center gap-2">
                            📎 {file.name.length > 15 ? file.name.substring(0, 15) + "..." : file.name}
                            <IoIosCloseCircle className="cursor-pointer text-gray-500 hover:text-red-400" onClick={() => removeRecipient(idx)} size={18} />
                        </div>
                    ))}
                </div>
            )}

            {/* FOOTER */}
            <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
                <label className="cursor-pointer p-2 hover:bg-gray-800 rounded-full transition-colors">
                    <span className="text-xl">📎</span>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilePick} />
                </label>

                <button
                    onClick={handleSend}
                    disabled={selectedRecipients.length === 0 || !subject}
                    className={clsx(
                        "px-8 py-2 rounded-md font-semibold transition-all",
                        selectedRecipients.length > 0 && subject
                            ? "bg-blue-600 hover:bg-blue-500 text-white"
                            : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    )}
                >
                    Send
                </button>
            </div>
        </div>
    );
}