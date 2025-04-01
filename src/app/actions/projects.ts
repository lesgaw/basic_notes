'use server'

import { prisma, syncUser } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
});

export async function createProject(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Sync user with database
  await syncUser(userId);

  const data = {
    name: formData.get("name") as string,
  };

  const validatedData = projectSchema.parse(data);

  const project = await prisma.project.create({
    data: {
      ...validatedData,
      userId,
    },
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return project;
}

export async function updateProject(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Sync user with database
  await syncUser(userId);

  const id = formData.get("id") as string;
  if (!id) throw new Error("Project ID is required");

  const data = {
    name: formData.get("name") as string,
  };

  const validatedData = projectSchema.parse(data);

  const project = await prisma.project.update({
    where: {
      id,
      userId,
    },
    data: validatedData,
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return project;
}

export async function deleteProject(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Sync user with database
  await syncUser(userId);

  const id = formData.get("id") as string;
  if (!id) throw new Error("Project ID is required");

  // Check if project has any notes
  const project = await prisma.project.findUnique({
    where: { id, userId },
    include: { _count: { select: { notes: true } } },
  });

  if (!project) throw new Error("Project not found");
  if (project._count.notes > 0) {
    throw new Error("Cannot delete project with existing notes");
  }

  await prisma.project.delete({
    where: {
      id,
      userId,
    },
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
} 