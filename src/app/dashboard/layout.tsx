import { ReactNode } from "react"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import { LayoutDashboard, Users, UserCircle, LogOut, PhoneCall } from "lucide-react"

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
    <div className="flex h-screen w-full bg-zinc-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900/50 border-r border-white/10 flex flex-col p-4">
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
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
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

        <div className="p-8 pb-24 z-0">
          {children}
        </div>
      </main>
    </div>
  )
}
