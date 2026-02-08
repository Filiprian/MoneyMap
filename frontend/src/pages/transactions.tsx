import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"; 

interface TransactionsProps {
  language: 'CZ' | 'EN';
}

const translations = {
  CZ: {
    transactionsTitle: "Transakce",
    transactionsSubtitle: "Zde můžete prohlížet a přidávat své transakce",
    allTransactions: "Všechny transakce:",
    addTransaction: "Přidat transakci",
    type: "Typ:",
    income: "Příjem",
    expense: "Výdaj",
    amount: "Částka (Kč):",
    category: "Kategorie:",
    notes: "Poznámky:",
    date: "Datum:",
    addButton: "Přidat transakci",
    noTransactions: "Zatím žádné transakce...",
    requiredFields: "Vyplňte prosím všechna povinná pole.",
    // Categories (display names)
    cat_food: "Jídlo",
    cat_housing: "Bydlení",
    cat_transportation: "Doprava",
    cat_entertainment: "Zábava",
    cat_health: "Zdraví",
    cat_other: "Ostatní",
    cat_job: "Práce",
    cat_investment: "Investice",
    cat_gift: "Dar",
    really_delete: "Opravdu smazat?"
  },
  EN: {
    transactionsTitle: "Transactions",
    transactionsSubtitle: "Here you can view and add your transactions",
    allTransactions: "All transactions:",
    addTransaction: "Add transaction",
    type: "Type:",
    income: "Income",
    expense: "Expense",
    amount: "Amount (CZK):",
    category: "Category:",
    notes: "Notes:",
    date: "Date:",
    addButton: "Add Transaction",
    noTransactions: "No transactions yet...",
    requiredFields: "Please fill in all required fields.",
    // Categories (display names)
    cat_food: "Food",
    cat_housing: "Housing",
    cat_transportation: "Transportation",
    cat_entertainment: "Entertainment",
    cat_health: "Health",
    cat_other: "Other",
    cat_job: "Job",
    cat_investment: "Investment",
    cat_gift: "Gift",
    really_delete: "Really delete?"
  },
};

