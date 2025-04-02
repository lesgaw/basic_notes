'use client';

import { useState, useMemo } from "react";
import { format, parseISO, isWithinInterval, addDays } from "date-fns";
import {
  Search,
  X,
  TagIcon,
  Filter,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  PenBox,
  Trash2,
  FolderKanban,
  MoreVertical,
  Calendar as CalendarIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NoteForm } from "@/components/NoteForm";
import { deleteNote } from "@/app/actions/notes";

interface BaseNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  projectId: string | null;
  project: {
    id: string;
    name: string;
  } | null;
  tags: BaseTag[];
}

interface BaseTag {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface BaseProject {
  id: string;
  userId: string;
  name: string;
}

interface SerializedNote extends BaseNote {
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface SerializedTag extends BaseTag {
  createdAt: string;
  updatedAt: string;
}

interface SerializedProject extends BaseProject {
  createdAt: string;
  updatedAt: string;
}

interface NoteWithDate {
  id: string;
  title: string;
  content: string;
  date: Date;
  projectId: string | null;
  tags: {
    id: string;
    userId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

export function DashboardContent({
  initialNotes,
  tags,
  projects,
}: {
  initialNotes: SerializedNote[];
  tags: SerializedTag[];
  projects: SerializedProject[];
}) {
  const [searchText, setSearchText] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sortField, setSortField] = useState<"title" | "date" | "project">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [notesPerPage, setNotesPerPage] = useState(20);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Filter notes based on search text, selected tag, project, and date range
  const filteredNotes = useMemo(() => {
    return initialNotes.filter((note) => {
      const matchesSearch = searchText === "" || (
        note.title.toLowerCase().includes(searchText.toLowerCase()) ||
        note.content.toLowerCase().includes(searchText.toLowerCase())
      );
      const matchesTag = selectedTagId === "all" || note.tags.some(tag => tag.id === selectedTagId);
      const matchesProject = selectedProjectId === null || note.projectId === selectedProjectId;
      
      // Date range filtering
      const noteDate = parseISO(note.date);
      const matchesDateRange = 
        !dateRange?.from || !dateRange?.to || // If no date range is selected, show all notes
        isWithinInterval(noteDate, {
          start: dateRange.from,
          end: dateRange.to,
        });

      return matchesSearch && matchesTag && matchesProject && matchesDateRange;
    });
  }, [initialNotes, searchText, selectedTagId, selectedProjectId, dateRange]);

  // Sort notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortField === "title") {
      return sortDirection === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortField === "project") {
      const projectA = a.project?.name || "";
      const projectB = b.project?.name || "";
      return sortDirection === "asc"
        ? projectA.localeCompare(projectB)
        : projectB.localeCompare(projectA);
    } else {
      return sortDirection === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  // Pagination
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = sortedNotes.slice(indexOfFirstNote, indexOfLastNote);
  const totalPages = Math.ceil(sortedNotes.length / notesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Reset to first page when changing notes per page
  const handleNotesPerPageChange = (value: string) => {
    setNotesPerPage(Number(value));
    setCurrentPage(1);
  };

  // Toggle sort direction or change sort field
  const toggleSort = (field: "title" | "date" | "project") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8 px-2">
        <h1 className="text-xl font-bold">Notes</h1>
        <NoteForm tags={tags} projects={projects} />
      </div>

      {/* Filters Section */}
      <div className="bg-card rounded-lg p-4 mb-8 shadow-sm border relative">
        <div className="absolute -top-3 left-5 bg-background px-2 text-sm text-muted-foreground">
          Filters
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                className="pl-8 w-full"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setSearchText("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Date Range Picker */}
          <div className="flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1">
            <Select
              value={selectedProjectId || "all"}
              onValueChange={(value) => setSelectedProjectId(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select
              value={selectedTagId}
              onValueChange={setSelectedTagId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchText("");
              setSelectedTagId("all");
              setSelectedProjectId(null);
              setDateRange(undefined);
              setSortField("date");
              setSortDirection("desc");
              setCurrentPage(1);
            }}
            className="w-[140px] shrink-0"
          >
            Reset All Filters
          </Button>
        </div>
      </div>

      {/* Notes Table */}
      {sortedNotes.length > 0 ? (
        <>
          <div className="rounded-md border mb-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="w-[300px] lg:w-[250px] cursor-pointer"
                    onClick={() => toggleSort("title")}
                  >
                    <div className="flex items-center">
                      Title
                      {sortField === "title" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortDirection === "asc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[120px] text-center cursor-pointer"
                    onClick={() => toggleSort("date")}
                  >
                    <div className="flex items-center justify-center">
                      Date
                      {sortField === "date" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortDirection === "asc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[190px] lg:w-[160px] text-center cursor-pointer"
                    onClick={() => toggleSort("project")}
                  >
                    <div className="flex items-center justify-center">
                      Project
                      {sortField === "project" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortDirection === "asc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell w-[310px]">Content Preview</TableHead>
                  <TableHead className="hidden xl:table-cell min-w-[200px]">Tags</TableHead>
                  <TableHead className="w-[70px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentNotes.map((note) => {
                  const noteForForm: NoteWithDate = {
                    id: note.id,
                    title: note.title,
                    content: note.content,
                    date: new Date(note.date),
                    projectId: note.projectId,
                    tags: note.tags.map(tag => ({
                      ...tag,
                      createdAt: tag.createdAt || new Date().toISOString(),
                      updatedAt: tag.updatedAt || new Date().toISOString()
                    }))
                  };
                  return (
                    <TableRow key={note.id}>
                      <TableCell className="font-medium">{note.title}</TableCell>
                      <TableCell className="text-center">
                        {format(new Date(note.date), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell className="text-center">
                        {note.project?.name || "No Project"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {note.content.substring(0, 30)}
                        {note.content.length > 30 ? "..." : ""}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {note.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu open={openDropdownId === note.id} onOpenChange={(open) => setOpenDropdownId(open ? note.id : null)}>
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
                            <DropdownMenuItem 
                              onSelect={(e) => {
                                e.preventDefault();
                                setEditingNoteId(note.id);
                                setOpenDropdownId(null);
                              }}
                              className="cursor-pointer"
                            >
                              <PenBox className="h-4 w-4" />
                              <span className="ml-2">Edit</span>
                            </DropdownMenuItem>
                            <form 
                              action={deleteNote}
                            >
                              <input type="hidden" name="id" value={note.id} />
                              <DropdownMenuItem 
                                asChild
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <button 
                                  className="w-full flex items-center px-2 py-1.5 text-sm"
                                  onClick={() => setOpenDropdownId(null)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="ml-2">Delete</span>
                                </button>
                              </DropdownMenuItem>
                            </form>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <NoteForm 
                          note={noteForForm} 
                          tags={tags} 
                          projects={projects}
                          open={editingNoteId === note.id}
                          onOpenChange={(open) => {
                            setEditingNoteId(open ? note.id : null);
                            if (!open) {
                              setOpenDropdownId(null);
                            }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
            <div className="container mx-auto max-w-7xl px-4">
              <div className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {indexOfFirstNote + 1}-
                    {Math.min(indexOfLastNote, sortedNotes.length)} of{" "}
                    {sortedNotes.length} notes
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="rows-per-page" className="text-sm">Rows per page:</Label>
                    <Select
                      value={notesPerPage.toString()}
                      onValueChange={handleNotesPerPageChange}
                    >
                      <SelectTrigger id="rows-per-page" className="h-8 w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No notes match your filters</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
} 