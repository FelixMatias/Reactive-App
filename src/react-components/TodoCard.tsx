import * as React from "react";
import { Todo, TODO_TYPES } from "../classes/Project";

/** * STATUS STYLING
 * Matches your construction pipeline with clear visual cues.
 */
const STATUS_STYLES: Record<string, { icon: string; color: string; bg: string }> = {
  "Pending": { icon: "hourglass_empty", color: "#b22222", bg: "#ffcccc" }, // Red
  "Assigned": { icon: "person_add", color: "#d2691e", bg: "#ffe4b5" },    // Orange
  "In Progress": { icon: "pending", color: "#8b8000", bg: "#ffffcc" },     // Yellow
  "Completed": { icon: "check_circle", color: "#129112", bg: "#e7f4e7" },  // Green
};

interface Props {
  todo: Todo;
}

export function TodoCard({ todo }: Props) {
  // 1. Identify if this specific sub-collection document is waiting for Firebase
  const isSyncing = todo.sync === "pending";

  // 2. Fetch the correct trade icon (Plumbing, Electrical, etc.) from the global list
  const typeInfo = TODO_TYPES.find((t) => t.type === todo.type);
  const typeIcon = typeInfo ? typeInfo.icon : "construction";
  
  // 3. Get the color and icon for the current workflow status
  const currentStatus = todo.status || "Pending";
  const style = STATUS_STYLES[currentStatus] || STATUS_STYLES["Pending"];

  /** * Helper: Date Formatting
   * Uses en-GB for a clean "17 Jan" format suitable for small cards.
   */
  const formatDate = (date?: Date) => {
    return date ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : "---";
  };

  return (
    <div 
      className={`todo-item ${isSyncing ? "syncing" : ""}`} 
      style={{ 
        backgroundColor: style.bg,
        borderLeft: `6px solid ${style.color}`,
        opacity: isSyncing ? 0.7 : 1,
        padding: "5px",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
      }}
    >
      {/* Left Section: Icon and Task Info */}
      <div style={{ display: "flex", columnGap: 15, alignItems: "center" }}>
        <span className="material-icons-round" style={{ 
          padding: 10, borderRadius: 8, backgroundColor: "#686868", color: "white", fontSize: "20px" 
        }} title={todo.type}>
          {typeIcon}
        </span>
        <div>
          <p style={{ margin: 0, fontWeight: 600, color: "#222", fontSize: "14px"}}>{todo.title}</p>
          <p style={{ margin: 0, color: "#555", fontSize: "12px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {todo.description || "No description provided"}
          </p>
        </div>
      </div>

      {/* Right Section: Deadlines and Status Icon */}
      <div style={{ display: "flex", alignItems: "center", columnGap: 20 }}>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end"}}>
          <div style={{ display: "flex", alignItems: "center", width: "32px", justifyContent: "center" }}>
            {isSyncing ? (
              <span className="material-icons-round spinning" style={{ color: "orange", fontSize: "24px" }}>
                sync
              </span>
            ) : (
              <span 
                className="material-icons-round" 
                style={{ color: style.color, fontSize: "20px" }}
                title={currentStatus}
              >
                {style.icon}
              </span>
            )}
          </div>
          <span style={{ fontSize: "10px", color: "#666", textTransform: "uppercase", fontWeight: "bold" }}>
            Start: {formatDate(todo.date)}
          </span>
          <span style={{ fontSize: "11px", color: "#222", textTransform: "uppercase", fontWeight: "800" }}>
            Finish: {formatDate(todo.finishDate)}
          </span>
        </div>
        
      </div>
    </div>
  );
}