export default function Transactions({ language }: TransactionsProps) {
  const [isIncome, setIsIncome] = useState(true);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [sendData, setSendData] = useState({
    amount: 0,
    category: '',
    notes: '',
    day: 0,
    month: 0,
    year: 0,
  });

  // New states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const t = translations[language];

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

  // Delete transaction
  const handleDelete = async (id: string) => {
    if (!window.confirm(t.really_delete)) return;

    try {
      const res = await fetch(`http://localhost:3000/transactions/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAllTransactions(prev => prev.filter(tx => tx._id !== id));
      } else {
        alert("Failed to delete transaction");
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Error deleting transaction");
    }
  };

  // Edit transaction
  const handleEditClick = (tx: any) => {
    const isInc = tx.amount > 0;
    setIsIncome(isInc);
    setEditingId(tx._id);    
    setIsEditing(true);

    const absAmount = Math.abs(tx.amount);

    setSendData({
      amount: absAmount,
      category: tx.category,
      notes: tx.notes || '',
      day: tx.day,
      month: tx.month,
      year: tx.year,
    });
  };

  async function saveTransaction(e: React.FormEvent) {
    e.preventDefault();

    if (!sendData.amount || !sendData.category || !sendData.day || !sendData.month || !sendData.year) {
      alert(t.requiredFields);
      return;
    }

    const amountToSend = isIncome ? sendData.amount : -sendData.amount;
    const bodyToSend = { ...sendData, amount: amountToSend };

    const url = isEditing
      ? `http://localhost:3000/transactions/${editingId}`
      : 'http://localhost:3000/transactions';

    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend),
      });

      if (res.ok) {
        // Refresh list
        const fresh = await fetch('http://localhost:3000/transactions').then(r => r.json());
        setAllTransactions(fresh || []);

        // Reset form
        setSendData({ amount: 0, category: '', notes: '', day: 0, month: 0, year: 0 });
        setIsEditing(false);
        setEditingId(null);
      } else {
        alert(isEditing ? "Update failed" : "Add failed");
      }
    } catch (err) {
      console.error("Save failed", err);
      alert("Error saving transaction");
    }
  }

  return (
    <div>
      <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
        {t.transactionsTitle}
      </h1>
      <p className="text-xl text-gray-400 mb-10">{t.transactionsSubtitle}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">{t.allTransactions}</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto"> {/* optional: scrollable */}
            {allTransactions.slice(-15).map((tx: any) => (   // increased limit a bit
              <div
                key={tx._id}
                className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0 group"
              >
                <span className={`text-xl font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{Number(tx.amount).toLocaleString()} Kč
                </span>

                <span className="text-gray-300">
                  {t[`cat_${tx.category.toLowerCase()}`] || tx.category}
                </span>

                <div className="flex items-center gap-3">
                  <span className="text-gray-500">
                    {tx.day}.{tx.month}.{tx.year}
                  </span>

                  <button
                    onClick={() => handleEditClick(tx)}
                    className="text-blue-400 hover:text-blue-300 opacity-70 group-hover:opacity-100 transition-opacity"
                    title="Edit"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(tx._id)}
                    className="text-red-400 hover:text-red-300 opacity-70 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {allTransactions.length === 0 && (
              <p className="text-gray-500 text-center py-8">{t.noTransactions}</p>
            )}
          </div>
        </section>

        <section className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">
            {isEditing ? (language === 'CZ' ? "Upravit transakci" : "Edit Transaction") : t.addTransaction}
          </h2>

          <form className="space-y-4" onSubmit={saveTransaction}>
            {/* Type toggle */}
            <label className="block text-gray-300 mb-2">{t.type}</label>
            <div className="flex">
              <button
                type="button"
                onClick={() => setIsIncome(true)}
                className={`cursor-pointer w-full p-2 rounded-l ${
                  isIncome ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-100'
                }`}
              >
                {t.income}
              </button>
              <button
                type="button"
                onClick={() => setIsIncome(false)}
                className={`cursor-pointer w-full p-2 rounded-r ${
                  !isIncome ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-100'
                }`}
              >
                {t.expense}
              </button>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t.amount}</label>
              <input
                type="number"
                value={sendData.amount || ''}
                onChange={(e) => setSendData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t.category}</label>
              {isIncome ? (
                <select
                  value={sendData.category}
                  onChange={(e) => setSendData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                >
                  <option value="job">{t.cat_job}</option>
                  <option value="investment">{t.cat_investment}</option>
                  <option value="gift">{t.cat_gift}</option>
                  <option value="other">{t.cat_other}</option>
                </select>
              ) : (
                <select
                  value={sendData.category}
                  onChange={(e) => setSendData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                >
                  <option value="food">{t.cat_food}</option>
                  <option value="housing">{t.cat_housing}</option>
                  <option value="transportation">{t.cat_transportation}</option>
                  <option value="entertainment">{t.cat_entertainment}</option>
                  <option value="health">{t.cat_health}</option>
                  <option value="other">{t.cat_other}</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t.notes}</label>
              <input
                type="text"
                value={sendData.notes}
                onChange={(e) => setSendData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t.date}</label>
              <input
                type="date"
                value={
                  sendData.year && sendData.month && sendData.day
                    ? `${sendData.year}-${String(sendData.month).padStart(2, '0')}-${String(sendData.day).padStart(2, '0')}`
                    : ''
                }
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [y, m, d] = e.target.value.split('-').map(Number);
                  setSendData(prev => ({ ...prev, year: y, month: m, day: d }));
                }}
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {isEditing
                ? (language === 'CZ' ? "Uložit změny" : "Save Changes")
                : t.addButton}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingId(null);
                  setSendData({ amount: 0, category: '', notes: '', day: 0, month: 0, year: 0 });
                }}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded mt-2"
              >
                {language === 'CZ' ? "Zrušit" : "Cancel"}
              </button>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}