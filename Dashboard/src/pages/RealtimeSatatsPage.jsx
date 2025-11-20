import { useEffect } from "react";
import DailyActiveUsersChart from "../components/Daily-Active-Users";
import TrendingEventsStacked from "../components/Trending-Events";

export default function RealtimeStatsPage({ stats }) {

  useEffect(() => {
    transformTrendingData();
  }, []);

  if (!stats) {
    return (
      <div className="text-gray-400 text-center mt-20">Waiting for live data…</div>
    );
  }

  const dau = stats.dailyActiveUsers?.data || [];
  const trending = stats.trendingEvents?.data || [];
  const totalEvents = stats.countOfEventsByApp?.count || 0;



  function transformTrendingData() {
    const raw = stats.trendingEvents?.data;

    if (raw && raw.length > 0) {
      const map = {};

      raw.forEach(item => {
        if (!map[item.date]) map[item.date] = { date: item.date };
        map[item.date][item.event_name] = Number(item.count);
      });
      console.log( Object.values(map))
      return Object.values(map);
    }

  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
          <h3 className="text-gray-400">Total Events</h3>
          <p className="text-3xl font-semibold mt-2">{totalEvents}</p>
        </div>

        <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
          <h3 className="text-gray-400">Top Event</h3>
          <p className="text-xl font-semibold mt-2">
            {trending[0]?.event_name || "N/A"}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <h4>Daily Active Users</h4>
        <DailyActiveUsersChart data={dau.map(el => ({ date: el.date, count: Number(el.count) }))} />
        <h4>Trending Events</h4>
        <TrendingEventsStacked data={transformTrendingData()} />
      </div>

      {/* Stats Cards */}


      {/* Charts + Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

        {/* Daily Active Users */}
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Daily Active Users</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dau.map((d, i) => (
              <div key={i} className="flex justify-between text-gray-300 bg-gray-700 p-2 rounded">
                <span>{d.date}</span>
                <span className="font-semibold">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Events */}
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Trending Events</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {trending.map((t, i) => (
              <div key={i} className="flex justify-between text-gray-300 bg-gray-700 p-2 rounded">
                <span>{t.date}</span>
                <span>{t.event_name}</span>
                <span className="font-semibold">{t.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
