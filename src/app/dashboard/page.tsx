import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { PhoneCall, CheckCircle2, Clock, MapPin, Users, Shield, Settings, FileSpreadsheet } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) return null

  // Fetch campaigns based on RBAC visibility. Admins see all, Callers see assigned mapping.
  const campaigns = await prisma.campaign.findMany({
    where: session.user.role === "ADMIN" ? {} : { assigneeIds: { has: session.user.id } },
    include: {
      _count: {
        select: { contacts: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Your Campaigns</h1>
          <p className="text-zinc-400 mt-2">Manage and execute your calling sequences to your audience.</p>
        </div>
        
        {/* Only admins or specific roles can possibly create campaigns depending on our RBAC choice. 
            For now, check if user is ADMIN to show the "Create New" button, though UI restriction is a bonus. */}
        {session.user.role === "ADMIN" && (
          <Link 
            href="/dashboard/campaigns/new" 
            className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-zinc-200 transition-colors rounded-xl font-medium shadow-lg"
          >
            <Users className="w-5 h-5" />
            Create Campaign
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
            <Users className="w-12 h-12 text-zinc-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Campaigns Found</h3>
            <p className="text-zinc-400 max-w-sm mb-6">You don't have any active campaigns right now. Create one to start reaching out.</p>
            {session.user.role === "ADMIN" && (
               <Link href="/dashboard/campaigns/new" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
                 Create First Campaign
               </Link>
            )}
          </div>
        ) : (
          campaigns.map((campaign: any) => (
            <div 
              key={campaign.id} 
              className="group flex flex-col p-6 rounded-3xl bg-zinc-900 border border-white/5 hover:border-blue-500/50 hover:bg-black transition-all shadow-xl hover:shadow-blue-500/10"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 transition-all">
                  <PhoneCall className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300">
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{campaign.name}</h3>
              <p className="text-zinc-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                {campaign.importantPoints}
              </p>
              
              <div className="mt-auto flex flex-col gap-4 pt-4 border-t border-white/10 text-sm text-zinc-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{campaign._count.contacts} Contacts</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Link 
                    href={`/dashboard/campaigns/${campaign.id}/contacts`}
                    className="flex-1 min-w-fit flex justify-center items-center py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-semibold text-xs"
                  >
                    View Contacts
                  </Link>

                  {session.user.role === "ADMIN" && (
                    <>
                      <Link 
                        href={`/dashboard/campaigns/${campaign.id}/results`}
                        className="p-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors shadow-lg shadow-green-500/20"
                        title="View Full Data Results"
                      >
                        <FileSpreadsheet className="w-5 h-5" />
                      </Link>
                      <Link 
                        href={`/dashboard/campaigns/${campaign.id}/assign`}
                        className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors"
                        title="Assign Callers"
                      >
                        <Shield className="w-5 h-5" />
                      </Link>
                      <Link 
                        href={`/dashboard/campaigns/${campaign.id}/edit`}
                        className="p-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl transition-colors"
                        title="Edit Campaign"
                      >
                        <Settings className="w-5 h-5" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
