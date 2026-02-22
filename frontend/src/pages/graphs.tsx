import { useEffect, useState } from "react";
import TotalChart from "../components/totalChart";
import IncomeExpenseChart from "../components/incomeExpenseChart";
import ExpensesChart from "../components/expensesChart";
import { db } from './../Db';

interface GraphsProps {
  language: 'CZ' | 'EN';
}

const categoryTranslations = {
  CZ: {
    food: "Jídlo",
    housing: "Bydlení",
    transportation: "Doprava",
    entertainment: "Zábava",
    health: "Zdraví",
    other: "Ostatní",
    job: "Práce",
    investment: "Investice",
    gift: "Dar",
  },
  EN: {
    food: "Food",
    housing: "Housing",
    transportation: "Transportation",
    entertainment: "Entertainment",
    health: "Health",
    other: "Other",
    job: "Job",
    investment: "Investment",
    gift: "Gift",
  },
};

export default function Graphs({ language }: GraphsProps) {
  const [transactions, setTransactions] = useState<any[]>([]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const t = categoryTranslations[language];

  const getCategoryName = (cat: string) => {
    const key = cat.toLowerCase();
    return (t as any)[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // [MongoDB] const txRes = await fetch('http://localhost:3000/transactions');
        // [MongoDB] const txData = await txRes.json();
        const txData = await db.transactions.toArray();
        setTransactions(txData || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    }
    fetchData();
  }, []);

  // Helper to get month key "2026-02"
  const getMonthKey = (tx: any) => {
    let year: number, month: number;

    if (tx.date) {
      const d = new Date(tx.date);
      if (isNaN(d.getTime())) return null;
      year = d.getFullYear();
      month = d.getMonth() + 1;
    } else if (tx.year && tx.month) {
      year = Number(tx.year);
      month = Number(tx.month);
    } else {
      return null;
    }

    if (year !== currentYear) return null;
    return `${year}-${String(month).padStart(2, '0')}`;
  };

  // Safe sorted transactions (chronological order)
  const sortedTx = [...transactions]
    .filter(tx => tx?.amount != null && !isNaN(Number(tx.amount)))
    .sort((a, b) => {
      const da = a.date ? new Date(a.date) : new Date(a.year ?? 0, (a.month ?? 1) - 1, 1);
      const db = b.date ? new Date(b.date) : new Date(b.year ?? 0, (b.month ?? 1) - 1, 1);
      return da.getTime() - db.getTime();
    });

  // Running balance for total balance chart
  let running = 0;
  const monthlyBalances: Record<string, number> = {};

  sortedTx.forEach(tx => {
    running += Number(tx.amount);
    const key = getMonthKey(tx);
    if (key) {
      monthlyBalances[key] = running;
    }
  });

  // Build balance data (carry forward when no transactions)
  const balanceData = [];
  let lastBalance = 0;

  for (let i = 1; i <= 12; i++) {
    const key = `${currentYear}-${String(i).padStart(2, '0')}`;
    const monthName = new Date(currentYear, i - 1, 1).toLocaleString(
      language === 'CZ' ? 'cs-CZ' : 'default',
      { month: 'short' }
    );

    const balance = monthlyBalances[key] !== undefined ? monthlyBalances[key] : lastBalance;
    lastBalance = balance;

    balanceData.push({
      month: monthName,
      balance,
    });
  }

  // Income vs Expenses data
  const monthlyIncome: Record<string, number> = {};
  const monthlyExpenses: Record<string, number> = {};

  sortedTx.forEach(tx => {
    const amount = Number(tx.amount);
    const key = getMonthKey(tx);
    if (!key) return;

    if (amount > 0) {
      monthlyIncome[key] = (monthlyIncome[key] || 0) + amount;
    } else if (amount < 0) {
      monthlyExpenses[key] = (monthlyExpenses[key] || 0) + Math.abs(amount);
    }
  });

  const incomeExpenseData = [];
  for (let i = 1; i <= 12; i++) {
    const key = `${currentYear}-${String(i).padStart(2, '0')}`;
    const monthName = new Date(currentYear, i - 1, 1).toLocaleString(
      language === 'CZ' ? 'cs-CZ' : 'default',
      { month: 'short' }
    );

    incomeExpenseData.push({
      month: monthName,
      income: monthlyIncome[key] || 0,
      expenses: monthlyExpenses[key] || 0,
    });
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold mb-6">
          {language === 'CZ' ? 'Celkový zůstatek v čase' : 'Total balance over time'} ({currentYear})
        </h2>
        <TotalChart data={balanceData} language={language} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">
          {language === 'CZ' ? 'Příjmy vs Výdaje' : 'Income vs Expenses'} ({currentYear})
        </h2>
        <IncomeExpenseChart data={incomeExpenseData} language={language}/>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">
          {language === 'CZ' ? 'Kategorie výdajů tento měsíc' : 'Expense categories this month'}
        </h2>
        <ExpensesChart
          transactions={transactions}
          currentYear={currentYear}
          currentMonth={currentMonth}
          language={language}
          getCategoryName={getCategoryName}
        />
      </section>
    </div>
  );
}