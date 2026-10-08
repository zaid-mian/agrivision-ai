import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { useTranslation } from "react-i18next";

interface DiseaseHistoryChartProps {
  data: Array<{ day: string; scans: number }>;
}

export default function DiseaseHistoryChart({ data }: DiseaseHistoryChartProps) {
  const { t } = useTranslation();

  // Handle dry fallbacks
  const chartData = data && data.length > 0 ? data : [
    { day: "Mon", scans: 2 },
    { day: "Tue", scans: 1 },
    { day: "Wed", scans: 4 },
    { day: "Thu", scans: 0 },
    { day: "Fri", scans: 2 },
    { day: "Sat", scans: 1 },
    { day: "Sun", scans: 3 }
  ];

  const colors = ["#2D6A4F", "#377E5F", "#40936F", "#4FA981", "#5EBF93", "#74C69D", "#95D5B2"];

  return (
    <div className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-4">
      <h3 className="text-sm font-semibold tracking-wide text-white/95 mb-3">
        {t("dashboard.historyTitle")}
      </h3>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="day"
              stroke="rgba(255,255,255,0.5)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.95)",
                borderColor: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "12px"
              }}
            />
            <Bar dataKey="scans" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
