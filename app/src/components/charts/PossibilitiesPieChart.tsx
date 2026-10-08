import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface PossibilitiesPieChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
}

export default function PossibilitiesPieChart({ data, title = "Possibilities Distribution" }: PossibilitiesPieChartProps) {
  // Dark, high-contrast colors to keep slices distinct and readable
  const colors = [
    "#3B82F6", // Vibrant Blue
    "#EA580C", // Vibrant Orange
    "#7C3AED", // Vibrant Purple
    "#E11D48", // Vibrant Rose/Pink
    "#D97706", // Vibrant Amber/Gold
    "#4F46E5", // Vibrant Indigo
    "#DC2626", // Vibrant Red
  ];

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-between select-none">
      {title && (
        <h3 className="text-sm font-semibold tracking-wide text-white/90 mb-4 self-start font-mono">
          📊 {title}
        </h3>
      )}
      
      <div className="w-full h-56 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="rgba(0, 0, 0, 0.3)" strokeWidth={1} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 18, 13, 0.95)",
                borderColor: "rgba(116, 198, 157, 0.2)",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
              }}
              formatter={(value: any) => [`${value}%`, "Confidence/Suitability"]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: "10px",
                fontFamily: "monospace",
                color: "rgba(255, 255, 255, 0.6)",
                paddingTop: "10px"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
