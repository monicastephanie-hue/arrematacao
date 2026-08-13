import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout'
import Dashboard from '@/pages/dashboard'
import PropertyDetail from '@/pages/property-detail'
import PropertyForm from '@/pages/property-form'
import Cotistas from '@/pages/cotistas'
import Reports from '@/pages/reports'
import Calculator from '@/pages/calculator'

// HashRouter keeps navigation working on any static host (including a
// single-file deploy) without needing server-side rewrite rules.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/imoveis" replace />} />
          <Route path="imoveis" element={<Dashboard />} />
          <Route path="imoveis/novo" element={<PropertyForm />} />
          <Route path="imoveis/:id" element={<PropertyDetail />} />
          <Route path="imoveis/:id/editar" element={<PropertyForm />} />
          <Route path="cotistas" element={<Cotistas />} />
          <Route path="relatorios" element={<Reports />} />
          <Route path="calculadora" element={<Calculator />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
