import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar.jsx'
import TopNavbar from '../components/layout/TopNavbar.jsx'
import MobileBottomNav from '../components/layout/MobileBottomNav.jsx'
import MobileMenu from '../components/layout/MobileMenu.jsx'
import { useStoreSettings } from '../hooks/useStoreSettings.js'
import { Home, ShoppingCart, Receipt, User } from 'lucide-react'

const titles = {
  '/cashier/dashboard': 'Dashboard',
  '/cashier/pos': 'POS / Jual Barang',
  '/cashier/transactions': 'Transaksi Saya',
  '/cashier/profile': 'Profil',
}

const links = [
  { to: '/cashier/dashboard', label: 'Dashboard', icon: Home },
  { to: '/cashier/pos', label: 'POS / Jual Barang', icon: ShoppingCart },
  { to: '/cashier/transactions', label: 'Transaksi Saya', icon: Receipt },
  { to: '/cashier/profile', label: 'Profil', icon: User },
]

export default function CashierLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { settings } = useStoreSettings()
  const title = titles[location.pathname] ?? 'Kasir'

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar variant="cashier" />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopNavbar title={title} storeName={settings?.store_name} onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 p-4 pb-24 lg:p-6 lg:pb-6">
          <Outlet />
        </main>
        <MobileBottomNav variant="cashier" />
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={links} title="Menu" />
      </div>
    </div>
  )
}
