import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from "recharts";

export default function TrendingEventsStacked({ data }) {

    if (!data) {
        return null
    }

    const eventKeys = Object.keys(data[0]).filter(k => k !== "date");

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
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
