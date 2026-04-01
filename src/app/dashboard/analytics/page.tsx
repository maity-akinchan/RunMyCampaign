import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { BarChart3, Users, PhoneCall, Target, UserCircle2 } from "lucide-react"

export default async function GlobalAnalyticsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return redirect("/dashboard")

  const [campaignsCount, contactsCount, callsCount, outcomes, topCallers] = await Promise.all([
    prisma.campaign.count(),
    prisma.contact.count(),
    prisma.callRecord.count(),
    prisma.callRecord.groupBy({
      by: ['outcome'],
      _count: { outcome: true }
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { callRecords: true }
        }
      },
      orderBy: {
        callRecords: { _count: 'desc' }
      },
      take: 5
    })
  ])

  // Process Outcome Arrays
  const outcomeMap = {
    "Completed": outcomes.find((o: any) => o.outcome === "Completed")?._count.outcome || 0,
    "No Answer": outcomes.find((o: any) => o.outcome === "No Answer")?._count.outcome || 0,
    "Dropped Out": outcomes.find((o: any) => o.outcome === "Dropped Out")?._count.outcome || 0,
  }

  const successRate = callsCount > 0 ? Math.round((outcomeMap["Completed"] / callsCount) * 100) : 0

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-8 h-8 text-green-400" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Global Analytics</h1>
          <p className="text-zinc-400">Aggregated tracking data across all CRM campaigns.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-purple-400 font-semibold mb-2">
            <Target className="w-5 h-5" /> Total Campaigns
          </div>
          <span className="text-5xl font-bold text-white tracking-tight">{campaignsCount}</span>
        </div>
        <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
            <Users className="w-5 h-5" /> Total Constituents
          </div>
          <span className="text-5xl font-bold text-white tracking-tight">{contactsCount}</span>
        </div>
        <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
            <PhoneCall className="w-5 h-5" /> Total Calls Logged
          </div>
          <span className="text-5xl font-bold text-white tracking-tight">{callsCount}</span>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 p-6 rounded-3xl flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center gap-2 text-green-300 font-semibold mb-2 z-10">
            <BarChart3 className="w-5 h-5" /> Success Rate
          </div>
          <span className="text-5xl font-bold text-white tracking-tight z-10">{successRate}%</span>
          <div className="absolute -right-4 -bottom-4 opacity-10 blur-xl">
            <Target className="w-32 h-32" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        
        {/* Call Outcomes Distribution */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-white">Execution Outcomes</h2>
          
          <div className="flex flex-col gap-5 mt-2">
            {/* Completed */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-white">Completed</span>
                <span className="text-zinc-400">{outcomeMap["Completed"]} calls</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all" 
                  style={{ width: `${callsCount > 0 ? (outcomeMap["Completed"] / callsCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* No Answer */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-white">No Answer</span>
                <span className="text-zinc-400">{outcomeMap["No Answer"]} calls</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full transition-all" 
                  style={{ width: `${callsCount > 0 ? (outcomeMap["No Answer"] / callsCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Dropped */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-white">Dropped Out</span>
                <span className="text-zinc-400">{outcomeMap["Dropped Out"]} calls</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-3">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all" 
                  style={{ width: `${callsCount > 0 ? (outcomeMap["Dropped Out"] / callsCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Caller Leaderboard */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-white flex items-center justify-between">
            Top Callers
            <span className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-medium">Global</span>
          </h2>
          
          <div className="flex flex-col gap-3">
            {topCallers.length === 0 ? (
              <div className="text-center text-zinc-500 py-6">No caller data found.</div>
            ) : (
              topCallers.map((caller: any, idx: number) => (
                <div key={caller.id} className="flex items-center justify-between p-4 bg-black/30 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : idx === 1 ? 'bg-zinc-300/20 text-zinc-300' : idx === 2 ? 'bg-orange-600/20 text-orange-400' : 'bg-white/5 text-zinc-500'}`}>
                      #{idx + 1}
                    </div>
                    <span className="font-medium text-white">{caller.name}</span>
                  </div>
                  <div className="text-sm font-semibold text-blue-400 flex items-center gap-1.5 bg-blue-500/10 px-3 py-1 rounded-full">
                    <PhoneCall className="w-3.5 h-3.5" />
                    {caller._count.callRecords}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
