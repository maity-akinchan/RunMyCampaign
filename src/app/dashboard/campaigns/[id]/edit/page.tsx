import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { editCampaignAction, deleteCampaignAction } from "@/app/actions/campaign"
import { Settings, Target, FileText, AlertCircle, MessageCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DeleteCampaignButton } from "./DeleteCampaignButton"

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return redirect("/dashboard")

  const campaign = await prisma.campaign.findUnique({ where: { id } })
  if (!campaign) notFound()

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard`} className="p-2 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-500" />
            Edit Campaign
          </h1>
          <p className="text-zinc-400 mt-2 text-lg">Modify your active campaign parameters or delete it entirely.</p>
        </div>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <form action={editCampaignAction} className="flex flex-col gap-8 relative z-10">
          <input type="hidden" name="id" value={campaign.id} />
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Campaign Name
            </label>
            <input 
              name="name" 
              type="text" 
              required 
              defaultValue={campaign.name}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-lg"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Call Script (What to say)
            </label>
            <textarea 
              name="script" 
              required 
              rows={6}
              defaultValue={campaign.script}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm leading-relaxed resize-y"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              Key Talking Points / Objections
            </label>
            <textarea 
              name="importantPoints" 
              rows={4}
              defaultValue={campaign.importantPoints}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm leading-relaxed resize-y"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Dynamic Caller Questions (One per line)
            </label>
            <textarea 
              name="questions" 
              rows={4}
              defaultValue={campaign.questions.join("\n")}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm leading-relaxed resize-y"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-400" />
              Custom WhatsApp Message Template
            </label>
            <textarea 
              name="whatsappMessage" 
              rows={3}
              defaultValue={campaign.whatsappMessage || ""}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all font-mono text-sm leading-relaxed resize-y"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10 mt-2">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              Update Campaign Settings
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-8 pt-8 border-t border-red-500/20 relative z-10">
          <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Danger Zone
          </h3>
          <p className="text-sm text-zinc-500 mb-4">Deleting a campaign drops all associated contacts and records entirely. This action is irreversible.</p>
          <form action={deleteCampaignAction}>
            <input type="hidden" name="id" value={campaign.id} />
            <DeleteCampaignButton />
          </form>
        </div>

      </div>
    </div>
  )
}
