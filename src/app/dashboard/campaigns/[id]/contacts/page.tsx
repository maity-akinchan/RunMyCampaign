import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Phone, UserPlus, Users, Search, Play } from "lucide-react"
import { addContactAction, bulkAddContactsAction, deleteContactAction, callNextAvailableAction } from "@/app/actions/contact"
import { DeleteContactButton } from "./DeleteContactButton"

export default async function ContactsPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ tab?: string, error?: string }> }) {
  const { id } = await props.params;
  const { tab = "to-call", error } = await props.searchParams;
  
  const session = await auth()
  if (!session?.user) return null

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      contacts: {
        include: {
          callRecords: {
            orderBy: { createdAt: "desc" }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!campaign) notFound()

  const isAdmin = session.user.role === "ADMIN"
  
  const visibleContacts = isAdmin 
    ? campaign.contacts
    : campaign.contacts.filter((c: any) => c.assignedToId === null || c.assignedToId === session.user.id);
  
  let displayedContacts = visibleContacts;

  if (tab !== "all") {
    displayedContacts = visibleContacts.filter((c: any) => {
      const latestCall = c.callRecords[0];
      const outcome = latestCall?.outcome;
      
      if (tab === "to-call") {
         return c.assignedToId === null || (c.assignedToId === session.user.id && (!outcome || outcome === "To Call"));
      } else if (tab === "follow-up") {
         return c.assignedToId === session.user.id && outcome === "Follow Up";
      } else if (tab === "no-answer") {
         return c.assignedToId === session.user.id && outcome === "No Answer";
      } else if (tab === "skipped") {
         return c.assignedToId === session.user.id && outcome === "Skipped";
      }
      return false;
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{campaign.name}</h1>
          <p className="text-zinc-400">Manage contacts and start dialing.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <Link href={`/dashboard/campaigns/${campaign.id}/contacts`} className="text-red-300 hover:text-white underline text-sm">Dismiss</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        {session.user.role === "ADMIN" && (
          <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" />
              Add Contact
            </h2>
            <form action={addContactAction} className="flex flex-col gap-4">
              <input type="hidden" name="campaignId" value={campaign.id} />
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="John Doe"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Tags / Status</label>
                <input 
                  type="text" 
                  name="tags" 
                  placeholder="e.g. Morning Shift, Registered"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <button 
                type="submit" 
                className="w-full mt-2 bg-white hover:bg-zinc-200 text-black font-medium py-3 rounded-xl transition-colors shadow-lg"
              >
                Save Contact
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-white/10">
              <details className="group cursor-pointer">
                <summary className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors mb-2 list-none flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 group-open:rotate-90 transition-transform">▸</span>
                  Click to Bulk Add (Excel Paste)
                </summary>
                <form action={bulkAddContactsAction} className="flex flex-col gap-3 mt-4 cursor-default">
                  <input type="hidden" name="campaignId" value={campaign.id} />
                  <label className="text-xs text-zinc-400">
                    Paste columns directly from Excel/Sheets.<br/>
                    Format: <b>Name | Phone | Tags(Optional)</b>
                  </label>
                  <textarea 
                    name="rawData" 
                    required 
                    rows={4}
                    placeholder={`Alice\t1234567890\tMorning Shift\nBob\t0987654321\tAfternoon Shift`}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono text-xs resize-y whitespace-pre"
                  />
                  <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-2.5 rounded-xl transition-colors shadow-lg shadow-purple-500/20 text-sm">
                    Import Contacts
                  </button>
                </form>
              </details>
            </div>
          </div>
        </div>
        )}

        {/* Right Column: List */}
        <div className={`flex flex-col gap-4 ${session.user.role === "ADMIN" ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Contact List</h2>
              <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full text-xs font-medium ml-2">
                {displayedContacts.length}
              </span>
            </div>
            {tab === "to-call" && displayedContacts.length > 0 && (
              <form action={callNextAvailableAction}>
                <input type="hidden" name="campaignId" value={campaign.id} />
                <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20">
                  <Play className="w-4 h-4 fill-current" />
                  Call Next Available
                </button>
              </form>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pb-2">
            {[
              { id: 'to-call', label: 'To Call' },
              { id: 'follow-up', label: 'Follow Up' },
              { id: 'no-answer', label: 'No Answer' },
              { id: 'skipped', label: 'Skipped' },
            ].map(t => (
              <Link 
                key={t.id}
                href={`?tab=${t.id}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                }`}
              >
                {t.label}
              </Link>
            ))}
            {isAdmin && (
              <Link 
                href="?tab=all"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ml-auto ${
                  tab === 'all' 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-purple-900/10 text-purple-400 hover:text-white hover:bg-purple-900/30 border border-purple-500/20'
                }`}
              >
                All (Admin)
              </Link>
            )}
          </div>

          <div className="space-y-3 mt-2">
            {displayedContacts.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/50">
                <Users className="w-8 h-8 text-zinc-600 mb-3 mx-auto" />
                <p className="text-zinc-400">No contacts yet. Add your first one to start calling.</p>
              </div>
              ) : (
              displayedContacts.map((contact: any) => {
                // Determine latest outcome if any
                const latestCall = contact.callRecords[0];
                return (
                  <div key={contact.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-zinc-900 border border-white/5 rounded-2xl hover:bg-zinc-800/80 transition-colors gap-4 sm:gap-0">
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-white text-lg">{contact.name}</span>
                        {contact.tags && (
                          <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                            {contact.tags}
                          </span>
                        )}
                      </div>
                      <a href={`tel:${contact.phone}`} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1.5 w-fit mt-0.5 transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="underline underline-offset-2">{contact.phone}</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {latestCall && (
                         <span className={`text-xs px-2.5 py-1 rounded-full border ${
                           latestCall.outcome === "Completed" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                           latestCall.outcome === "No Answer" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                           "bg-red-500/10 text-red-400 border-red-500/20"
                         }`}>
                           {latestCall.outcome}
                         </span>
                      )}
                      
                      <Link 
                        href={`/dashboard/campaigns/${campaign.id}/call/${contact.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20 shrink-0"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Call
                      </Link>

                      {session.user.role === "ADMIN" && (
                        <form action={deleteContactAction} className="shrink-0 flex items-center">
                          <input type="hidden" name="contactId" value={contact.id} />
                          <input type="hidden" name="campaignId" value={campaign.id} />
                          <DeleteContactButton />
                        </form>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
