"use client"

import { Trash2 } from "lucide-react"

export function DeleteCampaignButton() {
  return (
    <button 
      type="submit" 
      onClick={(e) => { 
        if(!window.confirm("Are you entirely sure you want to permanently delete this campaign and all its data? This action is irreversible.")) {
          e.preventDefault() 
        }
      }}
      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-medium px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm"
    >
      <Trash2 className="w-4 h-4" />
      Delete Campaign
    </button>
  )
}
