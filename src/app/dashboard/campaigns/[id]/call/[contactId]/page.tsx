import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Phone, User, MessageCircle, FileText, CheckCircle, XCircle, Clock } from "lucide-react"
import { logCallOutcomeAction } from "@/app/actions/call"

export default async function CallingInterfacePage({ params }: { params: Promise<{ id: string, contactId: string }> }) {
  const { id, contactId } = await params;
  
  const session = await auth()
  if (!session?.user) return null

  // Fetch campaign and exactly this contact
  const campaign = await prisma.campaign.findUnique({
    where: { id }
  })

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      callRecords: {
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!campaign || !contact) notFound()

  // Generate WhatsApp Link
  let rawMessage = campaign.whatsappMessage || `Hi [Name], I'm reaching out regarding the ${campaign.name} program.`
  const waMessage = rawMessage.replace(/\[Name\]/gi, contact.name)
  const waLink = `https://wa.me/${contact.phone.replace(/[^a-zA-Z0-9]/g, "")}?text=${encodeURIComponent(waMessage)}`

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/campaigns/${campaign.id}/contacts`} className="p-2 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Calling {contact.name}</h1>
            <p className="text-zinc-400 text-sm">Campaign: {campaign.name}</p>
          </div>
        </div>
        
        <a 
          href={waLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 rounded-full font-medium transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp Message
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
        
        {/* Left Side: Campaign Context (Script & Points) */}
        <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
          
          <details className="group bg-blue-950/20 border border-blue-500/20 rounded-3xl p-5 cursor-pointer" open>
            <summary className="text-lg font-semibold text-blue-400 flex items-center justify-between list-none">
              <span className="flex items-center gap-2"><FileText className="w-5 h-5" /> Call Script</span>
              <span className="text-blue-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-4 bg-black/40 rounded-2xl p-6 font-mono text-zinc-300 text-sm leading-relaxed border border-white/5 whitespace-pre-wrap cursor-text">
              {campaign.script}
            </div>
          </details>

          {campaign.importantPoints && (
            <details className="group bg-orange-950/20 border border-orange-500/20 rounded-3xl p-5 cursor-pointer">
              <summary className="text-lg font-semibold text-orange-400 flex items-center justify-between list-none">
                <span className="flex items-center gap-2"><Clock className="w-5 h-5" /> Important Talking Points</span>
                <span className="text-orange-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-4 bg-black/40 rounded-2xl p-6 font-mono text-orange-200/80 text-sm leading-relaxed border border-white/5 whitespace-pre-wrap cursor-text">
                {campaign.importantPoints}
              </div>
            </details>
          )}
        </div>

        {/* Right Side: Contact Profile & Logging */}
        <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar pb-10">
          
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{contact.name}</h3>
                <div className="flex items-center gap-2 text-zinc-400 mt-0.5">
                  <Phone className="w-4 h-4" />
                  <span>{contact.phone}</span>
                </div>
              </div>
            </div>

            {contact.tags && (
              <div className="mt-2 pt-4 border-t border-white/5">
                <span className="text-xs font-semibold text-zinc-500 block mb-2 uppercase tracking-wide">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean).map((tag: string) => (
                    <span key={tag} className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form action={logCallOutcomeAction} className="flex flex-col bg-zinc-900 border border-white/10 rounded-3xl p-6 shrink-0">
            <input type="hidden" name="campaignId" value={campaign.id} />
            <input type="hidden" name="contactId" value={contact.id} />

            <h2 className="text-lg font-semibold text-white mb-4">Log Outcome</h2>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Completed', value: 'Completed', icon: CheckCircle, color: 'text-green-500', bg: 'peer-checked:border-green-500 peer-checked:bg-green-500/10' },
                { label: 'No Answer', value: 'No Answer', icon: Clock, color: 'text-orange-500', bg: 'peer-checked:border-orange-500 peer-checked:bg-orange-500/10' },
                { label: 'Dropped Out', value: 'Dropped Out', icon: XCircle, color: 'text-red-500', bg: 'peer-checked:border-red-500 peer-checked:bg-red-500/10' }
              ].map(opt => (
                <label key={opt.value} className="relative cursor-pointer">
                  <input type="radio" name="outcome" value={opt.value} className="peer sr-only" required />
                  <div className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-white/10 bg-black/50 hover:bg-zinc-800 transition-all ${opt.bg}`}>
                    <opt.icon className={`w-5 h-5 ${opt.color}`} />
                    <span className="text-xs font-medium text-white text-center">{opt.label}</span>
                  </div>
                </label>
              ))}
            </div>

            {campaign.questions && campaign.questions.length > 0 && (
              <div className="flex-col flex mb-6 gap-4 border-t border-white/10 pt-6">
                <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Campaign Questionnaire
                </h3>
                {campaign.questions.map((q: string, i: number) => (
                  <div key={i} className="flex flex-col gap-2">
                    <label className="text-sm text-zinc-300 bg-black/30 p-2.5 rounded-lg border border-white/5">{q}</label>
                    <input type="hidden" name={`qtext_${i}`} value={q} />
                    <input 
                      type="text" 
                      name={`qanswer_${i}`} 
                      placeholder="Type caller's answer..." 
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex-1 flex flex-col mb-6 border-t border-white/10 pt-6">
              <label className="text-sm font-medium text-zinc-400 mb-2">Call Notes / Remarks</label>
              <textarea 
                name="notes" 
                placeholder="E.g. They asked us to call back tomorrow at 5pm."
                className="w-full flex-1 min-h-[100px] bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25"
            >
              Save & Return to List
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
