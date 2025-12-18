import MailSidebar from "../components/MailSidebar";
import ComposeMail from "../components/ComposeEmail";
import InboxList from "../components/InboxList"
import { useState } from "react"
import { getInboxMails } from "../features/services/mailService"
import { useEffect } from "react";
import { FaPencilAlt } from "react-icons/fa";

export default function Mail() {

    const [activeView, setActiveView] = useState("inbox");
    const [inboxList, setInboxList] = useState([])
    const [showCompose, setShowCompose] = useState(true);


    const fetchInbox = async () => {
        const response = await getInboxMails()
        setInboxList(response.data);
    }

    useEffect(() => {
        fetchInbox()
    }, [])

    const renderContent = () => {
        switch (activeView) {
            case "compose":
                return <ComposeMail />;
            //   case "sent":
            //     return <SentList />;
            default:
                return <InboxList mails={inboxList} onSelect={() => { }} />;
        }
    };



    return (
        <div style={{ width: "100%" }} className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
            <main className="flex-1 grid grid-cols-12 gap-6 p-8">
                {/* Sidebar */}

                <aside className="col-span-3 bg-gray-900 rounded-2xl p-6 shadow-lg">
                    {/* Pencil aligned right */}
                    <div className="flex justify-end mb-4">
                        <FaPencilAlt
                            size={20}
                            onClick={() => setShowCompose(p => !p)}
                            className="cursor-pointer text-gray-300 hover:text-white"
                        />
                    </div>

                    <MailSidebar active={renderContent} onChange={setActiveView} />
                </aside>


                {/* Main Content */}
                <section className="col-span-9 bg-gray-900 rounded-2xl p-8 shadow-lg">
                    {renderContent()}
                </section>
                {showCompose && (
                    <div className="fixed bottom-6 right-6 w-[520px] h-[420px] bg-gray-900 border border-gray-700 rounded-lg shadow-xl flex flex-col z-50">
                        <ComposeMail onClose={() => setShowCompose(false)} />
                    </div>
                )}

            </main>
        </div>
    );
}

