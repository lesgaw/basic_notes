'use client';

import React, { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import {
  Plus,
  PenBox,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  MoreVertical,
  Search,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type SortField = 'name' | 'notes' | 'date';
type SortOrder = 'asc' | 'desc';
type Status = 'all' | 'active' | 'inactive';

interface ProjectFormProps {
  project?: Project;
  onSuccess: () => void;
  children?: React.ReactNode;
}

function ProjectForm({ project, onSuccess, children }: ProjectFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      setError(null);
      if (project) {
        formData.append("id", project.id);
        await updateProject(formData);
      } else {
        await createProject(formData);
      }
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while saving the project");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={project ? "ghost" : "default"} size={project ? "icon" : "default"}>
            {project ? <PenBox className="h-4 w-4" /> : (
              <>
                <Plus className="mr-2 h-4 w-4" /> New Project
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create New Project"}</DialogTitle>
          <DialogDescription>
            {project
              ? "Make changes to your project here. Click save when you're done."
              : "Add a new project to your collection. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
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
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Project</Button>
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
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(10);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterText, setFilterText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Status>('all');

  // Calculate project counts by status
  const statusCounts = useMemo(() => ({
    all: projects.length,
    active: projects.filter(p => p._count.notes > 0).length,
    inactive: projects.filter(p => p._count.notes === 0).length,
  }), [projects]);

  // Filter projects based on search text and status
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(filterText.toLowerCase());
      let matchesStatus = true;

      if (selectedStatus === 'active') {
        matchesStatus = project._count.notes > 0;
      } else if (selectedStatus === 'inactive') {
        matchesStatus = project._count.notes === 0;
      }

      return matchesSearch && matchesStatus;
    });
  }, [projects, filterText, selectedStatus]);

  // Sort filtered projects
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'name':
          return a.name.localeCompare(b.name) * modifier;
        case 'notes':
          return (a._count.notes - b._count.notes) * modifier;
        case 'date':
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * modifier;
        default:
          return 0;
      }
    });
  }, [filteredProjects, sortField, sortOrder]);

  const handleSuccess = () => {
    window.location.reload();
  };

  const handleDelete = async (formData: FormData) => {
    try {
      setDeleteError(null);
      await deleteProject(formData);
      const projectId = formData.get("id") as string;
      setProjects(projects.filter(project => project.id !== projectId));
    } catch (err) {
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError("An error occurred while deleting the project");
      }
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, selectedStatus]);

  // Pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = sortedProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(sortedProjects.length / projectsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold">Projects</h1>
        <ProjectForm onSuccess={handleSuccess} />
      </div>

      {deleteError && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
          {deleteError}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter projects..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          defaultValue="all"
          value={selectedStatus}
          onValueChange={(value: Status) => setSelectedStatus(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue>
              {selectedStatus === 'all' && "All Projects"}
              {selectedStatus === 'active' && "Active"}
              {selectedStatus === 'inactive' && "Inactive"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Projects
              <span className="ml-2 text-muted-foreground">({statusCounts.all})</span>
            </SelectItem>
            <SelectItem value="active">
              Active
              <span className="ml-2 text-muted-foreground">({statusCounts.active})</span>
            </SelectItem>
            <SelectItem value="inactive">
              Inactive
              <span className="ml-2 text-muted-foreground">({statusCounts.inactive})</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

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
                  Project
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
              <th className="text-left py-2 px-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('date')}
                  className="h-8 px-2 -ml-2 font-medium"
                >
                  Created
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </th>
              <th className="text-right py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProjects.map((project) => (
              <tr key={project.id} className="border-b">
                <td className="py-2 px-4">{project.name}</td>
                <td className="py-2 px-4">{project._count.notes}</td>
                <td className="py-2 px-4">{format(new Date(project.createdAt), "yyyy-MM-dd")}</td>
                <td className="py-2 px-4 text-right">
                  <DropdownMenu modal={false}>
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
                      <ProjectForm 
                        project={project} 
                        onSuccess={handleSuccess}
                      >
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center w-full">
                            <PenBox className="h-4 w-4" />
                            <span className="ml-2">Edit</span>
                          </div>
                        </DropdownMenuItem>
                      </ProjectForm>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={project.id} />
                        <DropdownMenuItem
                          onSelect={(e) => {
                            if (project._count.notes > 0) {
                              e.preventDefault();
                            }
                          }}
                          disabled={project._count.notes > 0}
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
              Showing {indexOfFirstProject + 1}-
              {Math.min(indexOfLastProject, sortedProjects.length)} of{" "}
              {sortedProjects.length} projects
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