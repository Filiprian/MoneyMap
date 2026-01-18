import { useEffect, useState } from 'react';

interface DashboardProps {
  language: 'CZ' | 'EN';
}

const translations = {
  CZ: {
    dashboard: 'Přehled',
    welcome: 'Vítejte na vašem finančním přehledu!',
    totalBalance: 'Celkový zůstatek',
    monthlyIncome: 'Měsíční příjem',
    monthlyExpenses: 'Měsíční výdaje',
    recentTransactions: 'Poslední transakce',
    monthlyBudgets: 'Měsíční rozpočty',
    categoryFood: 'Jídlo',
    categoryJob: 'Práce',
  },
  EN: {
    dashboard: 'Dashboard',
    welcome: 'Welcome to your financial dashboard!',
    totalBalance: 'Total Balance',
    monthlyIncome: 'Monthly Income',
    monthlyExpenses: 'Monthly Expenses',
    recentTransactions: 'Recent Transactions',
    monthlyBudgets: 'Monthly Budgets',
    categoryFood: 'Food',
    categoryJob: 'Job',
  },
};

export default function Dashboard({ language }: DashboardProps) {
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const t = translations[language];

  const today = new Date();
  const currentMonth = today.getMonth() + 1;

  useEffect(() => {
    async function fetchAllTransactions() {
      try {
        const res = await fetch('http://localhost:3000/transactions');
        const data = await res.json();
        setAllTransactions(data || []);
      } catch (err) {
        console.error('Failed to fetch transactions', err);
      }
    }
    fetchAllTransactions();
  }, []);

  // Calculations
  const totalBalance = allTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

  const monthlyIncome = allTransactions
    .filter(tx => tx.month === currentMonth && Number(tx.amount) > 0)
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const monthlyExpenses = allTransactions
    .filter(tx => tx.month === currentMonth && Number(tx.amount) < 0)
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
        {t.dashboard}
      </h1>
      <p className="text-xl text-gray-400 mb-10">{t.welcome}</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <h3 className={totalBalance > 0 ? "text-xl font-semibold text-green-400 mb-2" : "text-xl font-semibold text-red-400 mb-2"}>{t.totalBalance}</h3>
          <p className="text-4xl font-bold">{totalBalance.toLocaleString()} Kč</p>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <h3 className="text-xl font-semibold text-gray-300 mb-2">{t.monthlyIncome}</h3>
          <p className="text-4xl font-bold text-green-400">{monthlyIncome.toLocaleString()} Kč</p>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <h3 className="text-xl font-semibold text-gray-300 mb-2">{t.monthlyExpenses}</h3>
          <p className="text-4xl font-bold text-red-400">{monthlyExpenses.toLocaleString()} Kč</p>
        </div>
      </div>

      {/* Recent Transactions + Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">{t.recentTransactions}</h2>
          <div className="space-y-4">
            {allTransactions.slice(-8).map((tx: any) => (
              <div
                key={tx.id}
                className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0"
              >
                <span className={`text-xl font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{Number(tx.amount).toLocaleString()} Kč
                </span>
                <span className="text-gray-300">
                  {language === 'CZ' ? tx.category : (tx.category === 'Food' ? t.categoryFood : t.categoryJob)}
                </span>
                <span className="text-gray-500">
                  {tx.day}.{tx.month} {tx.year}
                </span>
              </div>
            ))}
            {allTransactions.length === 0 && (
              <p className="text-gray-500 text-center py-8">No transactions yet...</p>
            )}
          </div>
        </section>

        <section className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">{t.monthlyBudgets}</h2>
          <p className="text-gray-400 text-center py-12">
            Budget overview with progress bars coming soon...
          </p>
        </section>
      </div>
    </div>
  );
}