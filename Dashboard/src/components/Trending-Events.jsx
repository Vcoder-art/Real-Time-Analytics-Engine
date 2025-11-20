import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from "recharts";


export default function TrendingEventsStacked({ data }) {

    if (!data) {
        return null
    }

    const eventKeys = Array.from(
        new Set(
            data.flatMap(item => Object.keys(item).filter(k => k !== "date"))
        )
    );
    const normalized = data.map(d => {
        const row = { date: d.date };
        eventKeys.forEach(k => {
            row[k] = d[k] ?? 0;  // if missing => 0
        });
        return row;
    });
    console.log("eventKeys", eventKeys);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={normalized}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />

                {eventKeys.map((name, i) => (
                    <Area
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stackId="1"
                        fill={`hsl(${i * 60}, 70%, 60%)`}
                        stroke={`hsl(${i * 60}, 70%, 40%)`}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    );
}
