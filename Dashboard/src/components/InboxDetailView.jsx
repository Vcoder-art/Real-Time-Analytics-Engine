import { MdReply,MdDelete, MdMoreVert, MdAttachFile, MdDownload } from "react-icons/md"; // Added MdDownload
import { IoMdMail } from "react-icons/io";
import { useEffect, useState } from "react";
import { readMailById } from "../features/services/mailService";

const domain = "http://localhost:4000"

function MailDetailView({ id, onBack }) {
    const [mail, setMail] = useState("");

    useEffect(() => {
        const fetchMail = async () => {
            if (id) {
                const response = await readMailById(id);
                setMail(response.data);
            }
        };
        fetchMail();
    }, [id]); // Added id to dependency array

    // Helper to handle the download logic
    const handleDownload = (file) => {
        // If you have a direct URL:
        const link = document.createElement("a");
        link.href = domain + file.fileUrl; // Ensure your file object has a 'url' property
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!id || !mail) return null;

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-900 text-gray-100 overflow-hidden">
            {/* TOOLBAR */}
            <div className="px-6 py-3 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full text-gray-400">
                        ←
                    </button>
                    <div className="flex gap-2">
                        <button title="Delete" className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"><MdReply size={20} /></button>
                        <button title="Delete" className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"><MdDelete size={20} /></button>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-800 rounded-full text-gray-400"><MdMoreVert size={20} /></button>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
                <h2 className="text-2xl font-semibold mb-8 text-gray-100">
                    {mail.subject || "(No Subject)"}
                </h2>

                {/* SENDER INFO */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/20">
                            {mail.from?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-100">{mail.from?.name}</span>
                                <span className="text-xs text-gray-500">&lt;{mail.from?.email}&gt;</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                to {mail.to?.map(r => r.email).join(", ")}
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        {new Date(mail.createdAt).toLocaleString([], {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </div>
                </div>

                {/* EMAIL BODY */}
                <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-800 min-h-[300px]">
                    {mail.body ? (
                        <div
                            className="prose prose-invert max-w-none text-gray-300 mail-body-html"
                            dangerouslySetInnerHTML={{ __html: mail.body }}
                        />
                    ) : (
                        <div className="whitespace-pre-wrap text-gray-300 leading-relaxed font-sans">
                            {mail.plainText}
                        </div>
                    )}
                </div>

                {/* ATTACHMENTS SECTION */}
                {mail.attachments?.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <h5 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                            <MdAttachFile /> {mail.attachments.length} Attachments
                        </h5>
                        <div className="flex flex-wrap gap-4">
                            {mail.attachments.map((file, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleDownload(file)}
                                    className="group relative flex items-center p-3 bg-gray-800 border border-gray-700 rounded-xl hover:border-blue-500/50 hover:bg-gray-800/80 transition-all cursor-pointer min-w-[200px]"
                                >
                                    <div className="p-2 bg-gray-700 rounded-lg mr-3 group-hover:bg-blue-600/20 transition-colors">
                                        <IoMdMail className="text-gray-400 group-hover:text-blue-400" />
                                    </div>
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                        <span className="text-sm font-medium text-gray-200 truncate pr-6">{file.name}</span>
                                        <span className="text-[10px] text-gray-500 uppercase">
                                            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'File'}
                                        </span>
                                    </div>

                                    {/* Download Icon Overlay */}
                                    <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
                                        <MdDownload size={18} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MailDetailView;