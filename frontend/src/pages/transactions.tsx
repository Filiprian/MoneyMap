import { useEffect, useState } from "react";

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

  async function addTransaction(data: typeof sendData) {
    if (!data.amount || !data.category || !data.day || !data.month || !data.year) {
      alert(t.requiredFields);
      return;
    }

    const amountToSend = isIncome ? data.amount : -data.amount;
    const bodyToSend = { ...data, amount: amountToSend };

    try {
      const res = await fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend),
      });

      if (res.ok) {
        console.log('Transaction added successfully');
        setSendData({
          amount: 0,
          category: '',
          notes: '',
          day: 0,
          month: 0,
          year: 0,
        });
      }
    } catch (err) {
      console.error('Failed to add transaction', err);
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
                  {t[`cat_${tx.category.toLowerCase()}`] || tx.category}
                </span>
                <span className="text-gray-500">
                  {tx.day}.{tx.month} {tx.year}
                </span>
              </div>
            ))}

            {allTransactions.length === 0 && (
              <p className="text-gray-500 text-center py-8">{t.noTransactions}</p>
            )}
          </div>
        </section>

        <section className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">{t.addTransaction}</h2>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              addTransaction(sendData);
            }}
          >
            <label className="block text-gray-300 mb-2">{t.type}</label>
            <div className="flex">
              <button
                type="button"
                onClick={() => setIsIncome(true)}
                className={`cursor-pointer w-full p-2 rounded-l ${
                  isIncome
                    ? 'bg-green-500 text-white border border-gray-600'
                    : 'bg-gray-700 text-gray-100 border border-gray-600'
                }`}
              >
                {t.income}
              </button>
              <button
                type="button"
                onClick={() => setIsIncome(false)}
                className={`cursor-pointer w-full p-2 rounded-r ${
                  !isIncome
                    ? 'bg-red-500 text-white border border-gray-600'
                    : 'bg-gray-700 text-gray-100 border border-gray-600'
                }`}
              >
                {t.expense}
              </button>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t.amount}</label>
              <input
                type="number"
                value={sendData.amount}
                onChange={(e) =>
                  setSendData((prev) => ({ ...prev, amount: Number(e.target.value) }))
                }
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t.category}</label>
              {isIncome ? (
                <select
                  className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                  value={sendData.category}
                  onChange={(e) =>
                    setSendData((prev) => ({ ...prev, category: e.target.value }))
                  }
                >
                  <option value="job">Job</option>
                  <option value="investment">Investment</option>
                  <option value="gift">Gift</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <select
                  className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                  value={sendData.category}
                  onChange={(e) =>
                    setSendData((prev) => ({ ...prev, category: e.target.value }))
                  }
                >
                  <option value="food">Food</option>
                  <option value="housing">Housing</option>
                  <option value="transportation">Transportation</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="health">Health</option>
                  <option value="other">Other</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t.notes}</label>
              <input
                type="text"
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                value={sendData.notes}
                onChange={(e) =>
                  setSendData((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">{t.date}</label>
              <input
                type="date"
                className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                value={`${sendData.year}-${String(sendData.month).padStart(2, '0')}-${String(
                  sendData.day
                ).padStart(2, '0')}`}
                onChange={(e) => {
                  const [year, month, day] = e.target.value.split('-').map(Number);
                  setSendData((prev) => ({ ...prev, day, month, year }));
                }}
              />
            </div>

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