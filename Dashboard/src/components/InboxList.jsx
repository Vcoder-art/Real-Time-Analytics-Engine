import { MdAttachEmail } from "react-icons/md";
import { IoMdMail } from "react-icons/io";

function InboxList({ mails, onSelect }) {
    return (
        <div className="flex-1 overflow-y-auto">
            <h4 className="px-6 py-3 text-gray-300 font-semibold">Inbox</h4>

            {mails.map((mail) => (
                <div
                    key={mail._id}
                    onClick={() => onSelect(mail)}
                    className="px-6 py-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer"
                >
                    {/* Header */}

                    <div className="flex justify-between items-center">
                        <span className="font-medium text-white">
                            {mail.from.name}
                        </span>
                        <span className="text-xs text-gray-400">
                            {mail.createdAt}
                        </span>
                    </div>

                    {/* Subject + Attachment */}
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="truncate flex-1">
                            {mail.subject}
                        </span>

                        {mail.attachments?.length > 0 && (
                            <MdAttachEmail size={30} title={`${mail.attachments?.length} attachments.`} />
                        )}

                        {mail.attachments?.length == 0 && (
                            <IoMdMail size={30} />
                        )}

                    </div>
                </div>
            ))}
        </div>
    );
}

export default InboxList;
