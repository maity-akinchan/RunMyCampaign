import { ReactNode } from "react"
import Link from "next/link"
import { auth } from "@/auth"
import { logoutAction } from "@/app/actions/auth"
import { LayoutDashboard, Users, UserCircle, LogOut, PhoneCall, BarChart3 } from "lucide-react"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <p>Please log in to view this page.</p>
        <Link href="/login" className="ml-4 text-blue-400 hover:underline">Go to Login</Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-white overflow-hidden relative">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 bg-zinc-900/50 border-r border-white/10 flex-col p-4 shrink-0 z-20">
        <div className="flex items-center gap-3 px-2 py-4 mb-6 text-white text-xl font-bold tracking-tight">
          <PhoneCall className="w-6 h-6 text-blue-500" />
          RunMyCampaign
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-zinc-300 hover:text-white">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            <span>Dashboard</span>
          </Link>
          
          <Link href="/dashboard/campaigns/new" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-zinc-300 hover:text-white">
            <Users className="w-5 h-5 text-purple-400" />
            <span>New Campaign</span>
          </Link>

          {session.user.role === "ADMIN" && (
            <Link href="/dashboard/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-zinc-300 hover:text-white">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <span>Global Analytics</span>
            </Link>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="mt-auto border-t border-white/10 pt-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-4 py-3">
            <UserCircle className="w-8 h-8 text-zinc-400" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{session.user.name || "User"}</span>
              <span className="text-xs text-zinc-500 capitalize">{session.user.role?.toLowerCase() || "User"}</span>
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Top Gradient Glow inside Main */}
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>

        <header className="h-16 border-b border-white/5 flex items-center px-8 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10 w-full">
          <h2 className="text-sm font-medium text-zinc-400">Campaign Manager</h2>
        </header>

        <div className="p-4 md:p-8 pb-24 z-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-zinc-950/95 border-t border-white/10 backdrop-blur-xl z-50 flex items-center justify-around p-3 pb-6">
        <Link href="/dashboard" className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
          <LayoutDashboard className="w-6 h-6 text-blue-400" />
          <span className="text-[11px] font-semibold">Dashboard</span>
        </Link>
        
        {session.user.role === "ADMIN" && (
          <>
            <Link href="/dashboard/analytics" className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
              <BarChart3 className="w-6 h-6 text-green-400" />
              <span className="text-[11px] font-semibold">Analytics</span>
            </Link>
            <Link href="/dashboard/campaigns/new" className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
              <Users className="w-6 h-6 text-purple-400" />
              <span className="text-[11px] font-semibold">Campaign</span>
            </Link>
          </>
        )}

        <form action={logoutAction} className="flex flex-col items-center">
          <button type="submit" className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-red-400 transition-colors">
            <LogOut className="w-6 h-6" />
            <span className="text-[11px] font-semibold">Logout</span>
          </button>
        </form>
      </nav>
    </div>
  )
}
