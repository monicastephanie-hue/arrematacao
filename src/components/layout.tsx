import { Outlet } from 'react-router-dom'
import { MobileNav, Sidebar } from '@/components/sidebar'
import { StorageErrorBanner } from '@/components/storage-error-banner'

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
          <StorageErrorBanner />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
