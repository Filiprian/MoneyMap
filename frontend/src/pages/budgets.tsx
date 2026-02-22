// budgets.tsx
import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface BudgetsProps {
  language: 'CZ' | 'EN';
}

const translations = {
  CZ: {
    budgetsTitle: "Rozpočty",
    budgetsSubtitle: "Zde můžete prohlížet a nastavovat měsíční rozpočty",
    allBudgetsThisMonth: "Rozpočty pro tento měsíc:",
    addBudget: "Přidat rozpočet",
    editBudget: "Upravit rozpočet",
    category: "Kategorie:",
    plannedAmount: "Částka:",
    notes: "Poznámky:",
    addButton: "Přidat rozpočet",
    saveChanges: "Uložit změny",
    cancel: "Zrušit",
    noBudgets: "Zatím žádné rozpočty pro tento měsíc...",
    requiredFields: "Vyplňte prosím všechna povinná pole.",
    reallyDelete: "Opravdu smazat tento rozpočet?",
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
    editBudget: "Edit budget",
    category: "Category:",
    plannedAmount: "Amount:",
    notes: "Notes:",
    addButton: "Add Budget",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    noBudgets: "No budgets for this month yet...",
    requiredFields: "Please fill in all required fields.",
    reallyDelete: "Really delete this budget?",
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [sendData, setSendData] = useState({
    category: '',
    amount: 0,
    notes: '',
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

  async function saveBudget(e: React.FormEvent) {
    e.preventDefault();

    if (!sendData.amount || !sendData.category) {
      alert(t.requiredFields);
      return;
    }

    const bodyToSend = {
      category: sendData.category,
      amount: Math.abs(sendData.amount),
      notes: sendData.notes || '',
      month: currentMonth,
      year: currentYear,
    };

    const url = isEditing && editingId
      ? `http://localhost:3000/budgets/${editingId}`
      : 'http://localhost:3000/budgets';

    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend),
      });

      if (res.ok) {
        // Refresh budgets
        const newRes = await fetch('http://localhost:3000/budgets');
        const newData = await newRes.json();
        setBudgets(newData || []);

        // Reset form
        setSendData({ category: '', amount: 0, notes: '' });
        setIsEditing(false);
        setEditingId(null);
      } else {
        alert(isEditing ? "Update failed" : "Add failed");
      }
    } catch (err) {
      console.error("Save failed", err);
      alert("Error saving budget");
    }
  }

  const handleEditClick = (budget: any) => {
    setIsEditing(true);
    setEditingId(budget._id || budget.id);

    setSendData({
      category: budget.category.toLowerCase(),
      amount: Number(budget.amount),
      notes: budget.notes || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.reallyDelete)) return;

    try {
      const res = await fetch(`http://localhost:3000/budgets/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBudgets(prev => prev.filter(b => (b._id || b.id) !== id));
      } else {
        alert("Failed to delete budget");
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Error deleting budget");
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setSendData({ category: '', amount: 0, notes: '' });
  };

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
                  <div key={budget._id || budget.id} className="space-y-2 group relative">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-200">
                        {getCategoryName(budget.category)}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">
                          {spent.toLocaleString()} / {budgetAmount.toLocaleString()} Kč
                        </span>

                        <button
                          onClick={() => handleEditClick(budget)}
                          className="text-blue-400 hover:text-blue-300 opacity-60 group-hover:opacity-100 transition-opacity"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDelete(budget._id || budget.id)}
                          className="text-red-400 hover:text-red-300 opacity-60 group-hover:opacity-100 transition-opacity"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
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

        {/* RIGHT – Add / Edit budget */}
        <section className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">
            {isEditing ? t.editBudget : t.addBudget}
          </h2>

          <form className="space-y-4" onSubmit={saveBudget}>
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
                value={sendData.amount || ''}
                onChange={(e) =>
                  setSendData((prev) => ({ ...prev, amount: Number(e.target.value) }))
                }
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                placeholder="např. 5000"
              />
            </div>

            {/* Hidden – we always use current month/year */}
            <input type="hidden" name="month" value={currentMonth} />
            <input type="hidden" name="year" value={currentYear} />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
            >
              {isEditing ? t.saveChanges : t.addButton}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded mt-2 cursor-pointer"
              >
                {t.cancel}
              </button>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}