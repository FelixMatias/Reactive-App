import * as React from "react";
import { Project, TodoStatus } from "../classes/Project";

interface Props {
  project: Project;
}

export function DashboardSummary({ project }: Props) {
  // Logic: Count todos by status
  const stats = project.todos.reduce((acc, todo) => {
    const status = todo.status || "Pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<TodoStatus, number>);

  // Configuration using your design tokens
  const statusConfig: Record<TodoStatus, { label: string; color: string; icon: string }> = {
    "Pending": { label: "Pending", color: "#b22222", icon: "history" },
    "Assigned": { label: "Assigned", color: "var(--warning)", icon: "person" },
    "In Progress": { label: "In Process", color: "var(--primary-400)", icon: "trending_up" },
    "Completed": { label: "Done", color: "var(--success)", icon: "task_alt" },
  };

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(4, 1fr)", 
      gap: "6px"
    }}>
      {(Object.keys(statusConfig) as TodoStatus[]).map((status) => {
        const count = stats[status] || 0;
        const config = statusConfig[status];
        
        return (
          <div key={status} className="dashboard-card" style={{ 
            padding: "5px", 
            alignItems: "center",
            justifyContent: "center",
            borderBottom: `3px solid ${config.color}`,
            backgroundColor: "var(--background-100)", // Using your sidebar color
            transition: "transform 0.2s ease"
          }}>
            <span className="material-icons-round" style={{ 
                color: config.color, 
                fontSize: "20px",
                marginBottom: "4px"
            }}>
              {config.icon}
            </span>
            <h3 style={{ 
                margin: 0, 
                fontSize: "var(--font-xl)", 
                color: "white",
                fontWeight: "700" 
            }}>
                {count}
            </h3>
            <p style={{ 
                margin: 0, 
                fontSize: "9px", 
                color: "rgba(150,150,150,1)", 
                textTransform: "uppercase", 
                fontWeight: "800",
                letterSpacing: "0.5px"
            }}>
              {config.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}