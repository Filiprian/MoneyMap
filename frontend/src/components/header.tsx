// header.tsx (example)
import { Bars3Icon } from '@heroicons/react/24/outline'

interface HeaderProps {
  language: 'CZ' | 'EN'
  setLanguage: (lang: 'CZ' | 'EN') => void
  onMenuToggle: () => void
}

export default function Header({ language, setLanguage, onMenuToggle }: HeaderProps) {
  return (
    <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between">
      {/* Hamburger - visible only on mobile */}
      <button
        className="lg:hidden text-gray-300 hover:text-white focus:outline-none"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <Bars3Icon className="h-8 w-8" />
      </button>

      {/* Title or other content */}
      <div className="text-xl font-semibold">
        {language === 'CZ' ? 'Finanční přehled' : 'Financial Overview'}
      </div>

      {/* Language switcher */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setLanguage('CZ')}
          className={`px-3 py-1 rounded ${language === 'CZ' ? 'bg-violet-700' : 'hover:bg-gray-700'}`}
        >
          CZ
        </button>
        <button
          onClick={() => setLanguage('EN')}
          className={`px-3 py-1 rounded ${language === 'EN' ? 'bg-violet-700' : 'hover:bg-gray-700'}`}
        >
          EN
        </button>
      </div>
    </header>
  )
}