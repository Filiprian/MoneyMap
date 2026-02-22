// dashboard.tsx
import { useEffect, useState } from 'react';
import { db } from './../Db';

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
    noTransactions: 'Zatím žádné transakce...',
    noBudgets: 'Zatím žádné rozpočty pro tento měsíc...',
    cat_food: 'Jídlo',
    cat_housing: 'Bydlení',
    cat_transportation: 'Doprava',
    cat_entertainment: 'Zábava',
    cat_health: 'Zdraví',
    cat_other: 'Ostatní',
    cat_job: 'Práce',
    cat_investment: 'Investice',
    cat_gift: 'Dar',
  },
  EN: {
    dashboard: 'Dashboard',
    welcome: 'Welcome to your financial dashboard!',
    totalBalance: 'Total Balance',
    monthlyIncome: 'Monthly Income',
    monthlyExpenses: 'Monthly Expenses',
    recentTransactions: 'Recent Transactions',
    monthlyBudgets: 'Monthly Budgets',
    noTransactions: 'No transactions yet...',
    noBudgets: 'No budgets for this month yet...',
    cat_food: 'Food',
    cat_housing: 'Housing',
    cat_transportation: 'Transportation',
    cat_entertainment: 'Entertainment',
    cat_health: 'Health',
    cat_other: 'Other',
    cat_job: 'Job',
    cat_investment: 'Investment',
    cat_gift: 'Gift',
  },
};

export default function Dashboard({ language }: DashboardProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const t = translations[language];

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  useEffect(() => {
    async function fetchData() {
      try {
        // [MongoDB] const [txRes, budgetRes] = await Promise.all([
        // [MongoDB]   fetch('http://localhost:3000/transactions'),
        // [MongoDB]   fetch('http://localhost:3000/budgets'),
        // [MongoDB] ]);
        // [MongoDB] const txData = await txRes.json();
        // [MongoDB] const budgetData = await budgetRes.json();
        const [txData, budgetData] = await Promise.all([
          db.transactions.toArray(),
          db.budgets.toArray(),
        ]);

        setTransactions(txData || []);
        setBudgets(budgetData || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    }
    fetchData();
  }, []);

  // Calculations
  const totalBalance = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

  const monthlyIncome = transactions
    .filter(tx => tx.month === currentMonth && tx.year === currentYear && Number(tx.amount) > 0)
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const monthlyExpenses = transactions
    .filter(tx => tx.month === currentMonth && tx.year === currentYear && Number(tx.amount) < 0)
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

  const expensesByCategory = transactions
    .filter(tx => tx.month === currentMonth && tx.year === currentYear && Number(tx.amount) < 0)
    .reduce((acc: Record<string, number>, tx) => {
      const cat = tx.category.toLowerCase();
      acc[cat] = (acc[cat] || 0) + Math.abs(Number(tx.amount));
      return acc;
    }, {});

  const currentBudgets = budgets.filter(
    b => b.month === currentMonth && b.year === currentYear
  );

  const getCategoryName = (cat: string) => {
    const key = `cat_${cat.toLowerCase()}`;
    return (t as any)[key] || cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 85) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Sort transactions newest first
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.year, a.month - 1, a.day);
    const dateB = new Date(b.year, b.month - 1, b.day);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
        {t.dashboard}
      </h1>
      <p className="text-xl text-gray-400 mb-10">{t.welcome}</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <h3 className={totalBalance > 0 ? "text-xl font-semibold text-green-400 mb-2" : "text-xl font-semibold text-red-400 mb-2"}>
            {t.totalBalance}
          </h3>
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

      {/* Recent Transactions + Monthly Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <section className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">{t.recentTransactions}</h2>
          <div className="space-y-4 max-h-[420px] overflow-y-auto">
            {sortedTransactions.slice(0, 8).map((tx: any) => (
              <div
                key={tx._id || tx.id}
                className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0"
              >
                <span className={`text-xl font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{Number(tx.amount).toLocaleString()} Kč
                </span>
                <span className="text-gray-300">
                  {getCategoryName(tx.category)}
                </span>
                <span className="text-gray-500">
                  {tx.day}.{tx.month}.{tx.year}
                </span>
              </div>
            ))}

            {transactions.length === 0 && (
              <p className="text-gray-500 text-center py-8">{t.noTransactions}</p>
            )}
          </div>
        </section>

        {/* Monthly Budgets with progress */}
        <section className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">{t.monthlyBudgets}</h2>
          <div className="space-y-6">
            {currentBudgets.length > 0 ? (
              currentBudgets.map((budget: any) => {
                const spent = expensesByCategory[budget.category.toLowerCase()] || 0;
                const budgetAmount = Number(budget.amount);
                const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
                const safePercentage = Math.min(percentage, 100);

                return (
                  <div key={budget._id || budget.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-200">
                        {getCategoryName(budget.category)}
                      </span>
                      <span className="text-sm text-gray-400">
                        {spent.toLocaleString()} / {budgetAmount.toLocaleString()} Kč
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(safePercentage)}`}
                        style={{ width: `${safePercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{safePercentage.toFixed(0)}%</span>
                      {percentage > 100 && (
                        <span className="text-red-400">Překročeno</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-12">{t.noBudgets}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}