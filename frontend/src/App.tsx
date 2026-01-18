import { Route, Router, Routes } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/dashboard'
import Transactions from './pages/transactions'
import Budgets from './pages/budgets'
import Menu from './components/menu'
import Header from './components/header'
import { useState } from 'react'

export default function App() {
  const [language, setLanguage] = useState<'CZ' | 'EN'>('CZ');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      <Menu language={language} />
      
      <div className="flex-1 flex flex-col">
        <Header language={language} setLanguage={setLanguage} />
        
        <main className="flex-1 p-6 md:p-10 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard language={language} />} />
            {/* Other routes coming soon */}
          </Routes>
        </main>
      </div>
    </div>
  );
}
