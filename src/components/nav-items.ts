import type { ComponentType } from 'react'
import { Calculator, FileBarChart2, Home, KanbanSquare, ScrollText, Users } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Gestão',
    items: [
      { to: '/imoveis', label: 'Imóveis Arrematados', icon: Home },
      { to: '/gerenciamento', label: 'Gerenciamento', icon: KanbanSquare },
      { to: '/cotistas', label: 'Cotistas', icon: Users },
      { to: '/relatorios', label: 'Relatórios', icon: FileBarChart2 },
    ],
  },
  {
    label: 'Ferramentas',
    items: [
      { to: '/calculadora', label: 'Calculadora', icon: Calculator },
      { to: '/notificacoes', label: 'Notificações', icon: ScrollText },
    ],
  },
]
