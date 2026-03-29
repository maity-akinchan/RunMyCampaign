"use client"

import { useState } from "react"
import { createCampaignAction } from "@/app/actions/campaign"
import { Users, FileText, Target, AlertCircle, MessageCircle } from "lucide-react"

export default function NewCampaignPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    try {
      await createCampaignAction(formData)
    } catch (err: any) {
      setError(err.message || "Failed to create campaign. You might not have the correct permissions.")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-500" />
          Create New Campaign
        </h1>
        <p className="text-zinc-400 mt-2 text-lg">Set up your call script, talking points, and campaign metadata. Keep it concise for your callers!</p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Soft Background Accent Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <form action={handleSubmit} className="flex flex-col gap-8 relative z-10">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Campaign Name
            </label>
            <input 
              name="name" 
              type="text" 
              required 
              placeholder="e.g. Free Yoga Shift 1 Outreach"
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
              placeholder={`Hi [Name], I'm calling about the Free Yoga program...`}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm leading-relaxed resize-y"
            />
            <p className="text-xs text-zinc-500">Callers will read this out loud. Provide a friendly conversational flow.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              Key Talking Points / Objections
            </label>
            <textarea 
              name="importantPoints" 
              rows={4}
              placeholder={`- Mention the time is strictly 7 AM \n- Free mat provided if registered before 5th.`}
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
              placeholder={`Are you available on the 5th?\nDo you need transportation assistance?`}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm leading-relaxed resize-y"
            />
            <p className="text-xs text-zinc-500">Callers will be prompted to ask these questions and log answers.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-400" />
              Custom WhatsApp Message Template
            </label>
            <textarea 
              name="whatsappMessage" 
              rows={3}
              placeholder={`Hi [Name], I'm reaching out about...`}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all font-mono text-sm leading-relaxed resize-y"
            />
            <p className="text-xs text-zinc-500">Use [Name] as a placeholder which will dynamically inject the contact's name when the caller clicks the WhatsApp button.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-400 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-white/10 mt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? "Creating..." : "Save Campaign"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
