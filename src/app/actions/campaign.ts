"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function createCampaignAction(formData: FormData) {
  const session = await auth()
  
  // Strict RBAC Verification - Only Admins can create Campaigns
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized. Only specific Managers (ADMINs) can create campaigns.")
  }

  const name = formData.get("name") as string
  const script = formData.get("script") as string
  const importantPoints = formData.get("importantPoints") as string
  const questionsRaw = formData.get("questions") as string || ""
  const whatsappMessage = formData.get("whatsappMessage") as string || ""

  if (!name || !script) {
    throw new Error("Missing required fields")
  }

  const questions = questionsRaw.split("\n").map(q => q.trim()).filter(Boolean)

  const campaign = await prisma.campaign.create({
    data: {
      name,
      script,
      importantPoints,
      questions,
      whatsappMessage,
      userId: session.user.id
    }
  })

  // Redirect to the Contacts page to start adding contacts.
  redirect(`/dashboard/campaigns/${campaign.id}/contacts`)
}

export async function editCampaignAction(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const script = formData.get("script") as string
  const importantPoints = formData.get("importantPoints") as string
  const questionsRaw = formData.get("questions") as string || ""
  const whatsappMessage = formData.get("whatsappMessage") as string || ""

  if (!id || !name || !script) throw new Error("Missing required fields")

  const questions = questionsRaw.split("\n").map(q => q.trim()).filter(Boolean)

  await prisma.campaign.update({
    where: { id },
    data: { name, script, importantPoints, questions, whatsappMessage }
  })

  redirect("/dashboard")
}

export async function deleteCampaignAction(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const id = formData.get("id") as string
  if (!id) throw new Error("Missing ID")

  await prisma.campaign.delete({ where: { id } })

  redirect("/dashboard")
}
