import { v4 as uuidv4 } from "uuid";

/** Types & Definitions */
export type ProjectStatus = "Pending" | "Active" | "Finished";
export type UserRole = "Architect" | "Engineer" | "Developer";
export type TodoStatus = "Pending" | "Assigned" | "In Progress" | "Completed";
export type SyncStatus = "pending" | "synced" | "error";

export type TodoType =
  | "Planning" | "Design" | "Site Works" | "Concrete Works"
  | "Steel Works" | "Glass Works" | "Drywall/ Partition" | "Mansory"
  | "Woodworks/ Carpentry" | "Plumbing" | "Electrical" | "HVAC"
  | "Finish Works" | "Data/ Security" | "Landscape/ External" | "Fire Safety";

/** UI Meta Data for Todo Types */
export const TODO_TYPES: { type: TodoType; icon: string; label: string }[] = [
  { type: "Planning", icon: "draw", label: "Planning" },
  { type: "Design", icon: "design_services", label: "Design" },
  { type: "Site Works", icon: "grass", label: "Site Works" },
  { type: "Concrete Works", icon: "apartment", label: "Concrete Works" },
  { type: "Steel Works", icon: "h_mobiledata", label: "Steel Works" },
  { type: "Glass Works", icon: "window", label: "Glass Works" },
  { type: "Drywall/ Partition", icon: "border_style", label: "Drywall/ Partition" },
  { type: "Mansory", icon: "dashboard", label: "Mansory" },
  { type: "Woodworks/ Carpentry", icon: "carpenter", label: "Woodworks/ Carpentry" },
  { type: "Plumbing", icon: "plumbing", label: "Plumbing" },
  { type: "Electrical", icon: "outlet", label: "Electrical" },
  { type: "HVAC", icon: "ac_unit", label: "HVAC" },
  { type: "Finish Works", icon: "palette", label: "Finish Works" },
  { type: "Data/ Security", icon: "security", label: "Data/ Security" },
  { type: "Landscape/ External", icon: "grass", label: "Landscape/ External" },
  { type: "Fire Safety", icon: "local_fire_department", label: "Fire Safety" },
];

/** Data Interfaces */
export interface ITodo {
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  type?: TodoType;
  status?: TodoStatus;
  done: boolean;
  date?: any;
  finishDate?: any;
}

export interface IProject {
  id?: string;
  name: string;
  description: string;
  status: ProjectStatus;
  userRole: UserRole;
  finishDate: any;
  cost?: number;
  progress?: number;
}

/** Helper: Unified Date Parsing */
function parseDate(dateInput: any): Date {
  if (!dateInput) return new Date();
  if (dateInput.toDate && typeof dateInput.toDate === "function") {
    return dateInput.toDate(); 
  }
  const date = new Date(dateInput);
  return isNaN(date.getTime()) ? new Date() : date;
}

/** * TODO CLASS 
 * Representing a single task within a Project's sub-collection.
 */
export class Todo implements ITodo {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: TodoType;
  status: TodoStatus;
  done: boolean;
  date: Date;
  finishDate?: Date;
  sync: SyncStatus = "synced";

  constructor(data: Partial<ITodo>, id?: string) {
    this.id = id || data.id || uuidv4();
    this.projectId = data.projectId || "";
    this.title = data.title || "Untitled Task";
    this.description = data.description || "";
    this.type = data.type || "Planning";
    this.status = data.status || "Pending";
    this.done = data.done ?? false;
    this.date = parseDate(data.date);
    this.finishDate = data.finishDate ? parseDate(data.finishDate) : undefined;
  }

  /** Prepare task for sub-collection storage */
  toFirestore() {
    const { id, sync, ...rest } = this;
    return {
      ...rest,
      date: this.date,
      finishDate: this.finishDate || null,
    };
  }
}

/** * PROJECT CLASS 
 * Parent document that manages metadata and local Todo instances.
 */
export class Project implements IProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  userRole: UserRole;
  finishDate: Date;
  cost: number;
  progress: number;
  todos: Todo[] = []; // In-memory cache of the sub-collection
  sync: SyncStatus = "synced";

  constructor(data: Partial<IProject>, id?: string) {
    this.id = id || data.id || uuidv4();
    this.name = data.name || "Untitled Project";
    this.description = data.description || "";
    this.status = data.status || "Pending";
    this.userRole = data.userRole || "Architect";
    this.finishDate = parseDate(data.finishDate);
    this.cost = data.cost ?? 0;
    this.progress = data.progress ?? 0;
  }

  /** * NEW PROGRESS LOGIC
   * Maps 'Completed' status to the percentage.
   */
  calculateProgress() {
    if (this.todos.length === 0) {
      this.progress = 0;
      return;
    }
    // A task is completed if status is "Completed" OR if the 'done' toggle is true
    const completed = this.todos.filter((t) => t.status === "Completed" || t.done).length;
    this.progress = Math.round((completed / this.todos.length) * 100);
  }

  /** * SUB-COLLECTION COMPLIANT STORAGE
   * We explicitly remove 'todos' so they aren't saved in the Project document.
   */
  toFirestore(): IProject {
    return {
      name: this.name,
      description: this.description,
      status: this.status,
      userRole: this.userRole,
      finishDate: this.finishDate,
      cost: this.cost,
      progress: this.progress
    };
  }
}