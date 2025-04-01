'use client'

import { useState } from "react";
import { createNote, updateNote } from "@/app/actions/notes";
import { useRouter } from "next/navigation";
import { noteSchema, type NoteFormData } from "@/lib/schemas/note";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Tag {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteFormProps {
  note?: {
    id: string;
    title: string;
    content: string;
    date: Date;
    projectId: string | null;
    tags: Tag[];
  };
  tags: Tag[];
  projects: Project[];
}

export function NoteForm({ note, tags, projects }: NoteFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    try {
      setError(null);
      const data = {
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        date: new Date(formData.get("date") as string),
        projectId: formData.get("projectId") as string || null,
        tagIds: formData.getAll("tagIds") as string[],
      };

      const validatedData = noteSchema.parse(data);

      if (note) {
        formData.append("id", note.id);
        await updateNote(formData);
      } else {
        await createNote(formData);
      }

      setIsOpen(false);
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while saving the note");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={note ? "ghost" : "default"}>
          {note ? "Edit" : "New Note"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] md:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{note ? "Edit Note" : "Create New Note"}</DialogTitle>
          <DialogDescription>
            {note
              ? "Make changes to your note here. Click save when you're done."
              : "Add a new note to your collection. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={note?.title}
              placeholder="Note title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={note ? format(note.date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <select
              id="project"
              name="projectId"
              className="w-full px-3 py-2 border rounded-md"
              defaultValue={note?.projectId || ""}
            >
              <option value="">No Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={note?.content}
              placeholder="Note content"
              rows={12}
              className="min-h-[200px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="tagIds"
                    value={tag.id}
                    defaultChecked={note?.tags.some((t) => t.id === tag.id)}
                    className="rounded border-gray-300"
                  />
                  <span>{tag.name}</span>
                </label>
              ))}
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Note</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 