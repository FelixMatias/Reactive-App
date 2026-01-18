import * as React from "react";
import { Project } from "../classes/Project";

interface Props {
  project: Project;
}

export function ProjectCard({ project }: Props) {
  /** * NEW LOGIC: Checks if the project metadata OR any task 
   * inside its sub-collection is currently syncing.
   */
  const isPendingSync =
    project.sync === "pending" || project.todos.some((t) => t.sync === "pending");

  // Get initials for the avatar (e.g., "Hospital Center" -> "HC")
  const initials = project.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`project-card ${isPendingSync ? "syncing" : ""}`}>
      <div className="card-header">
        <p
          style={{
            backgroundColor: "#ca8134",
            padding: 10,
            borderRadius: 8,
            aspectRatio: "1/1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            margin: 0
          }}
        >
          {initials}
        </p>
        <div>
          <h5 style={{ display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
            {project.name}
            {isPendingSync && (
              <span 
                className="material-icons-round spinning" 
                style={{ fontSize: 16, color: "orange" }}
                title="Syncing with cloud database..."
              >
                sync
              </span>
            )}
          </h5>
          <p className="description-text" style={{ margin: 0 }}>{project.description}</p>
        </div>
      </div>

      <div className="card-content">
        <div className="card-property">
          <p className="label">Status</p>
          <p>{project.status}</p>
        </div>
        <div className="card-property">
          <p className="label">Role</p>
          <p>{project.userRole}</p>
        </div>
        <div className="card-property">
          <p className="label">Cost</p>
          <p>${project.cost.toLocaleString()}</p>
        </div>
        <div className="card-property">
          <p className="label">Estimated Progress</p>
          {/* Automatically reflects the sub-collection task completion */}
          <p>{project.progress}%</p>
        </div>
      </div>

      {/* Progress Bar Visualization */}
      <div className="progress-bar-container" style={{ padding: "0 20px 10px" }}>
        <div className="progress-bar-bg" style={{ height: 4, background: "#eee", borderRadius: 2 }}>
           <div 
             className="progress-bar-fill" 
             style={{ 
               width: `${project.progress}%`, 
               height: "100%", 
               background: "#ca8134", 
               borderRadius: 2,
               transition: "width 0.3s ease" 
             }} 
           />
        </div>
      </div>

      {isPendingSync && (
        <div style={{ padding: "0 20px 10px 20px" }}>
            <p style={{ color: "orange", fontSize: "11px", fontStyle: "italic", margin: 0 }}>
                Updating cloud data...
            </p>
        </div>
      )}
    </div>
  );
}