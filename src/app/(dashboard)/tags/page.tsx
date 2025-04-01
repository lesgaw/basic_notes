import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { TagsContent } from "./TagsContent";

interface DbTag {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    notes: number;
  };
}

export default async function TagsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const tags = await prisma.tag.findMany({
    where: { userId },
    include: {
      _count: {
        select: { notes: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Serialize dates for client components
  const serializedTags = tags.map((tag) => ({
    ...tag,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  }));

  return <TagsContent initialTags={serializedTags} />;
} 