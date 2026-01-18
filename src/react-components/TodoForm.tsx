import * as React from "react";
import { Todo, ITodo, TODO_TYPES, TodoType, TodoStatus } from "../classes/Project";
import { ProjectsManager } from "../classes/ProjectsManager";

const STATUS_OPTIONS: { status: TodoStatus; icon: string; label: string; activeColor: string; activeBg: string }[] = [
  { status: "Pending", icon: "hourglass_empty", label: "Pending", activeColor: "#b22222", activeBg: "#ffcccc" },
  { status: "Assigned", icon: "person_add", label: "Assigned", activeColor: "#d2691e", activeBg: "#ffe4b5" },
  { status: "In Progress", icon: "pending", label: "In Process", activeColor: "#8b8000", activeBg: "#ffffcc" },
  { status: "Completed", icon: "check_circle", label: "Done", activeColor: "#129112", activeBg: "#e7f4e7" },
];

interface Props {
  projectId: string;
  projectsManager: ProjectsManager;
  todo?: Todo;
  open: boolean;
  onClose: () => void;
  userTitle?: string;
}

export function TodoForm({ projectId, projectsManager, todo, open, onClose, userTitle = "" }: Props) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<TodoType>("Planning");
  const [selectedStatus, setSelectedStatus] = React.useState<TodoStatus>("Pending");
  const [startDate, setStartDate] = React.useState("");
  const [finishDate, setFinishDate] = React.useState("");

  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    if (open) {
      setTitle(todo?.title || userTitle);
      setDescription(todo?.description || "");
      setSelectedType(todo?.type || "Planning");
      setSelectedStatus(todo?.status || "Pending");
      
      const start = todo?.date ? new Date(todo.date) : new Date();
      const finish = todo?.finishDate ? new Date(todo.finishDate) : new Date();
      
      setStartDate(start.toISOString().split("T")[0]);
      setFinishDate(finish.toISOString().split("T")[0]);
      
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [todo, open, userTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todoData: Partial<ITodo> = {
      title: title.trim(),
      description: description.trim(),
      type: selectedType,
      status: selectedStatus,
      date: new Date(startDate),
      finishDate: new Date(finishDate),
      done: selectedStatus === "Completed", 
    };

    if (todo) {
      projectsManager.updateTodo(projectId, { ...todoData, id: todo.id });
    } else {
      projectsManager.addTodo(projectId, todoData);
    }
    onClose();
  };

  const onDeleteClick = async () => {
    if (!todo) return;
    if (confirm(`Are you sure you want to delete "${todo.title}"?`)) {
      await projectsManager.deleteTodo(projectId, todo.id);
      onClose();
    }
  };

  return (
    <dialog ref={dialogRef} onCancel={onClose} className="modal-container" style={{ padding: 0, border: 'none', borderRadius: '8px' }}>
      <form onSubmit={handleSubmit} className="dashboard-card" style={{ padding: '25px', width: '420px' }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '15px' }}>
            <h2 style={{ margin: 0 }}>{todo ? "Edit Task" : "New Task"}</h2>
            {todo && (
                <button type="button" onClick={onDeleteClick} style={{ color: "#d9534f", border: "none", background: "none" }}>
                  <span className="material-icons-round">delete</span>
                </button>
            )}
        </div>
        
        {/* 1. Title */}
        <div className="form-field-container">
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Install HVAC Vents" />
        </div>

        {/* 2. Description (Added after Title) */}
        <div className="form-field-container">
          <label style={{marginTop:"15px"}}>Description</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows={3} 
            placeholder="Technical details for the trade..."
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--background-200)", background: "var(--background-100)", color: "white" }}
          ></textarea>
        </div>

        {/* 3. Work Package */}
        <div className="form-field-container" >
          <label style={{marginTop:"15px"}}>Work Package (Type)</label>
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", padding: "10px 0" }}>
            {TODO_TYPES.map(t => (
              <div 
                key={t.type} 
                onClick={() => setSelectedType(t.type)} 
                style={{
                  cursor: "pointer", padding: "8px", borderRadius: "8px", textAlign: "center", minWidth: "85px",
                  background: selectedType === t.type ? "var(--background-100)" : "var(--background-200)", 
                  color: selectedType === t.type ? "var(--primary)" : "#666",
                  border: `1px solid ${selectedType === t.type ? "var(--primary)" : "transparent"}`,
                  transition: "all 0.2s ease"
                }}
              >
                <span className="material-icons-round">{t.icon}</span>
                <div style={{ fontSize: "11px", marginTop: "4px" }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Status & Dates (Rest of Form) */}
        <div className="form-field-container">
          <label style={{marginTop:"15px"}}>Current Status</label>
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", padding: "10px 0" }}>
            {STATUS_OPTIONS.map(s => {
              const isActive = selectedStatus === s.status;
              return (
                <div key={s.status} onClick={() => setSelectedStatus(s.status)} 
                  style={{
                    cursor: "pointer", padding: "8px", borderRadius: "8px", textAlign: "center", minWidth: "80px",
                    background: isActive ? s.activeBg : "var(--background-200)", color: isActive ? s.activeColor : "#666",
                    border: `1px solid ${isActive ? s.activeColor : "transparent"}`
                  }}>
                  <span className="material-icons-round">{s.icon}</span>
                  <div style={{ fontSize: "10px", marginTop: "4px" }}>{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
          <div className="form-field-container" style={{ flex: 1 }}>
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-field-container" style={{ flex: 1 }}>
            <label>Finish Date</label>
            <input type="date" value={finishDate} onChange={e => setFinishDate(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "30px" }}>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" style={{ backgroundColor: "#ca8134", color: "white" }}>
            {todo ? "Update Task" : "Create Task"}
          </button>
        </div>
      </form>
    </dialog>
  );
}