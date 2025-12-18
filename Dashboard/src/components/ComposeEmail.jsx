import { useState, useRef, useEffect } from "react";
import { convertToRaw, Editor, EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import draftToHtml from "draftjs-to-html"
import clsx from "clsx";
import { searchEmployee } from "../features/services/EmployeeService"
import { IoIosCloseCircle } from "react-icons/io";

export default function ComposeMail({
    onClose,  // async (query) => users[]
}) {
    const [to, setTo] = useState("");
    const [subject, setSubject] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(true);
    const [editorState, setEditorState] = useState(
        () => EditorState.createEmpty(),
    );

    const fileInputRef = useRef(null);

    // 🔍 Search users
    useEffect(() => {
        if (!to || to.length < 2) {
            setSearchResults([]);
            setShowSearch(false);
            return;
        }

        const t = setTimeout(async () => {
            const data = await searchEmployee(to);
            setSearchResults(data.users);
            setShowSearch(true);
        }, 300);

        return () => clearTimeout(t);
    }, [to]);

    // 📎 Attach file
    const handleFilePick = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
        fileInputRef.current.value = "";
    };

    // ❌ Remove attachment
    const removeAttachment = (idx) => {
        setAttachments(prev => prev.filter((_, i) => i !== idx));
    };

    // 📤 Send mail
    const handleSend = () => {
        const content = editorState.getCurrentContent();
        const plainText = content.getPlainText();
        const raw = convertToRaw(content);
        const html = draftToHtml(raw);

        if (!to || !subject || !plainText) return;
        console.log({
            plainText,
            html
        })
        onClose();
    };

    return (
        <div className="fixed bottom-6 right-6 w-[520px] h-[520px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col z-50">

            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                <span className="text-white font-semibold">New Message</span>
               <IoIosCloseCircle className="cursor-pointer" size={25} onClick={onClose} />
            </div>

            {/* TO + SUBJECT */}
            <div className="px-4 py-2 border-b border-gray-700 relative">
                <input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="To"
                    className="w-full bg-transparent text-white outline-none placeholder-gray-400"
                />

                {/* SEARCH RESULTS */}
                {showSearch && searchResults.length > 0 && (
                    <div className="absolute left-4 right-4 top-full bg-gray-800 border border-gray-700 rounded-md mt-1 z-50 max-h-40 overflow-y-auto">
                        {searchResults.map(u => (
                            <div
                                key={u.userId}
                                onClick={() => {
                                    setTo(u.email);
                                    setShowSearch(false);
                                }}
                                className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-gray-200"
                            >
                                {u.name} <span className="text-gray-400 text-xs">({u.email})</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-4 py-2 border-b border-gray-700">
                <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    className="w-full bg-transparent text-white outline-none placeholder-gray-400"
                />
            </div>

            {/* EDITOR */}
            <div className="flex-1 px-4 py-2 overflow-y-auto">
                <Editor editorState={editorState} onChange={setEditorState} />
            </div>

            {/* ATTACHMENTS */}
            {attachments.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-700 flex flex-wrap gap-2">
                    {attachments.map((file, idx) => (
                        <div
                            key={idx}
                            className="bg-gray-800 px-3 py-1 rounded-md text-sm text-gray-300 flex items-center gap-2"
                        >
                            📎 {file.name}
                            <IoIosCloseCircle className="cursor-pointer" onClick={() => removeAttachment(idx)} size={25} />
                           
                        </div>
                    ))}
                </div>
            )}

            {/* FOOTER */}
            <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
                <div className="flex gap-3">
                    <label className="cursor-pointer text-gray-300 hover:text-white">
                        📎
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFilePick}
                        />
                    </label>
                </div>

                <button
                    onClick={handleSend}
                    disabled={!to || !subject}
                    className={clsx(
                        "px-6 py-2 rounded-md text-white",
                        to && subject
                            ? "bg-blue-600 hover:bg-blue-500"
                            : "bg-gray-700 cursor-not-allowed"
                    )}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
