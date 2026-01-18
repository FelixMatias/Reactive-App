import * as React from "react"
import * as Router from "react-router-dom"
import { ProjectsManager } from "../classes/ProjectsManager"
import { ProjectTodos } from "./ProjectTodos"
import { ThreeViewer } from "./ThreeViewer"
import { DashboardSummary } from "./DashboardSummary"
import { ProjectForm } from "./ProjectForm"
import { Project } from "../classes/Project"

interface Props {
  projectsManager: ProjectsManager
}

export function ProjectDetailsPage({ projectsManager }: Props) {
  const params = Router.useParams<{ id: string }>()
  const navigate = Router.useNavigate()
  
  // Controls Edit Form visibility
  const [isEditFormOpen, setIsEditFormOpen] = React.useState(false)
  
  const [project, setProject] = React.useState<Project | undefined>(
    projectsManager.getProject(params.id || "")
  )

  // SUBSCRIPTION: Listen for Manager changes to refresh UI
  React.useEffect(() => {
    if (!params.id) return

    const syncProject = () => {
      const updated = projectsManager.getProject(params.id!)
      if (updated) { 
        // Clone project to trigger React re-render via reference change
        setProject(new Project(updated, updated.id)) 
      }
    }

    const unsubscribeProject = projectsManager.subscribeToProjects(syncProject)
    const unsubscribeTodos = projectsManager.subscribeToTodos(syncProject)

    return () => {
      unsubscribeProject()
      unsubscribeTodos()
    }
  }, [params.id, projectsManager])

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/)
    return words.length >= 2 
      ? (words[0][0] + words[1][0]).toUpperCase() 
      : name.substring(0, 2).toUpperCase()
  }

  if (!project) { 
    return (
      <div className="page" style={{ padding: "40px" }}>
        <h2 style={{ color: "var(--error)" }}>Project not found</h2>
        <button onClick={() => navigate("/")} className="btn-secondary" style={{ marginTop: "20px" }}>
          Go Back to Dashboard
        </button>
      </div>
    ) 
  }

  return (
    <div className="page" id="project-details">
      {/* Integration of the Form with project data passed in */}
      <ProjectForm 
        open={isEditFormOpen} 
        onClose={() => setIsEditFormOpen(false)} 
        projectsManager={projectsManager} 
        project={project}
      />

      <header>
        <div>
          <h2 data-project-info="name">{project.name}</h2>
          <p data-project-info="description" style={{ color: "rgba(150,150,150,1)", marginTop: "5px" }}>
            {project.description}
          </p>
        </div>
        {/* Toggle the Edit Form State */}
        <button className="btn-secondary" onClick={() => setIsEditFormOpen(true)}>
          <span className="material-icons-round">edit</span>
          Edit Project
        </button>
      </header>

      <div className="main-page-content">
        <aside style={{ display: "flex", flexDirection: "column", rowGap: "10px" }}>
          <DashboardSummary project={project} />

          <div className="dashboard-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <div style={{ 
                display: "flex", backgroundColor: "var(--primary)", width: "50px", height: "50px", 
                borderRadius: "10px", alignItems: "center", justifyContent: "center" 
              }}>
                <p style={{ fontSize: "var(--font-xl)", color: "white", fontWeight: "bold", margin: 0 }}>
                    {getInitials(project.name)}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                 <p style={{ color: "rgba(150,150,150,1)", fontSize: "var(--font-sm)", margin: 0 }}>STATUS</p>
                 <p style={{ color: "var(--primary-400)", fontWeight: 600, margin: 0 }}>{project.status}</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", rowGap: "10px" }}>
                <div className="card-property">
                  <p style={{ color: "rgba(150,150,150,1)" }}>Cost</p>
                  <p style={{ fontWeight: 500 }}>${project.cost.toLocaleString()}</p>
                </div>
                <div className="card-property">
                  <p style={{ color: "rgba(150,150,150,1)" }}>Role</p>
                  <p style={{ fontWeight: 500 }}>{project.userRole}</p>
                </div>
                <div className="card-property">
                  <p style={{ color: "rgba(150,150,150,1)" }}>Finish Date</p>
                  <p style={{ fontWeight: 500 }}>{project.finishDate.toLocaleDateString()}</p>
                </div>
            </div>

            <div style={{ marginTop: "25px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <p style={{ margin: 0, fontSize: "var(--font-sm)", color: "rgba(150,150,150,1)" }}>Completion</p>
                <p style={{ margin: 0, fontSize: "var(--font-sm)", color: "var(--primary-400)", fontWeight: "bold" }}>
                  {project.progress}%
                </p>
              </div>
              <div style={{ backgroundColor: "var(--background-200)", height: "8px", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ 
                    width: `${project.progress}%`, 
                    backgroundColor: "var(--primary)", 
                    height: "100%", 
                    transition: "width 0.4s ease-in-out" 
                }} />
              </div>
            </div>
          </div>

          <ProjectTodos projectId={project.id} projectsManager={projectsManager} />
        </aside>

        <div style={{ 
          position: "relative", 
          borderRadius: "8px", 
          overflow: "hidden", 
          backgroundColor: "#000",
          border: "1px solid var(--background-200)",
          minHeight: "600px" 
        }}>
            <ThreeViewer />
        </div>
      </div>
    </div>
  )
}