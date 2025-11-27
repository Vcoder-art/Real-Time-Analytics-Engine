
export default function UserStatsCard({ summary }) {

    console.log("This is summary",summary)
  return (
    <div className="grid grid-cols-4 gap-4 text-center">

      <div className="p-4 bg-gray-800 rounded-xl">
        <p className="text-gray-400">User ID</p>
        <p className="text-lg">{summary.user_id}</p>
      </div>

      <div className="p-4 bg-gray-800 rounded-xl">
        <p className="text-gray-400">Total Events</p>
        <p className="text-lg">{summary.total_events}</p>
      </div>

      <div className="p-4 bg-gray-800 rounded-xl">
        <p className="text-gray-400">First Seen</p>
        <p className="text-lg">
          {new Date(Number(summary.first_events_ts)).toLocaleString()}
        </p>
      </div>

      <div className="p-4 bg-gray-800 rounded-xl">
        <p className="text-gray-400">Last Active</p>
        <p className="text-lg">
          {new Date(Number(summary.last_event_ts)).toLocaleString()}
        </p>
      </div>

    </div>
  );
}
