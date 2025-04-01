'use client';

import { useState } from "react";
import { format } from "date-fns";
import {
  Plus,
  PenBox,
  Trash2,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProject, updateProject, deleteProject } from "@/app/actions/projects";

interface Project {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    notes: number;
  };
}

interface ProjectFormProps {
  project?: Project;
  onSuccess?: () => void;
}

function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    try {
      setError(null);
      if (project) {
        formData.append("id", project.id);
        await updateProject(formData);
      } else {
        await createProject(formData);
      }
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while saving the project");
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={project ? "ghost" : "default"} size={project ? "icon" : "default"}>
          {project ? <PenBox className="h-4 w-4" /> : (
            <>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create New Project"}</DialogTitle>
          <DialogDescription>
            {project
              ? "Make changes to your project here."
              : "Add a new project to organize your notes."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={project?.name}
                placeholder="Project name"
              />
            </div>
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              {project ? "Update Project" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectsContent({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState(initialProjects);

  const handleSuccess = () => {
    // Refresh the page to get updated data
    window.location.reload();
  };

  async function handleDelete(formData: FormData) {
    try {
      await deleteProject(formData);
      handleSuccess();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <ProjectForm onSuccess={handleSuccess} />
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-4">Name</th>
              <th className="text-left py-2 px-4">Notes</th>
              <th className="text-left py-2 px-4">Created</th>
              <th className="text-right py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b">
                <td className="py-2 px-4">{project.name}</td>
                <td className="py-2 px-4">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    {project._count.notes}
                  </div>
                </td>
                <td className="py-2 px-4">
                  {format(new Date(project.createdAt), "PPP")}
                </td>
                <td className="py-2 px-4 text-right">
                  <ProjectForm project={project} onSuccess={handleSuccess} />
                  {project._count.notes === 0 && (
                    <form action={handleDelete} className="inline">
                      <input type="hidden" name="id" value={project.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 