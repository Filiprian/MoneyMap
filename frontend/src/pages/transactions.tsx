import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { db } from './../Db';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

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
    cat_food: "Jídlo",
    cat_housing: "Bydlení",
    cat_transportation: "Doprava",
    cat_entertainment: "Zábava",
    cat_health: "Zdraví",
    cat_other: "Ostatní",
    cat_job: "Práce",
    cat_investment: "Investice",
    cat_gift: "Dar",
    really_delete: "Opravdu smazat?",
    show_more: "Zobrazit více",
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
    cat_food: "Food",
    cat_housing: "Housing",
    cat_transportation: "Transportation",
    cat_entertainment: "Entertainment",
    cat_health: "Health",
    cat_other: "Other",
    cat_job: "Job",
    cat_investment: "Investment",
    cat_gift: "Gift",
    really_delete: "Really delete?",
    show_more: "Show more",
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);

  const t = translations[language];

  const getCategoryName = (cat: string) => {
    const key = `cat_${cat.toLowerCase()}`;
    return (t as any)[key] || cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  // ── Fetch all transactions ──────────────────────────────────────────────────
  async function fetchAllTransactions() {
    // [MongoDB] const res = await fetch('http://localhost:3000/transactions');
    // [MongoDB] const data = await res.json();
    const data = await db.transactions.toArray();
    setAllTransactions(data || []);
  }

  useEffect(() => {
    fetchAllTransactions().catch(err => console.error('Failed to fetch transactions', err));
  }, []);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm(t.really_delete)) return;

    try {
      // [MongoDB] const res = await fetch(`http://localhost:3000/transactions/${id}`, { method: 'DELETE' });
      // [MongoDB] if (res.ok) { setAllTransactions(prev => prev.filter(tx => tx._id !== id)); }
      await db.transactions.delete(id);
      setAllTransactions(prev => prev.filter(tx => tx._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Error deleting transaction");
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const handleEditClick = (tx: any) => {
    const isInc = tx.amount > 0;
    setIsIncome(isInc);
    setEditingId(tx._id);
    setIsEditing(true);

    setSendData({
      amount: Math.abs(tx.amount),
      category: tx.category,
      notes: tx.notes || '',
      day: tx.day,
      month: tx.month,
      year: tx.year,
    });
  };

  // ── Save (add or update) ────────────────────────────────────────────────────
  async function saveTransaction(e: React.FormEvent) {
    e.preventDefault();

    if (!sendData.amount || !sendData.category || !sendData.day || !sendData.month || !sendData.year) {
      alert(t.requiredFields);
      return;
    }

    const amountToSend = isIncome ? sendData.amount : -sendData.amount;
    const bodyToSend = { ...sendData, amount: amountToSend };

    try {
      if (isEditing && editingId) {
        // [MongoDB] await fetch(`http://localhost:3000/transactions/${editingId}`, { method: 'PUT', ... });
        await db.transactions.update(editingId, bodyToSend);
      } else {
        // [MongoDB] await fetch('http://localhost:3000/transactions', { method: 'POST', ... });
        const newId = generateId();
        await db.transactions.add({ ...bodyToSend, _id: newId });
      }

      await fetchAllTransactions();
      setSendData({ amount: 0, category: '', notes: '', day: 0, month: 0, year: 0 });
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      console.error("Save failed", err);
      alert("Error saving transaction");
    }
  }

  const sortedTransactions = [...allTransactions].sort((a, b) => {
    const dateA = new Date(a.year, a.month - 1, a.day);
    const dateB = new Date(b.year, b.month - 1, b.day);
    return dateB.getTime() - dateA.getTime();
  });

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 15);
  };

  return (
    <div>
      <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
        {t.transactionsTitle}
      </h1>
      <p className="text-xl text-gray-400 mb-10">{t.transactionsSubtitle}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">{t.allTransactions}</h2>
          <div className="space-y-4">
            {sortedTransactions.slice(0, visibleCount).map((tx: any) => (
              <div
                key={tx._id || tx.id}
                className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0 group hover:bg-gray-700/40 transition-colors"
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
                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditClick(tx)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Upravit"
                  >
                    <PencilIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleDelete(tx._id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Smazat"
                  >
                    <TrashIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}

            {allTransactions.length === 0 && (
              <p className="text-gray-500 text-center py-12">{t.noTransactions}</p>
            )}

            {visibleCount < sortedTransactions.length && (
              <button
                onClick={handleShowMore}
                className="w-full mt-8 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {t.show_more}
              </button>
            )}
          </div>
        </section>

        <section className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">
            {isEditing
              ? (language === 'CZ' ? "Upravit transakci" : "Edit Transaction")
              : t.addTransaction}
          </h2>

          <form className="space-y-5" onSubmit={saveTransaction}>
            <div>
              <label className="block text-gray-300 mb-2">{t.type}</label>
              <div className="flex rounded overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsIncome(true)}
                  className={`flex-1 py-3 font-medium transition-colors ${
                    isIncome
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {t.income}
                </button>
                <button
                  type="button"
                  onClick={() => setIsIncome(false)}
                  className={`flex-1 py-3 font-medium transition-colors ${
                    !isIncome
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {t.expense}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t.amount}</label>
              <input
                type="number"
                step="0.01"
                value={sendData.amount || ''}
                onChange={(e) => setSendData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className="w-full p-3 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t.category}</label>
              {isIncome ? (
                <select
                  value={sendData.category}
                  onChange={(e) => setSendData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">{language === 'CZ' ? "Vyberte kategorii" : "Select category"}</option>
                  <option value="job">{t.cat_job}</option>
                  <option value="investment">{t.cat_investment}</option>
                  <option value="gift">{t.cat_gift}</option>
                  <option value="other">{t.cat_other}</option>
                </select>
              ) : (
                <select
                  value={sendData.category}
                  onChange={(e) => setSendData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">{language === 'CZ' ? "Vyberte kategorii" : "Select category"}</option>
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
                className="w-full p-3 rounded bg-gray-700 text-gray-100 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition-colors mt-4 cursor-pointer"
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
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded transition-colors mt-2 cursor-pointer"
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