import * as Firestore from "firebase/firestore";
import { IProject, Project, ITodo, Todo } from "./Project";
import { toast } from "./toast";
import { getCollection, updateDocument, addDocument, deleteDocument, getDocuments } from "../firebase";

// Types for the "Observer Pattern" - allows the UI to listen for data changes
type ProjectListener = () => void;
type TodoListener = (projectId: string) => void;

export class ProjectsManager {
    list: Project[] = []; // Our local "Source of Truth" for the UI
    private projectListeners = new Set<ProjectListener>();
    private todoListeners = new Set<TodoListener>();

    // Reference to the top-level "projects" folder in Firebase
    private projectsCollection = getCollection<IProject>("projects");

    /** --- SUBSCRIPTIONS (Observer Pattern) --- 
     * These allow React components to "subscribe" to changes. 
     * When data changes, we call these listeners to trigger a re-render.
     */
    subscribeToProjects(listener: ProjectListener) {
        this.projectListeners.add(listener);
        return () => this.projectListeners.delete(listener);
    }

    subscribeToTodos(listener: TodoListener) {
        this.todoListeners.add(listener);
        return () => this.todoListeners.delete(listener);
    }

    private emitProjectChange() {
        this.projectListeners.forEach((fn) => fn());
    }

    private emitTodoChange(projectId: string) {
        this.todoListeners.forEach((fn) => fn(projectId));
    }

    /** --- SMART FETCHING: HIERARCHICAL DATA --- 
     * Step 1: Get all Project documents.
     * Step 2: For each project, go into its "sub-folder" (sub-collection) to get its specific Todos.
     */
    async fetchFromFirestore() {
        try {
            // Fetch main project documents
            const snapshot = await Firestore.getDocs(this.projectsCollection);
            this.list = snapshot.docs.map(doc => new Project(doc.data() as IProject, doc.id));

            // Dynamic Path Strategy: Fetching tasks for each project individually
            for (const project of this.list) {
                const todosPath = `projects/${project.id}/todos`; // The nested path
                const todosData = await getDocuments<ITodo>(todosPath);
                
                // Convert raw data into Todo class instances
                project.todos = todosData.map(data => new Todo(data, data.id));
                project.calculateProgress(); // Update the bar based on fetched data
            }

            this.emitProjectChange(); // Tell the UI projects are ready
        } catch (err) {
            console.error(err);
            toast.error("Database connection failed. Viewing offline data.");
        }
    }

    getProject(id: string) {
        return this.list.find((p) => p.id === id);
    }

    /** --- PROJECT CRUD --- */
    newProject(data: Partial<IProject>) {
        const project = new Project(data as IProject);
        project.sync = "pending"; // Visual feedback for the user
        
        this.list.push(project); // Local first! (Optimistic)
        this.emitProjectChange();

        addDocument("projects", project.toFirestore())
            .then((id) => {
                project.id = id;
                project.sync = "synced";
                this.emitProjectChange();
            })
            .catch((err) => {
                project.sync = "error";
                this.emitProjectChange();
                toast.error("Cloud sync failed: " + err.message);
            });
    }

    updateProject(id: string, data: Partial<IProject>) {
        const project = this.getProject(id);
        if (!project) return;

        Object.assign(project, data); // Update local memory
        project.sync = "pending";
        this.emitProjectChange();

        // Surgical Update: Only sends the changed project fields to Firebase
        updateDocument("projects", id, project.toFirestore())
            .then(() => {
                project.sync = "synced";
                this.emitProjectChange();
            })
            .catch((err) => {
                project.sync = "error";
                this.emitProjectChange();
                toast.error("Update failed: " + err.message);
            });
    }

    deleteProject(id: string) {
        const index = this.list.findIndex(p => p.id === id);
        if (index === -1) return;

        this.list.splice(index, 1); // Remove from screen instantly
        this.emitProjectChange();

        deleteDocument("projects", id).catch((err) => {
            toast.error("Delete failed on server.");
            console.error(err);
        });
    }

    /** --- TODO CRUD (SUB-COLLECTION LOGIC) --- */

    addTodo(projectId: string, todoData: Partial<ITodo>) {
        const project = this.getProject(projectId);
        if (!project) return;

        const newTodo = new Todo({ ...todoData, projectId } as ITodo);
        newTodo.sync = "pending";
        
        project.todos.push(newTodo); // Add to local array
        project.calculateProgress(); // Recalculate % immediately

        this.emitTodoChange(projectId);
        this.emitProjectChange();

        // FILE INTO FOLDER: uses project ID to find the right sub-collection
        const path = `projects/${projectId}/todos`;
        addDocument(path, newTodo.toFirestore())
            .then((id) => {
                newTodo.id = id;
                newTodo.sync = "synced";
                this.emitTodoChange(projectId);
            })
            .catch(() => {
                newTodo.sync = "error";
                this.emitTodoChange(projectId);
                toast.error("Task failed to sync");
            });
    }

    updateTodo(projectId: string, todoData: Partial<ITodo>) {
        const project = this.getProject(projectId);
        if (!project || !todoData.id) return;

        const todo = project.todos.find(t => t.id === todoData.id);
        if (!todo) return;

        Object.assign(todo, todoData); // Local update
        todo.sync = "pending";
        project.calculateProgress(); // Live progress bar update

        this.emitTodoChange(projectId);
        this.emitProjectChange();

        // SURGICAL TODO UPDATE: Targets specific todo "file" in the sub-collection
        const path = `projects/${projectId}/todos`;
        updateDocument(path, todo.id, todo.toFirestore())
            .then(() => {
                todo.sync = "synced";
                this.emitTodoChange(projectId);
            })
            .catch(() => {
                todo.sync = "error";
                this.emitTodoChange(projectId);
            });
    }

    /** * NEW: deleteTodo handles the "Erase from Cloud" logic.
     * Uses the path to the sub-collection so deleteDocument knows where to go.
     */
    async deleteTodo(projectId: string, todoId: string) {
        const project = this.getProject(projectId);
        if (!project) return;

        // Local Update: Filter out the todo to remove it from the UI immediately
        project.todos = project.todos.filter(t => t.id !== todoId);
        project.calculateProgress(); // डिनोमिनेटर (Denominator) changed, recalculate progress
        
        this.emitTodoChange(projectId);
        this.emitProjectChange();

        // Firebase Cloud Update
        const path = `projects/${projectId}/todos`;
        try {
            await deleteDocument(path, todoId);
        } catch (err) {
            toast.error("Failed to delete task from cloud.");
        }
    }

    /** --- HELPERS --- */
    filterProjects(value: string) {
        const query = value.toLowerCase();
        return this.list.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query)
        );
    }
}