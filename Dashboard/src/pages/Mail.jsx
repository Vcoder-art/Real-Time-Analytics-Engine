import MailSidebar from "../components/MailSidebar";
import ComposeMail from "../components/ComposeEmail";
import InboxList from "../components/InboxList"
import SentBoxList from "../components/SentBoxList";
import InboxMailDetailView from "../components/InboxDetailView";
import SentMailDetailsView from "../components/SentBoxDetailsView";
import { useState } from "react"
import { getInboxMails, sentMail, getSentMails } from "../features/services/mailService"
import { useEffect } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { toast } from "react-hot-toast"
import { IoIosRefresh } from "react-icons/io";


export default function Mail() {

    const [activeView, setActiveView] = useState("inbox");
    const [inboxList, setInboxList] = useState([])
    const [sentMails, setSentMails] = useState([])
    const [showCompose, setShowCompose] = useState(false);
    const [selectedSentMail, setSelectedSentMail] = useState("");
    const [selectedInboxMail, setSelectedInboxMail] = useState("");


    const fetchDetails = async () => {
        const preFetchInboxMails = await getInboxMails()
        const prefetchSentMails = await getSentMails();
        setInboxList(preFetchInboxMails.data);
        setSentMails(prefetchSentMails.data);
    }
    
    const reloadActiveView = (view)=> {
        fetchDetails();
        setActiveView(view);
        setSelectedSentMail("");
        setSelectedInboxMail("");
    }


    useEffect(() => {
        fetchDetails()
    }, [])

    const renderContent = () => {

        if(selectedSentMail || selectedInboxMail) {
            return null
        }

        switch (activeView) {
            case "compose":
                return <ComposeMail />;
            case "sent":
                return <SentBoxList onSelect={setSelectedSentMail} mails={sentMails} />
            default:
                return <InboxList mails={inboxList} onSelect={setSelectedInboxMail} />;
        }
    };

    const onSentMail = async (userIds, emails, subject, plainText, html, attachments) => {
        const formData = new FormData();

        // 1. Append simple strings
        formData.append("subject", subject);
        formData.append("content", plainText);
        formData.append("body", html);
        formData.append("to", JSON.stringify(userIds));
        formData.append("emails", JSON.stringify(emails));
        attachments.forEach((file) => {
            // "files" is the field name your backend will look for
            formData.append("attachments", file);
        });

        // --- Example API Call ---
        try {
            await sentMail(formData)
            toast.success("Sent Mail Successfully.");
        } catch (error) {
            toast.error("Failed to sent Mail.");
            console.error("Error sending mail:", error);
        }
    };

    const handleRefresh = () => {
        fetchDetails()
    }



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

                    <MailSidebar active={activeView} onChange={reloadActiveView} />
                </aside>


                {/* Main Content */}
                <section className="col-span-9 bg-gray-900 rounded-2xl p-8 shadow-lg">

                    {/* Header */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleRefresh} // optional
                            className="cursor-pointer text-gray-300 hover:text-white transition"
                            title="Refresh"
                        >
                            <IoIosRefresh size={25} />
                        </button>
                    </div>

                   {renderContent()}
                    {selectedSentMail && (
                        <SentMailDetailsView
                            onBack={() => setSelectedSentMail(null)}
                            mail={selectedSentMail}
                          
                        />
                    )}

                    {selectedInboxMail && (
                        <InboxMailDetailView
                            setShowCompose={setShowCompose}
                            onBack={() => setSelectedInboxMail(null)}
                            id={selectedInboxMail._id}
                        />
                    )}

                </section>

                {showCompose && (
                    <div className="fixed bottom-6 right-6 w-[520px] h-[420px] bg-gray-900 border border-gray-700 rounded-lg shadow-xl flex flex-col z-50">
                        <ComposeMail onSentMail={onSentMail} onClose={() => setShowCompose(false)} />
                    </div>
                )}


            </main>
        </div>
    );
}

