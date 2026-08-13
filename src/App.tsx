import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout'
import Dashboard from '@/pages/dashboard'
import PropertyDetail from '@/pages/property-detail'
import PropertyForm from '@/pages/property-form'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="imoveis/novo" element={<PropertyForm />} />
          <Route path="imoveis/:id" element={<PropertyDetail />} />
          <Route path="imoveis/:id/editar" element={<PropertyForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
