"use client"

import { Trash2 } from "lucide-react"

export function DeleteContactButton() {
  return (
    <button 
      type="submit" 
      onClick={(e) => { 
        if(!window.confirm("Delete this contact and wipe their associated call records?")) {
          e.preventDefault() 
        }
      }}
      className="flex items-center justify-center p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-colors shrink-0"
      title="Delete Contact"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
