import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DashboardContent } from "@/app/(dashboard)/dashboard/DashboardContent";

interface DbNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  date: Date;
  projectId: string | null;
  project: {
    id: string;
    name: string;
  } | null;
  tags: {
    id: string;
    name: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface DbTag {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DbProject {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [notes, tags, projects] = await Promise.all([
    prisma.note.findMany({
      where: { userId },
      include: {
        project: true,
        tags: true,
      },
      orderBy: { date: "desc" },
    }),
    prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
  ]);

  // Serialize dates to strings for client components
  const serializedNotes = notes.map((note: DbNote) => ({
    ...note,
    date: note.date.toISOString(),
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }));

  const serializedTags = tags.map((tag: DbTag) => ({
    ...tag,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  }));

  const serializedProjects = projects.map((project: DbProject) => ({
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }));

  return (
    <DashboardContent
      initialNotes={serializedNotes}
      tags={serializedTags}
      projects={serializedProjects}
    />
  );
} 