import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TotalChartProps {
  data: Array<{ month: string; balance: number }>;
  language?: 'CZ' | 'EN'; // volitelný prop pro překlad
}

export default function TotalChart({ data, language = 'CZ' }: TotalChartProps) {
  const czFormatter = new Intl.NumberFormat('cs-CZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const t = {
    CZ: {
      balance: 'Zůstatek',
      labelSuffix: '2026',
    },
    EN: {
      balance: 'Balance',
      labelSuffix: '2026',
    },
  }[language];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: "#a6afb9" }}
          axisLine={{ stroke: "#4b5563" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(value) => `${czFormatter.format(value)} Kč`}
          tick={{ fill: "#a6afb9" }}
          axisLine={{ stroke: "#4b5563" }}
          tickLine={false}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;

            const value = payload[0].value as number;

            return (
              <div className="
                bg-gray-800 border border-gray-600 
                rounded-lg px-5 py-4 shadow-2xl min-w-[200px]
                text-gray-100 text-base
              ">
                <div className="font-bold text-indigo-400 mb-2">
                  {label} {t.labelSuffix}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t.balance}:</span>
                  <span className="font-semibold text-white">
                    {czFormatter.format(value)} Kč
                  </span>
                </div>
              </div>
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#4f46e5"
          strokeWidth={2.5}
          dot={{ r: 4, stroke: "#4f46e5", strokeWidth: 2 }}
          activeDot={{ r: 8, stroke: "#4f46e5", strokeWidth: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}