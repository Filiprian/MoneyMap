interface HeaderProps {
  language: 'CZ' | 'EN';
  setLanguage: (lang: 'CZ' | 'EN') => void;
}

export default function Header({ language, setLanguage }: HeaderProps) {
  return (
    <header className="bg-gradient-to-red from-violet-950 to-fuchsia-950 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          MoneyMap
        </h1>

        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'CZ' | 'EN')}
            className="bg-violet-900/70 text-white border border-violet-600 rounded-lg px-4 py-2 
                     hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-500 
                     transition-all cursor-pointer shadow-sm"
          >
            <option value="CZ">CZ</option>
            <option value="EN">EN</option>
          </select>
        </div>
      </div>
    </header>
  );
}