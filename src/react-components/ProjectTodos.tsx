import * as React from "react";
import { Todo } from "../classes/Project";
import { ProjectsManager } from "../classes/ProjectsManager";
import { TodoCard } from "./TodoCard";
import { TodoForm } from "./TodoForm";
import { SearchBox } from "./SearchBox";

interface Props {
  projectId: string;
  projectsManager: ProjectsManager;
}

export function ProjectTodos({ projectId, projectsManager }: Props) {
  const [todos, setTodos] = React.useState<Todo[]>([]);
  const [filterValue, setFilterValue] = React.useState("");
  const [showDialog, setShowDialog] = React.useState(false);
  const [editingTodo, setEditingTodo] = React.useState<Todo | undefined>(undefined);

  React.useEffect(() => {
    /** * SYNC LOGIC: 
     * Pulls the latest todos array from the specific Project instance.
     */
    const syncWithManager = () => {
      const project = projectsManager.getProject(projectId);
      if (project) {
        // We create a new array reference to ensure React detects the change
        setTodos([...project.todos]);
      }
    };

    // Initial load
    syncWithManager();

    /** * SUB-COLLECTION SUBSCRIPTION:
     * We listen to 'TodoChange' events. When a task in the sub-collection 
     * is added, edited, or deleted, this component will re-sync.
     */
    const unsubscribe = projectsManager.subscribeToTodos(() => {
      syncWithManager();
    });

    return unsubscribe;
  }, [projectId, projectsManager]);

  // UI Logic: Filtering by text and Sorting by the finish date
  const filteredAndSortedTodos = todos
    .filter((todo) =>
      todo.title.toLowerCase().includes(filterValue.toLowerCase()) ||
      (todo.description && todo.description.toLowerCase().includes(filterValue.toLowerCase()))
    )
    .sort((a, b) => {
      const timeA = a.finishDate ? new Date(a.finishDate).getTime() : 0;
      const timeB = b.finishDate ? new Date(b.finishDate).getTime() : 0;
      return timeB - timeA; 
    });

  const handleTodoClick = (todo: Todo) => {
    setEditingTodo(todo);
    setShowDialog(true);
  };

  const handleAddClick = () => {
    setEditingTodo(undefined);
    setShowDialog(true);
  };

  return (
    <div className="dashboard-card" style={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ 
        padding: "15px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        borderBottom: "1px solid #eee" 
      }}>
        <h4 style={{ marginRight: "10px" }}>Tasks</h4>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <SearchBox 
            onChange={(val) => setFilterValue(val)} 
            placeholder="Filter tasks..." 
          />
          <button 
            className="btn-secondary" 
            onClick={handleAddClick}
            style={{ 
                borderRadius: "8px", 
                width: 35, 
                height: 35, 
                padding: 0, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
            }}
          >
            <span className="material-icons-round">add</span>
          </button>
        </div>
      </div>

      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        padding: "12px 6px", 
        maxHeight: "500px",
        overflowY: "auto",
        rowGap: "10px" 
      }}>
        {filteredAndSortedTodos.length > 0 ? (
          filteredAndSortedTodos.map((todo) => (
            <div key={todo.id} onClick={() => handleTodoClick(todo)} style={{ cursor: "pointer" }}>
              <TodoCard todo={todo} />
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#969696" }}>
            <span className="material-icons-round" style={{ fontSize: 40, marginBottom: 10 }}>
              {filterValue ? "search_off" : "assignment"}
            </span>
            <p style={{ fontSize: "13px", margin: 0 }}>
                {filterValue ? "No matches found." : "No tasks in this work package yet."}
            </p>
          </div>
        )}
      </div>

      <TodoForm
        projectId={projectId}
        projectsManager={projectsManager}
        open={showDialog}
        onClose={() => setShowDialog(false)}
        todo={editingTodo}
        userTitle={filterValue} 
      />
    </div>
  );
}