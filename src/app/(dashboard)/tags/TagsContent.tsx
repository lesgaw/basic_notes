'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, PenBox, Trash2 } from "lucide-react";
import { createTag, updateTag, deleteTag } from "@/app/actions/tags";

interface Tag {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    notes: number;
  };
}

interface TagFormProps {
  tag?: Tag;
  onSuccess?: () => void;
}

function TagForm({ tag, onSuccess }: TagFormProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      if (tag) {
        await updateTag(formData);
      } else {
        await createTag(formData);
      }
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {tag ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <PenBox className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Tag
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tag ? "Edit Tag" : "New Tag"}</DialogTitle>
          <DialogDescription>
            {tag
              ? "Edit the tag name below."
              : "Enter a name for your new tag below."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="name"
                name="name"
                placeholder="Tag name"
                defaultValue={tag?.name}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              {tag ? "Save Changes" : "Create Tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TagsContent({
  initialTags,
}: {
  initialTags: Tag[];
}) {
  const [tags, setTags] = useState(initialTags);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tags</h1>
        <TagForm onSuccess={() => window.location.reload()} />
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Notes</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id} className="border-b">
                <td className="py-2">{tag.name}</td>
                <td className="py-2">{tag._count.notes}</td>
                <td className="py-2 text-right">
                  <TagForm tag={tag} onSuccess={() => window.location.reload()} />
                  <form action={deleteTag} className="inline">
                    <input type="hidden" name="id" value={tag.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      disabled={tag._count.notes > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 