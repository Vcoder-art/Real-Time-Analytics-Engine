export default function UserEventStream({ events }) {
  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">

      {events.map((ev, i) => (
        <div key={i} className="p-3 bg-gray-700 rounded-lg">
          <p className="text-blue-300 font-semibold">{ev.event_name}</p>

          <p className="text-gray-400 text-sm">
            {new Date(Number(ev.ts)).toLocaleString()}
          </p>

          <pre className="text-gray-300 bg-gray-900 p-2 rounded mt-2 text-sm overflow-x-auto">
            {ev.payload_json}
          </pre>
        </div>
      ))}

    </div>
  );
}
