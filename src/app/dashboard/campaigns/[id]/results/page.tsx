import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileSpreadsheet, CheckCircle, Clock, XCircle } from "lucide-react"

export default async function CampaignResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return redirect("/dashboard")

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      contacts: {
        include: {
          callRecords: {
            orderBy: { createdAt: "desc" },
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!campaign) notFound()

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard`} className="p-2 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-green-500" />
            Campaign Analytics & Analytics
          </h1>
          <p className="text-zinc-400 mt-2">Aggregated results and dynamically logged tracking metrics for <strong>{campaign.name}</strong></p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead className="bg-zinc-800/50 text-zinc-400 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Final Outcome</th>
                <th className="px-6 py-4">Questionnaire Form Answers</th>
                <th className="px-6 py-4">Latest Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {campaign.contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No operational records found.</td>
                </tr>
              ) : (
                campaign.contacts.map((contact: any) => {
                  const latestCall = contact.callRecords[0]
                  let answers = {}
                  try {
                    if (latestCall?.answers) answers = JSON.parse(latestCall.answers)
                  } catch(e) {}

                  return (
                    <tr key={contact.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{contact.name}</td>
                      <td className="px-6 py-4 font-mono text-zinc-400">{contact.phone}</td>
                      <td className="px-6 py-4">
                        {latestCall ? (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                            latestCall.outcome === "Completed" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                            latestCall.outcome === "No Answer" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                            "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}>
                            {latestCall.outcome}
                          </span>
                        ) : (
                          <span className="text-zinc-600">Untouched</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {Object.keys(answers).length > 0 ? (
                          <div className="flex flex-col gap-1 max-w-sm whitespace-normal tracking-wide leading-relaxed">
                            {Object.entries(answers).map(([q, a]: any, i) => (
                              <div key={i} className="text-xs bg-black/40 p-2 rounded-lg border border-white/5">
                                <span className="text-zinc-500 block mb-0.5">{q}:</span> 
                                <span className="text-purple-300 font-medium">{a}</span>
                              </div>
                            ))}
                          </div>
                        ) : <span className="text-zinc-600">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-normal max-w-sm line-clamp-3 leading-relaxed">
                        {latestCall?.notes ? <span className="text-zinc-400">{latestCall.notes}</span> : <span className="text-zinc-600">-</span>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
