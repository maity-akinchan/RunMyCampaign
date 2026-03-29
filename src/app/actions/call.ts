"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function logCallOutcomeAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const contactId = formData.get("contactId") as string
  const outcome = formData.get("outcome") as string
  const notes = formData.get("notes") as string || ""
  const campaignId = formData.get("campaignId") as string

  if (!contactId || !outcome || !campaignId) {
    throw new Error("Missing required fields")
  }

  const answers: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("qanswer_")) {
      const index = key.replace("qanswer_", "")
      const questionText = formData.get(`qtext_${index}`) as string || index
      answers[questionText] = value as string
    }
  }

  await prisma.callRecord.create({
    data: {
      outcome,
      notes,
      answers: Object.keys(answers).length > 0 ? JSON.stringify(answers) : null,
      contactId,
      userId: session.user.id
    }
  })

  // Force completely purge the campaign contacts cache to instantly display updated statuses.
  revalidatePath(`/dashboard/campaigns/${campaignId}/contacts`)
  redirect(`/dashboard/campaigns/${campaignId}/contacts`)
}
