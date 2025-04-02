'use client'

import { useState } from "react";
import { createNote, updateNote } from "@/app/actions/notes";
import { useRouter } from "next/navigation";
import { noteSchema, type NoteFormData } from "@/lib/schemas/note";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { PenBox, Plus } from "lucide-react";

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
  children?: React.ReactNode;
  onSubmit?: () => void;
}

export function NoteForm({ note, tags, projects, children, onSubmit }: NoteFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>(
    note?.tags?.map((tag) => tag.id) || []
  );
  const [selectedProject, setSelectedProject] = useState<string | null>(
    note?.projectId || null
  );

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

      try {
        const validatedData = noteSchema.parse(data);
      } catch (validationError: any) {
        if (validationError.errors?.[0]) {
          setError(validationError.errors[0].message);
        } else {
          setError("Please check all required fields");
        }
        return;
      }

      if (note) {
        formData.append("id", note.id);
        await updateNote(formData);
      } else {
        await createNote(formData);
      }

      setIsOpen(false);
      onSubmit?.();
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
        {children || (
          <Button variant={note ? "ghost" : "default"} size={note ? "icon" : "default"}>
            {note ? <PenBox className="h-4 w-4" /> : (
              <>
                <Plus className="mr-2 h-4 w-4" /> New Note
              </>
            )}
          </Button>
        )}
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
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              name="title"
              defaultValue={note?.title}
              placeholder="Note title"
              required
              className={error?.includes("Title") ? "border-red-500" : ""}
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
              name="projectId"
              className="w-full px-3 py-2 border rounded-md"
              value={selectedProject || ""}
              onChange={(e) => setSelectedProject(e.target.value || null)}
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
                    defaultChecked={selectedTags.includes(tag.id)}
                    className="rounded border-gray-300"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags([...selectedTags, tag.id]);
                      } else {
                        setSelectedTags(selectedTags.filter((id) => id !== tag.id));
                      }
                    }}
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