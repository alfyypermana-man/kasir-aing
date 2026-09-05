import { NavLink } from 'react-router-dom'
import { X, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function MobileMenu({ open, onClose, links, title }) {
  const { signOut } = useAuth()

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <div
        className={`fixed right-0 top-0 z-50 h-full w-72 max-w-[85vw] transform bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-900 lg:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 dark:text-red-400"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </div>
    </>
  )
}
