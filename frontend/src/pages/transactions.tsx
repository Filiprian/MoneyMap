import { useEffect, useState } from "react";

interface TransactionsProps {
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


export default function Transactions({language}: TransactionsProps) {

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

  async function addTransaction(sendData: any) {
    if (!sendData.amount || !sendData.category || !sendData.day || !sendData.month || !sendData.year) {
      alert('Please fill in all required fields.');
      return;
    }
    const amountToSend = isIncome ? sendData.amount : -sendData.amount;

    const bodyToSend = { ...sendData, amount: amountToSend };
    try {
      const res = await fetch('http://localhost:3000/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyToSend)
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
    }
    catch (err) {
      console.error('Failed to add transaction');
  }
}
      

  return (
    <div>
      <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">Transactions</h1>
      <p className="text-xl text-gray-400 mb-10">Here you can oversee and add your transactions</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-gray-800/60 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">All transactions:</h2>
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
          <h2 className="text-2xl font-bold mb-6">Add transaction</h2>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            addTransaction(sendData);
          }}>
            <label className="block text-gray-300 mb-2">Type:</label>
            <div className="flex">
              <button type="button" onClick={() => setIsIncome(true)} className={`cursor-pointer w-full p-2 rounded-l ${isIncome ? 'bg-green-500 text-white border border-gray-600' : 'bg-gray-700 text-gray-100 border border-gray-600'}`}>
                Income
              </button>
              <button type="button" onClick={() => setIsIncome(false)} className={`cursor-pointer w-full p-2 rounded-r ${!isIncome ? 'bg-red-500 text-white border border-gray-600' : 'bg-gray-700 text-gray-100 border border-gray-600'}`}>
                Expense
              </button>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Amount (Kč):</label>
              <input type="number" value={sendData.amount} onChange={(e)=> setSendData(prev => ({...prev, amount: Number(e.target.value)}))} className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600" />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Category:</label>
              {isIncome ? (
                <select className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600" 
                value={sendData.category} 
                onChange={(e)=> setSendData(prev => ({...prev, category: e.target.value}))}>
                  <option value="job">Job</option>
                  <option value="investment">Investment</option>
                  <option value="gift">Gift</option>
                  <option value="other">Other</option>
              </select>
              ) : (
                <select className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600"
                value={sendData.category} 
                onChange={(e)=> setSendData(prev => ({...prev, category: e.target.value}))}>
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
              <label className="block text-gray-300 mb-2">Notes:</label>
              <input type="text" className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600" value={sendData.notes} onChange={(e)=> setSendData(prev => ({...prev, notes: e.target.value}))} />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Date:</label>
              <input type="date" className="w-full p-2 rounded bg-gray-700 text-gray-100 border border-gray-600" 
              value={`${sendData.year}-${String(sendData.month).padStart(2,'0')}-${String(sendData.day).padStart(2,'0')}`}
              onChange={(e) => {
                const [year, month, day] = e.target.value.split('-').map(Number);
                setSendData(prev => ({ ...prev, day, month, year }));
              }}/>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Add Transaction
            </button>
          </form>
        </section>
      </div>
    </div>
    )
}