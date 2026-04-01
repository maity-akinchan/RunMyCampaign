"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addContactAction(formData: FormData) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const campaignId = formData.get("campaignId") as string
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const tags = formData.get("tags") as string || ""

  if (!campaignId || !name || !phone) {
    throw new Error("Missing required fields")
  }

  await prisma.contact.create({
    data: {
      name,
      phone,
      tags,
      campaignId
    }
  })

  revalidatePath(`/dashboard/campaigns/${campaignId}/contacts`)
}

export async function bulkAddContactsAction(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const campaignId = formData.get("campaignId") as string
  const rawData = formData.get("rawData") as string

  if (!campaignId || !rawData) throw new Error("Missing required fields")

  const rows = rawData.split("\n").map(r => r.trim()).filter(Boolean)
  const contactsToInsert = []

  for (const row of rows) {
    const cols = row.split(/\t|,/).map(c => c.trim())
    if (cols.length >= 2) {
      contactsToInsert.push({
        name: cols[0] || "Unknown",
        phone: cols[1] || "",
        tags: cols[2] || "",
        campaignId
      })
    }
  }

  if (contactsToInsert.length > 0) {
    await prisma.contact.createMany({ data: contactsToInsert })
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}/contacts`)
}

export async function deleteContactAction(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const contactId = formData.get("contactId") as string
  const campaignId = formData.get("campaignId") as string

  if (!contactId || !campaignId) throw new Error("Missing required fields")

  await prisma.contact.delete({
    where: { id: contactId }
  })

  revalidatePath(`/dashboard/campaigns/${campaignId}/contacts`)
  revalidatePath(`/dashboard/campaigns/${campaignId}/results`)
}

export async function unassignContactAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const contactId = formData.get("contactId") as string
  const campaignId = formData.get("campaignId") as string

  await prisma.contact.updateMany({
    where: { 
      id: contactId,
      assignedToId: session.user.id
    },
    data: { assignedToId: null }
  })
  
  revalidatePath(`/dashboard/campaigns/${campaignId}/contacts`)
  redirect(`/dashboard/campaigns/${campaignId}/contacts`)
}

export async function callNextAvailableAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const campaignId = formData.get("campaignId") as string

  const nextContact = await prisma.contact.findFirst({
    where: {
      campaignId,
      assignedToId: null
    },
    orderBy: { createdAt: "asc" }
  })

  if (!nextContact) {
    redirect(`/dashboard/campaigns/${campaignId}/contacts?error=No+available+contacts`)
  }

  await prisma.contact.update({
    where: { id: nextContact.id },
    data: { assignedToId: session.user.id }
  })

  revalidatePath(`/dashboard/campaigns/${campaignId}/contacts`)
  redirect(`/dashboard/campaigns/${campaignId}/call/${nextContact.id}`)
}

