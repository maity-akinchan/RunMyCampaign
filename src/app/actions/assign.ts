"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function assignUsersAction(formData: FormData) {
  const session = await auth()
  
  // Ensure strict RBAC - only ADMINs can map user assignments.
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized Access")
  }

  const campaignId = formData.get("campaignId") as string
  const assigneeIds = formData.getAll("assigneeIds") as string[]

  if (!campaignId) {
    throw new Error("Missing campaign ID")
  }

  // Bind the selected caller IDs dynamically to this secure campaign.
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      assigneeIds
    }
  })

  // Purge the cache context for dynamic render alignment and kick the admin back to the dashboard securely.
  revalidatePath("/dashboard")
  redirect("/dashboard")
}
