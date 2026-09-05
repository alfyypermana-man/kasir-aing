import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tags, Boxes, Percent, Receipt,
  BarChart3, Users, Settings, ShoppingCart, User, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useState } from 'react'
import { useStoreSettings } from '../../hooks/useStoreSettings.js'

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/pos', label: 'POS', icon: ShoppingCart },
  { to: '/admin/products', label: 'Produk', icon: Package },
  { to: '/admin/categories', label: 'Kategori', icon: Tags },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/discounts', label: 'Diskon', icon: Percent },
  { to: '/admin/transactions', label: 'Transaksi', icon: Receipt },
  { to: '/admin/reports', label: 'Laporan', icon: BarChart3 },
  { to: '/admin/users', label: 'User / Kasir', icon: Users },
  { to: '/admin/settings', label: 'Pengaturan Toko', icon: Settings },
  { to: '/admin/profile', label: 'Profil', icon: User },
]

const cashierLinks = [
  { to: '/cashier/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cashier/pos', label: 'POS / Jual Barang', icon: ShoppingCart },
  { to: '/cashier/transactions', label: 'Transaksi Saya', icon: Receipt },
  { to: '/cashier/profile', label: 'Profil', icon: User },
]

export default function Sidebar({ variant }) {
  const { signOut, profile } = useAuth()
  const { settings } = useStoreSettings()
  const [collapsed, setCollapsed] = useState(false)
  const links = variant === 'admin' ? adminLinks : cashierLinks

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-gray-200 bg-white transition-all dark:border-gray-800 dark:bg-gray-900 lg:flex ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              {settings?.store_name?.[0]?.toUpperCase() ?? 'P'}
            </div>
            <span className="truncate font-semibold text-gray-900 dark:text-white">
              {settings?.store_name ?? 'SuperHolic Cashier'}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-3 dark:border-gray-800">
        {!collapsed && (
          <p className="mb-2 truncate px-1 text-xs text-gray-400">
            {profile?.name} · {profile?.role}
          </p>
        )}
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
