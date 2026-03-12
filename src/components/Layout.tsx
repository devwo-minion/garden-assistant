import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
