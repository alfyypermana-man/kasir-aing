import { Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext.jsx'

export default function TopNavbar({ title, onMenuClick, storeName }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 lg:px-6">
      <div className="min-w-0">
        <p className="truncate text-xs text-gray-400 lg:hidden">{storeName}</p>
        <h1 className="truncate text-base font-semibold text-gray-900 dark:text-white lg:text-lg">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  )
}
