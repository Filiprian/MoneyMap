// budgets.tsx
import { useEffect, useState } from "react";

interface BudgetsProps {
  language: 'CZ' | 'EN';
}

const translations = {
  CZ: {
    budgetsTitle: "Rozpočty",
    budgetsSubtitle: "Zde můžete prohlížet a nastavovat měsíční rozpočty",
    allBudgetsThisMonth: "Rozpočty pro tento měsíc:",
    addBudget: "Přidat rozpočet",
    category: "Kategorie:",
    plannedAmount: "Částka:",
    notes: "Poznámky:",
    addButton: "Přidat rozpočet",
    noBudgets: "Zatím žádné rozpočty pro tento měsíc...",
    requiredFields: "Vyplňte prosím všechna povinná pole.",
    // Categories
    cat_food: "Jídlo",
    cat_housing: "Bydlení",
    cat_transportation: "Doprava",
    cat_entertainment: "Zábava",
    cat_health: "Zdraví",
    cat_other: "Ostatní",
  },
  EN: {
    budgetsTitle: "Budgets",
    budgetsSubtitle: "Here you can view and set monthly budgets",
    allBudgetsThisMonth: "Budgets for this month:",
    addBudget: "Add budget",
    category: "Category:",
    plannedAmount: "Amount:",
    addButton: "Add Budget",
    noBudgets: "No budgets for this month yet...",
    requiredFields: "Please fill in all required fields.",
    // Categories
    cat_food: "Food",
    cat_housing: "Housing",
    cat_transportation: "Transportation",
    cat_entertainment: "Entertainment",
    cat_health: "Health",
    cat_other: "Other",
  },
};

export default function Budgets({ language }: BudgetsProps) {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [sendData, setSendData] = useState({
    category: '',
    amount: 0,
    notes: '',
    month: 0,
    year: 0,
  });

  const t = translations[language];

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    async function fetchData() {
      try {
        const [budgetRes, txRes] = await Promise.all([
          fetch('http://localhost:3000/budgets'),
          fetch('http://localhost:3000/transactions'),
        ]);

        const budgetData = await budgetRes.json();
        const txData = await txRes.json();

        setBudgets(budgetData || []);
        setTransactions(txData || []);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    }
    fetchData();
  }, []);

  // Expenses grouped by category (current month only)
  const expensesByCategory = transactions
    .filter(tx => 
      tx.month === currentMonth && 
      tx.year === currentYear && 
      Number(tx.amount) < 0
    )
    .reduce((acc: Record<string, number>, tx) => {
      const cat = tx.category.toLowerCase();
      acc[cat] = (acc[cat] || 0) + Math.abs(Number(tx.amount));
      return acc;
    }, {});

  // Current month's budgets
  const currentBudgets = budgets.filter(
    b => b.month === currentMonth && b.year === currentYear
  );

  const getCategoryName = (cat: string) => {
    const key = `cat_${cat.toLowerCase()}`;
    return (t as any)[key] || cat;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 85) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  async function addBudget(data: typeof sendData) {
    if (!data.amount || !data.category) {
      alert(t.requiredFields);
      return;
    }

    const bodyToSend = {
      ...data,
      amount: Math.abs(data.amount), // always positive
      month: currentMonth,
      year: currentYear,
    };

    try {
      const res = await fetch('http://localhost:3000/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend),
      });

      if (res.ok) {
        // Refresh budgets
        const newRes = await fetch('http://localhost:3000/budgets');
        const newData = await newRes.json();
        setBudgets(newData || []);

        // Reset form
        setSendData({ amount: 0, category: '', notes: '', month: 0, year: 0 });
      }
    } catch (err) {
      console.error('Failed to add budget', err);
    }
  }
  return (
    <div>
      <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
        {t.budgetsTitle}
      </h1>
      <p className="text-xl text-gray-400 mb-10">{t.budgetsSubtitle}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT – Current month budgets */}
        <section className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">
            {t.allBudgetsThisMonth} ({currentMonth}/{currentYear})
          </h2>
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
                        <span className="text-red-400">Překročeno / Over!</span>
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

        {/* RIGHT – Add new budget */}
        <section className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">{t.addBudget}</h2>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              addBudget({ ...sendData, month: currentMonth, year: currentYear });
            }}
          >
            <div>
              <label className="block text-gray-300 mb-2">{t.category}</label>
              <select
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                value={sendData.category}
                onChange={(e) =>
                  setSendData((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="food">Food / Jídlo</option>
                <option value="housing">Housing / Bydlení</option>
                <option value="transportation">Transportation / Doprava</option>
                <option value="entertainment">Entertainment / Zábava</option>
                <option value="health">Health / Zdraví</option>
                <option value="other">Other / Ostatní</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t.plannedAmount}</label>
              <input
                type="number"
                min="0"
                value={sendData.amount}
                onChange={(e) =>
                  setSendData((prev) => ({ ...prev, amount: Number(e.target.value) }))
                }
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                placeholder="např. 5000"
              />
            </div>

            {/* Month & Year are auto-filled from current date */}
            <input type="hidden" name="month" value={currentMonth} />
            <input type="hidden" name="year" value={currentYear} />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {t.addButton}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}