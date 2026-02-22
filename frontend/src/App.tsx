import { Route, Routes } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/dashboard'
import Budgets from './pages/budgets'
import Menu from './components/menu'
import Header from './components/header'
import { useState } from 'react'
import Transactions from './pages/transactions'
import Graphs from './pages/graphs'

export default function App() {
  const [language, setLanguage] = useState<'CZ' | 'EN'>('CZ')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      {/* Mobile sidebar - overlay */}
      <div
        className={`
          fixed inset-0 z-40 transition-opacity duration-300 lg:hidden
          ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar content */}
        <div
          className={`
            absolute top-0 left-0 h-full w-72 bg-gradient-to-b from-violet-950 to-indigo-950
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <Menu language={language} isMobile onClose={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar - always visible on lg+ */}
      <div className="hidden lg:block">
        <Menu language={language} />
      </div>

      <div className="flex-1 flex flex-col">
        <Header
          language={language}
          setLanguage={setLanguage}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard language={language} />} />
            <Route path="/transactions" element={<Transactions language={language} />} />
            <Route path="/budgets" element={<Budgets language={language} />} />
            <Route path="/graphs" element={<Graphs language={language} />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}