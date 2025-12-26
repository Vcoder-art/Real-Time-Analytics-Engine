import { MdDelete, MdMoreVert, MdAttachFile, MdDoneAll, MdRemoveRedEye } from "react-icons/md";
import { IoMdMail } from "react-icons/io";

function SentBoxDetailsView({ mail, onBack }) {
    if (!mail) return null;

    const readCount = mail.readBy?.length || 0;
    const isReadByAll = mail.to?.length === readCount;

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-900 text-gray-100 overflow-hidden">
            {/* TOOLBAR */}
            <div className="px-6 py-3 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full text-gray-400">
                        ←
                    </button>
                    <div className="flex gap-2">                        
                        <button title="Delete" className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"><MdDelete size={20} /></button>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-800 rounded-full text-gray-400"><MdMoreVert size={20} /></button>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
                
                {/* SUBJECT */}
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
                    
                    <div className="flex flex-col items-end gap-2">
                        <div className="text-xs text-gray-500">
                            {new Date(mail.createdAt).toLocaleString([], { 
                                month: 'short', day: 'numeric', year: 'numeric', 
                                hour: '2-digit', minute: '2-digit' 
                            })}
                        </div>
                        {/* Status Badge */}
                        {readCount > 0 ? (
                            <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${isReadByAll ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                                <MdDoneAll size={14} />
                                {isReadByAll ? 'Read by everyone' : `Seen by ${readCount}`}
                            </div>
                        ) : (
                            <div className="text-[10px] text-gray-600 flex items-center gap-1 px-2 py-0.5">
                                <MdDoneAll size={14} /> Sent
                            </div>
                        )}
                    </div>
                </div>

                {/* EMAIL BODY */}
                <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-800 min-h-[250px]">
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

                {/* READ BY DETAILS SECTION */}
                {readCount > 0 && (
                    <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                            <MdRemoveRedEye className="text-gray-500" size={16} />
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Seen by</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {mail.readBy.map((user) => (
                                <div key={user.userId} className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-full pl-1 pr-3 py-1 hover:bg-gray-800 transition-colors group">
                                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-gray-300">{user.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ATTACHMENTS SECTION */}
                {mail.attachments?.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <h5 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                            <MdAttachFile /> {mail.attachments.length} Attachments
                        </h5>
                        <div className="flex flex-wrap gap-4">
                            {mail.attachments.map((file, idx) => (
                                <div key={idx} className="group flex items-center p-3 bg-gray-800 border border-gray-700 rounded-xl hover:border-blue-500 transition-all cursor-pointer">
                                    <div className="p-2 bg-gray-700 rounded-lg mr-3 group-hover:bg-blue-600/20">
                                        <IoMdMail className="text-gray-400 group-hover:text-blue-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-200">{file.name}</span>
                                        <span className="text-[10px] text-gray-500 uppercase">{file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'File'}</span>
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

export default SentBoxDetailsView;