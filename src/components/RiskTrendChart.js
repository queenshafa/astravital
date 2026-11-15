"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const DATA = [
  { day: "Mon", risk: 51 },
  { day: "Tue", risk: 44 },
  { day: "Wed", risk: 47 },
  { day: "Thu", risk: 54 },
  { day: "Fri", risk: 51 },
  { day: "Sat", risk: 46 },
  { day: "Sun", risk: 39 },
];

export default function RiskTrendChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={DATA}
        margin={{
          top: 10,
          right: 10,
          left: -15,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient
            id="riskGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#f97316"
              stopOpacity={0.35}
            />
            <stop
              offset="100%"
              stopColor="#f97316"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>

        <CartesianGrid
          vertical={false}
          stroke="rgba(255,255,255,0.08)"
        />

        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{
            fill: "rgba(255,255,255,0.5)",
            fontSize: 12,
          }}
        />

        <YAxis
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          axisLine={false}
          tickLine={false}
          tick={{
            fill: "rgba(255,255,255,0.5)",
            fontSize: 12,
          }}
        />

        <Tooltip
          cursor={{
            stroke: "rgba(255,255,255,0.2)",
            strokeWidth: 1,
          }}
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            color: "#fff",
          }}
          labelStyle={{
            color: "#fff",
          }}
        />

        <Area
          type="monotone"
          dataKey="risk"
          name="Risk Score"
          stroke="#f97316"
          strokeWidth={3}
          fill="url(#riskGradient)"
          activeDot={{
            r: 5,
            fill: "#f97316",
            stroke: "#fff",
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
