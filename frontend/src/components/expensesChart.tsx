import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CurrentMonthExpensePieProps {
  transactions: any[];
  currentYear: number;
  currentMonth: number; // 1–12
  language: 'CZ' | 'EN';
  getCategoryName: (cat: string) => string;
}

const COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#f97316', '#64748b',
];

export default function CurrentMonthExpensePie({
  transactions,
  currentYear,
  currentMonth,
  language,
  getCategoryName,
}: CurrentMonthExpensePieProps) {

  const categoryMap: Record<string, number> = {};

  transactions.forEach((tx) => {
    const amount = Number(tx.amount);
    if (amount >= 0) return;

    let txYear: number, txMonth: number;
    if (tx.date) {
      const d = new Date(tx.date);
      txYear = d.getFullYear();
      txMonth = d.getMonth() + 1;
    } else {
      txYear = Number(tx.year || 0);
      txMonth = Number(tx.month || 0);
    }

    if (txYear !== currentYear || txMonth !== currentMonth) return;

    const rawCategory = (tx.category || 'other').trim().toLowerCase();
    const translatedName = getCategoryName(rawCategory);

    categoryMap[translatedName] = (categoryMap[translatedName] || 0) + Math.abs(amount);
  });

  const data = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const czFormatter = new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const monthName = new Date(currentYear, currentMonth - 1, 1).toLocaleString(
    language === 'CZ' ? 'cs-CZ' : 'default',
    { month: 'long' }
  );

  if (data.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        {language === 'CZ' ? `Žádné výdaje v ${monthName} ${currentYear}` : `No expenses in ${monthName} ${currentYear}`}
      </div>
    );
  }

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={110}
            innerRadius={60}
            label={({ name, percent }) => {
              const percentage = percent != null ? (percent * 100).toFixed(0) : '0';
              return `${name} (${percentage}%)`;
            }}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;

              const entry = payload[0];
              const value = entry.value as number;
              const percent = ((value / total) * 100).toFixed(1);

              return (
                <div
                  className={`
                    bg-gray-800 border border-gray-600 
                    rounded-lg px-5 py-4 shadow-2xl min-w-[220px]
                    text-gray-100 text-base
                  `}
                >
                  <div className="font-bold text-blue-400 text-lg mb-2">{entry.name}</div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">
                      {language === 'CZ' ? 'Částka' : 'Amount'}:
                    </span>
                    <span className="font-semibold">
                      {czFormatter.format(value)} Kč
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      {language === 'CZ' ? 'Podíl' : 'Share'}:
                    </span>
                    <span className="font-semibold text-emerald-400">
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            }}
          />

          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ color: '#e5e7eb', fontSize: '14px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}