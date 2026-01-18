import * as React from "react"
import { ProjectsManager } from "../classes/ProjectsManager"
import { Project, IProject, ProjectStatus, UserRole } from "../classes/Project"

interface Props {
  open: boolean
  onClose: () => void
  projectsManager: ProjectsManager
  project?: Project // If provided, the form enters "Edit Mode"
}

export function ProjectForm({ open, onClose, projectsManager, project }: Props) {
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  /**
   * DIALOG LIFECYCLE CONTROLLER
   * Synchronizes the Boolean 'open' prop with the native browser <dialog> element.
   */
  React.useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal() // Standard browser method for modals
    } else {
      if (dialog.open) dialog.close()
    }
  }, [open])

  /**
   * FORM SUBMISSION HANDLER
   * Extracts data from the form and decides whether to CREATE or UPDATE via the Manager.
   */
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    // Construct the data object following the IProject interface
    const projectData: Partial<IProject> = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus, // Note: Values are capitalized (e.g., "Active")
      userRole: formData.get("userRole") as UserRole,
      finishDate: new Date(formData.get("finishDate") as string),
      cost: Number(formData.get("cost")),
    }

    if (project && project.id) {
      // MODE: EDIT -> Triggers the update logic in the controller
      projectsManager.updateProject(project.id, projectData)
    } else {
      // MODE: CREATE -> Adds a new entry to the Firestore 'projects' collection
      projectsManager.newProject(projectData as IProject)
    }

    onClose() // Closes the modal after logic is fired
  }

  // Pre-formatting the date string for the HTML <input type="date"> (format: YYYY-MM-DD)
  const formattedDate = project?.finishDate 
    ? new Date(project.finishDate).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0]

  return (
    <dialog 
      ref={dialogRef} 
      onClose={onClose} // Syncs state if the user presses the 'Esc' key
      style={{ padding: 0, border: "none", borderRadius: "8px", background: "transparent" }}
    >
      <form onSubmit={onFormSubmit} className="dashboard-card" style={{ padding: "5px", width: "460px" }}>
        <h2 style={{ marginBottom: "10px" }}>
          {project ? "Edit Project" : "New Project"}
        </h2>
        
        <div className="input-list" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div className="form-field-container">
            <label style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
              <span className="material-icons-round" style={{ fontSize: "18px" }}>label</span>
              Project Name
            </label>
            <input name="name" type="text" defaultValue={project?.name} placeholder="e.g. Hospital Wing A" required />
          </div>

          <div className="form-field-container">
            <label style={{ marginBottom: "8px", display: "block" }}>Description</label>
            <textarea name="description" rows={4} defaultValue={project?.description} placeholder="Overview of the BIM scope..."></textarea>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="form-field-container">
              <label style={{ marginBottom: "8px", display: "block" }}>Status</label>
              <select name="status" defaultValue={project?.status || "Active"}>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Finished">Finished</option>
              </select>
            </div>

            <div className="form-field-container">
              <label style={{ marginBottom: "8px", display: "block" }}>User Role</label>
              <select name="userRole" defaultValue={project?.userRole || "Architect"}>
                <option value="Architect">Architect</option>
                <option value="Engineer">Engineer</option>
                <option value="Developer">Developer</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
             <div className="form-field-container">
                <label style={{ marginBottom: "8px", display: "block" }}>Finish Date</label>
                <input name="finishDate" type="date" defaultValue={formattedDate} required />
              </div>

              <div className="form-field-container">
                <label style={{ marginBottom: "8px", display: "block" }}>Budget (USD)</label>
                <input name="cost" type="number" defaultValue={project?.cost || 0} required />
              </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px", marginTop: "20px" }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-secondary" >
              {project ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  )
}