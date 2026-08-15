import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { RequireAuth } from '@/components/require-auth'
import Landing from '@/pages/landing'
import ResetPassword from '@/pages/reset-password'
import Dashboard from '@/pages/dashboard'
import PropertyDetail from '@/pages/property-detail'
import PropertyForm from '@/pages/property-form'
import Cotistas from '@/pages/cotistas'
import Reports from '@/pages/reports'
import Calculator from '@/pages/calculator'
import Kanban from '@/pages/kanban'
import Notification from '@/pages/notification'

// HashRouter keeps navigation working on any static host (including a
// single-file deploy) without needing server-side rewrite rules.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route index element={<Landing />} />
        <Route path="redefinir-senha" element={<ResetPassword />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="imoveis" element={<Dashboard />} />
          <Route path="imoveis/novo" element={<PropertyForm />} />
          <Route path="imoveis/:id" element={<PropertyDetail />} />
          <Route path="imoveis/:id/editar" element={<PropertyForm />} />
          <Route path="gerenciamento" element={<Kanban />} />
          <Route path="cotistas" element={<Cotistas />} />
          <Route path="relatorios" element={<Reports />} />
          <Route path="calculadora" element={<Calculator />} />
          <Route path="notificacoes" element={<Notification />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
