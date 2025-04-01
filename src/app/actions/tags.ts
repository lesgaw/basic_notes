'use server'

import { prisma, syncUser } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
});

export async function createTag(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Sync user with database
  await syncUser(userId);

  const data = {
    name: formData.get("name") as string,
  };

  const validatedData = tagSchema.parse(data);

  const tag = await prisma.tag.create({
    data: {
      ...validatedData,
      userId,
    },
  });

  revalidatePath("/tags");
  revalidatePath("/dashboard");
  return tag;
}

export async function updateTag(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Sync user with database
  await syncUser(userId);

  const id = formData.get("id") as string;
  if (!id) throw new Error("Tag ID is required");

  const data = {
    name: formData.get("name") as string,
  };

  const validatedData = tagSchema.parse(data);

  const tag = await prisma.tag.update({
    where: {
      id,
      userId,
    },
    data: validatedData,
  });

  revalidatePath("/tags");
  revalidatePath("/dashboard");
  return tag;
}

export async function deleteTag(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Sync user with database
  await syncUser(userId);

  const id = formData.get("id") as string;
  if (!id) throw new Error("Tag ID is required");

  // Check if tag has any notes
  const tag = await prisma.tag.findUnique({
    where: { id, userId },
    include: { _count: { select: { notes: true } } },
  });

  if (!tag) throw new Error("Tag not found");
  if (tag._count.notes > 0) {
    throw new Error("Cannot delete tag with existing notes");
  }

  await prisma.tag.delete({
    where: {
      id,
      userId,
    },
  });

  revalidatePath("/tags");
  revalidatePath("/dashboard");
} 