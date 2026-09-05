import { NavLink } from 'react-router-dom'
import { Home, ShoppingCart, Receipt, User, Package, Menu } from 'lucide-react'

const cashierTabs = [
  { to: '/cashier/dashboard', label: 'Home', icon: Home },
  { to: '/cashier/pos', label: 'POS', icon: ShoppingCart },
  { to: '/cashier/transactions', label: 'Transaksi', icon: Receipt },
  { to: '/cashier/profile', label: 'Profil', icon: User },
]

const adminTabs = [
  { to: '/admin/dashboard', label: 'Home', icon: Home },
  { to: '/admin/products', label: 'Produk', icon: Package },
  { to: '/admin/pos', label: 'POS', icon: ShoppingCart },
  { to: '/admin/transactions', label: 'Transaksi', icon: Receipt },
]

export default function MobileBottomNav({ variant, onMoreClick }) {
  const tabs = variant === 'admin' ? adminTabs : cashierTabs

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-gray-800 dark:bg-gray-900 lg:hidden">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
              isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
      {variant === 'admin' && (
        <button
          onClick={onMoreClick}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-gray-400"
        >
          <Menu size={20} />
          Menu
        </button>
      )}
    </nav>
  )
}
