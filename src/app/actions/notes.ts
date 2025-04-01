'use server'

import { prisma, syncUser } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { noteSchema } from "@/lib/schemas/note";

export async function createNote(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Sync user with database
  await syncUser(userId);

  const data = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    date: new Date(formData.get("date") as string),
    projectId: formData.get("projectId") as string || null,
    tagIds: formData.getAll("tagIds") as string[],
  };

  const validatedData = noteSchema.parse(data);

  const note = await prisma.note.create({
    data: {
      title: validatedData.title,
      content: validatedData.content,
      date: validatedData.date,
      projectId: validatedData.projectId,
      userId,
      tags: {
        connect: validatedData.tagIds?.map((id) => ({ id })) || [],
      },
    },
  });

  revalidatePath("/dashboard");
  return note;
}

export async function updateNote(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Sync user with database
  await syncUser(userId);

  const id = formData.get("id") as string;
  if (!id) throw new Error("Note ID is required");

  const data = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    date: new Date(formData.get("date") as string),
    projectId: formData.get("projectId") as string || null,
    tagIds: formData.getAll("tagIds") as string[],
  };

  const validatedData = noteSchema.parse(data);

  const note = await prisma.note.update({
    where: {
      id,
      userId,
    },
    data: {
      title: validatedData.title,
      content: validatedData.content,
      date: validatedData.date,
      projectId: validatedData.projectId,
      tags: {
        set: validatedData.tagIds?.map((id) => ({ id })) || [],
      },
    },
  });

  revalidatePath("/dashboard");
  return note;
}

export async function deleteNote(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Sync user with database
  await syncUser(userId);

  const id = formData.get("id") as string;
  if (!id) throw new Error("Note ID is required");

  await prisma.note.delete({
    where: {
      id,
      userId,
    },
  });

  revalidatePath("/dashboard");
} 