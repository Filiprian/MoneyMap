import { Link } from 'react-router-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface MenuProps {
  language: 'CZ' | 'EN'
  isMobile?: boolean
  onClose?: () => void
}

const translations = {
  CZ: {
    menu: 'Menu',
    dashboard: 'Přehled',
    transactions: 'Transakce',
    budgets: 'Rozpočty',
    graphs: 'Grafy',
  },
  EN: {
    menu: 'Menu',
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    budgets: 'Budgets',
    graphs: 'Graphs',
  },
}

export default function Menu({ language, isMobile = false, onClose }: MenuProps) {
  const t = translations[language]

  return (
    <aside className="h-full flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-wide">{t.menu}</h2>

        {isMobile && (
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white focus:outline-none"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <Link
          to="/"
          onClick={isMobile ? onClose : undefined}
          className="flex items-center px-4 py-3 text-lg rounded-lg hover:bg-violet-800/40 transition-colors"
        >
          {t.dashboard}
        </Link>
        <Link
          to="/transactions"
          onClick={isMobile ? onClose : undefined}
          className="flex items-center px-4 py-3 text-lg rounded-lg hover:bg-violet-800/40 transition-colors"
        >
          {t.transactions}
        </Link>
        <Link
          to="/budgets"
          onClick={isMobile ? onClose : undefined}
          className="flex items-center px-4 py-3 text-lg rounded-lg hover:bg-violet-800/40 transition-colors"
        >
          {t.budgets}
        </Link>
        <Link
          to="/graphs"
          onClick={isMobile ? onClose : undefined}
          className="flex items-center px-4 py-3 text-lg rounded-lg hover:bg-violet-800/40 transition-colors"
        >
          {t.graphs}
        </Link>
      </nav>
    </aside>
  )
}