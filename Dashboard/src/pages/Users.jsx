import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import UsersList from "../components/UsersList"

export default function Users() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { appId } = useParams();

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    return (
        <div  className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
 
            {/* Body */}
            <main className="flex-1 grid grid-cols-12 gap-6 p-8">
                {/* Sidebar */}
                <aside className="col-span-3 bg-gray-900 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-lg font-semibold mb-4">Users Options</h2>
                    <ul className="space-y-3">
                    </ul>
                </aside>

                {/* Main Content */}
                <section className="col-span-9 bg-gray-900 rounded-2xl p-8 shadow-lg">
                    <UsersList appId={appId} />
                </section>
            </main>
        </div>
    );
}
