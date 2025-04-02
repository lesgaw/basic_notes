'use client'

import { useState, useEffect } from "react";
import { createNote, updateNote } from "@/app/actions/notes";
import { useRouter } from "next/navigation";
import { noteSchema, type NoteFormData } from "@/lib/schemas/note";
import { format } from "date-fns";
import { Calendar, Loader2 } from "lucide-react";
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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NoteForm({ note, tags, projects, children, onSubmit, open, onOpenChange }: NoteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    note?.tags?.map((tag) => tag.id) || []
  );
  const [selectedProject, setSelectedProject] = useState<string | null>(
    note?.projectId || null
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData(e.currentTarget);
      if (note) {
        formData.append("id", note.id);
        await updateNote(formData);
      } else {
        await createNote(formData);
      }

      // First refresh the data
      await router.refresh();
      
      // Then close the modal and call onSubmit
      handleOpenChange(false);
      onSubmit?.();
    } catch (err) {
      console.error("Form submission error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while saving the note");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset selected tags when the form is opened for a new note
  useEffect(() => {
    if (!note) {
      setSelectedTags([]);
      setSelectedProject(null);
    }
  }, [note]);

  const dialogContent = (
    <DialogContent className="sm:max-w-[700px] md:max-w-[800px]">
      <DialogHeader>
        <DialogTitle>{note ? "Edit Note" : "Create New Note"}</DialogTitle>
        <DialogDescription>
          {note
            ? "Make changes to your note here. Click save when you're done."
            : "Add a new note to your collection. Click save when you're done."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            name="title"
            defaultValue={note?.title}
            placeholder="Note title"
            required
            className={error?.includes("Title") ? "border-red-500" : ""}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={note ? format(note.date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <select
            name="projectId"
            className="w-full px-3 py-2 border rounded-md"
            value={selectedProject || ""}
            onChange={(e) => setSelectedProject(e.target.value || null)}
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
                  checked={selectedTags.includes(tag.id)}
                  className="rounded border-gray-300"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTags([...selectedTags, tag.id]);
                    } else {
                      setSelectedTags(selectedTags.filter((id) => id !== tag.id));
                    }
                  }}
                  disabled={isSubmitting}
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
        <DialogFooter className="flex gap-2">
          <DialogClose asChild>
            <Button 
              type="button" 
              variant="outline" 
              disabled={isSubmitting}
              className="w-[120px]"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Saving...</span>
              </div>
            ) : (
              "Save Note"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  // If we're controlling the dialog externally (open prop is provided)
  if (open !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  // If we're not controlling the dialog externally, use internal state
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
      {dialogContent}
    </Dialog>
  );
} 