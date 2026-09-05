import { Routes, Route, Navigate } from 'react-router-dom'
import POS from './pages/cashier/POS.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<POS />} />
      <Route path="/pos" element={<POS />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
