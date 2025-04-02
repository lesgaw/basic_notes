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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, PenBox, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, MoreVertical } from "lucide-react";
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

type SortField = 'name' | 'notes';
type SortOrder = 'asc' | 'desc';

interface TagFormProps {
  tag?: Tag;
  onSuccess: () => void;
  children?: React.ReactNode;
}

function TagForm({ tag, onSuccess, children }: TagFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      setError(null);
      if (tag) {
        formData.append("id", tag.id);
        await updateTag(formData);
      } else {
        await createTag(formData);
      }
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while saving the tag");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={tag ? "ghost" : "default"} size={tag ? "icon" : "default"}>
            {tag ? <PenBox className="h-4 w-4" /> : (
              <>
                <Plus className="mr-2 h-4 w-4" /> New Tag
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tag ? "Edit Tag" : "Create New Tag"}</DialogTitle>
          <DialogDescription>
            {tag
              ? "Make changes to your tag here. Click save when you're done."
              : "Add a new tag to your collection. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="name"
              name="name"
              defaultValue={tag?.name}
              placeholder="Tag name"
            />
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
            <Button type="submit">Save Tag</Button>
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
  const [currentPage, setCurrentPage] = useState(1);
  const [tagsPerPage] = useState(10);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSuccess = () => {
    window.location.reload();
  };

  const handleDelete = async (formData: FormData) => {
    try {
      setDeleteError(null);
      await deleteTag(formData);
      const tagId = formData.get("id") as string;
      setTags(tags.filter(tag => tag.id !== tagId));
    } catch (err) {
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError("An error occurred while deleting the tag");
      }
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // If clicking the same field, toggle the order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it as the sort field and default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Sort tags
  const sortedTags = [...tags].sort((a, b) => {
    const modifier = sortOrder === 'asc' ? 1 : -1;
    if (sortField === 'name') {
      return a.name.localeCompare(b.name) * modifier;
    } else {
      return (a._count.notes - b._count.notes) * modifier;
    }
  });

  // Pagination
  const indexOfLastTag = currentPage * tagsPerPage;
  const indexOfFirstTag = indexOfLastTag - tagsPerPage;
  const currentTags = sortedTags.slice(indexOfFirstTag, indexOfLastTag);
  const totalPages = Math.ceil(sortedTags.length / tagsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold">Tags</h1>
        <TagForm onSuccess={handleSuccess} />
      </div>

      {deleteError && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
          {deleteError}
        </div>
      )}

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="h-8 px-2 -ml-2 font-medium"
                >
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </th>
              <th className="text-left py-2 px-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('notes')}
                  className="h-8 px-2 -ml-2 font-medium"
                >
                  Notes
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </th>
              <th className="text-right py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTags.map((tag) => (
              <tr key={tag.id} className="border-b">
                <td className="py-2 px-4">{tag.name}</td>
                <td className="py-2 px-4">{tag._count.notes}</td>
                <td className="py-2 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <TagForm tag={tag} onSuccess={handleSuccess}>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center w-full">
                            <PenBox className="h-4 w-4" />
                            <span className="ml-2">Edit</span>
                          </div>
                        </DropdownMenuItem>
                      </TagForm>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={tag.id} />
                        <DropdownMenuItem
                          onSelect={(e) => {
                            if (tag._count.notes > 0) {
                              e.preventDefault();
                            }
                          }}
                          disabled={tag._count.notes > 0}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <div className="flex items-center w-full">
                            <Trash2 className="h-4 w-4" />
                            <span className="ml-2">Delete</span>
                          </div>
                        </DropdownMenuItem>
                      </form>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="py-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstTag + 1}-
              {Math.min(indexOfLastTag, sortedTags.length)} of{" "}
              {sortedTags.length} tags
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <Button
                    key={number}
                    variant={currentPage === number ? "default" : "outline"}
                    size="sm"
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="pb-20"></div>
    </div>
  );
} 