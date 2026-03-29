import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"
import { assignUsersAction } from "@/app/actions/assign"

export default async function AssignCallersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await auth()
  
  // Strict Authorization Trap 
  if (!session?.user || session.user.role !== "ADMIN") {
    return redirect("/dashboard")
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id }
  })
  
  if (!campaign) notFound()

  // Pull all system-registered Users/Callers for mapping selection.
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard`} className="p-2 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-500" />
            Assign Callers
          </h1>
          <p className="text-zinc-400 mt-2">Manage precise access allocation for the <strong>{campaign.name}</strong> campaign.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
        <form action={assignUsersAction} className="flex flex-col gap-6">
          <input type="hidden" name="campaignId" value={campaign.id} />

          <div className="space-y-4">
            {allUsers.length === 0 ? (
              <p className="text-zinc-400">No organizational callers found inside the system.</p>
            ) : (
              allUsers.map((u: any) => {
                const isAssigned = campaign.assigneeIds.includes(u.id)
                return (
                  <label key={u.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-black/40 hover:bg-zinc-800 transition-colors cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="assigneeIds" 
                      value={u.id} 
                      defaultChecked={isAssigned}
                      className="w-5 h-5 text-purple-500 rounded border-zinc-700 bg-zinc-900 focus:ring-purple-500 focus:ring-offset-zinc-900"
                    />
                    <div>
                      <span className="text-white font-medium flex items-center gap-2">
                        {u.name}
                        {u.role === "ADMIN" && (
                          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full font-bold">ADMIN</span>
                        )}
                      </span>
                      <span className="text-sm text-zinc-500">{u.email}</span>
                    </div>
                  </label>
                )
              })
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10 mt-2">
            <button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/25"
            >
              Save Caller Assignments
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
