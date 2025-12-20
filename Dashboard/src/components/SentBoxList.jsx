import { MdAttachEmail } from "react-icons/md";
import { IoMdMail } from "react-icons/io";

function SentBoxList({ mails, onSelect }) {
    
    const renderRecipients = (recipients) => {
        if (!recipients || recipients.length === 0) return "No Recipients";
        if (recipients.length === 1) return recipients[0].name || recipients[0].email;

        const firstTwo = recipients.slice(0, 2).map(r => r.name.split(' ')[0]).join(", ");
        const remaining = recipients.length - 2;
        
        return (
            <span className="flex items-center gap-1">
                {firstTwo} {remaining > 0 && <span className="text-blue-400 text-xs font-bold">+{remaining}</span>}
            </span>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gray-900">
            <h4 className="px-6 py-4 text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-800">
                Sent Messages
            </h4>

            {mails.map((mail) => (
                <div
                    key={mail._id}
                    onClick={() => onSelect(mail)}
                    className="group px-6 py-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors relative"
                >
                    {/* Header: Recipients + Date */}
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                                {mail.to[0]?.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            
                            <span className="font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                                {renderRecipients(mail.to)}
                            </span>
                        </div>
                        
                        <span className="text-[11px] text-gray-500 font-medium">
                            {new Date(mail.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                    </div>

                    {/* Subject Row */}
                    <div className="flex items-start justify-between pl-11">
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm text-gray-200 font-medium truncate">
                                {mail.subject || "(No Subject)"}
                            </span>
                            
                            {/* NEW: PlainText Preview */}
                            <span className="text-xs text-gray-500 truncate mt-0.5">
                                {mail.plainText ? `${mail.plainText}...` : "No additional text"}
                            </span>
                        </div>

                        {/* Status/Attachment Icons */}
                        <div className="flex items-center ml-4 mt-1">
                            {mail.attachments?.length > 0 ? (
                                <div className="flex items-center gap-1 bg-gray-800 px-2 py-0.5 rounded text-[10px] text-gray-400 border border-gray-700">
                                    <MdAttachEmail size={14} />
                                    {mail.attachments.length}
                                </div>
                            ) : (
                                <IoMdMail size={16} className="text-gray-700 opacity-40 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                    </div>
                </div>
            ))}
            
            {mails.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                    <IoMdMail size={48} className="mb-2 opacity-20" />
                    <p className="text-sm">No sent messages found</p>
                </div>
            )}
        </div>
    );
}

export default SentBoxList;