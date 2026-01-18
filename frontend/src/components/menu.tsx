import { Link } from 'react-router-dom';

interface MenuProps {
  language: 'CZ' | 'EN';
}

const translations = {
  CZ: {
    menu: 'Menu',
    dashboard: 'Přeheled',
    transactions: 'Transakce',
    budgets: 'Rozpočty',
    graphs: 'Grafy',
    networth: 'Čisté jmění',
  },
  EN: {
    menu: 'Menu',
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    budgets: 'Budgets',
    graphs: 'Graphs',
    networth: 'Net Worth',
  },
};

export default function Menu({ language }: MenuProps) {
  const t = translations[language];

  return (
    <aside className="bg-gradient-to-black from-violet-950 to-indigo-950 text-white w-64 min-h-screen shadow-2xl">
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-10 tracking-wide">{t.menu}</h2>
        
        <nav className="space-y-2">
          <Link
            to="/"
            className="block px-5 py-4 text-lg rounded-lg hover:bg-violet-800/50 
                     transition-colors duration-200 font-medium"
          >
            {t.dashboard}
          </Link>
          <Link
            to="/transactions"
            className="block px-5 py-4 text-lg rounded-lg hover:bg-violet-800/50 
                     transition-colors duration-200 font-medium"
          >
            {t.transactions}
          </Link>
          <Link
            to="/budgets"
            className="block px-5 py-4 text-lg rounded-lg hover:bg-violet-800/50 
                     transition-colors duration-200 font-medium"
          >
            {t.budgets}
          </Link>
          <Link
            to="/graphs"
            className="block px-5 py-4 text-lg rounded-lg hover:bg-violet-800/50 
                     transition-colors duration-200 font-medium"
          >
            {t.graphs}
          </Link>
          <Link
            to="/networth"
            className="block px-5 py-4 text-lg rounded-lg hover:bg-violet-800/50 
                     transition-colors duration-200 font-medium"
          >
            {t.networth}
          </Link>
        </nav>
      </div>
    </aside>
  );
}