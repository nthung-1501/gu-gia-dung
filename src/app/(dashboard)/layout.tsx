import { Sidebar } from '@/components/nav/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 max-w-screen-xl">
        {children}
      </main>
    </div>
  )
}
