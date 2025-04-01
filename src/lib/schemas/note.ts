import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  date: z.date(),
  projectId: z.string().nullable(),
  tagIds: z.array(z.string()).optional(),
});

export type NoteFormData = z.infer<typeof noteSchema>; 