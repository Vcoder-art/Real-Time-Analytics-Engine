

function DashboardOverview() {
    return <>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            {/* <Users className="w-5 h-5 text-blue-400" /> */}
            Dashboard Overview
        </h2>

        <div className="grid grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-gray-800 rounded-xl p-6 hover:scale-[1.02] transition">
                <p className="text-gray-400 text-sm">Total Events</p>
                <h3 className="text-2xl font-bold mt-2">12,438</h3>
            </div>

            {/* Card 2 */}
            <div className="bg-gray-800 rounded-xl p-6 hover:scale-[1.02] transition">
                <p className="text-gray-400 text-sm">Active Users (24h)</p>
                <h3 className="text-2xl font-bold mt-2">864</h3>
            </div>

            {/* Card 3 */}
            <div className="bg-gray-800 rounded-xl p-6 hover:scale-[1.02] transition">
                <p className="text-gray-400 text-sm">Events per Second</p>
                <h3 className="text-2xl font-bold mt-2">42</h3>
            </div>
        </div>
    </>
}

export default DashboardOverview;