import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProjectsContent } from "./ProjectsContent";

export default async function ProjectsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      _count: {
        select: { notes: true }
      }
    },
    orderBy: { name: "asc" },
  });

  const serializedProjects = projects.map((project) => ({
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }));

  return <ProjectsContent initialProjects={serializedProjects} />;
} 