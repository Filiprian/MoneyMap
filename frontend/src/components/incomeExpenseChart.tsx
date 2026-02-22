import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface IncomeExpenseProps {
  data: Array<{ month: string; income: number; expenses: number }>;
  language?: 'CZ' | 'EN';
}

export default function IncomeExpenseChart({ data, language = 'CZ' }: IncomeExpenseProps) {
  const czFormatter = new Intl.NumberFormat('cs-CZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const t = {
    CZ: {
      income: 'Příjmy',
      expenses: 'Výdaje',
      labelSuffix: '2026',
    },
    EN: {
      income: 'Income',
      expenses: 'Expenses',
      labelSuffix: '2026',
    },
  }[language];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            if (!active || !payload || payload.length < 2) return null;

            const income = payload[0]?.value as number ?? 0;
            const expenses = payload[1]?.value as number ?? 0;

            return (
              <div className="
                bg-gray-800 border border-gray-600 
                rounded-lg px-5 py-4 shadow-2xl min-w-[240px]
                text-gray-100 text-base
              ">
                <div className="font-bold text-indigo-400 mb-3">
                  {label} {t.labelSuffix}
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-green-400 font-medium">{t.income}:</span>
                  <span className="font-semibold">
                    {czFormatter.format(income)} Kč
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400 font-medium">{t.expenses}:</span>
                  <span className="font-semibold">
                    {czFormatter.format(expenses)} Kč
                  </span>
                </div>
              </div>
            );
          }}
        />
        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}