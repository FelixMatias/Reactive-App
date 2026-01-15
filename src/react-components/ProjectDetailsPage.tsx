import * as React from "react"
import * as Router from "react-router-dom"
import { ProjectsManager } from "../classes/ProjectsManager"
import { toast } from "../classes/toast"
import { ThreeViewer } from "./ThreeViewer"
import { deleteDocument, updateDocument } from "../firebase"
import { IProject } from "../classes/Project"
import { ProjectForm } from "./ProjectForm"

interface Props {
  projectsManager: ProjectsManager
}

export function ProjectDetailsPage(props: Props) {
  const routeParams = Router.useParams<{id: string}>()
  const navigateTo = Router.useNavigate()
  toast.info("Just a test")
  if (!routeParams.id) toast.error(`Project ID is needed to see this page`)
  //useState store the project to updates UI
  const [project, setProject] = React.useState(props.projectsManager.getProject(routeParams.id)!)
  
  if (!project) toast.error(`Project ID {routeParams.id} wasn't found`)
  
  React.useEffect(() => {
    //Preserve ProjectsManager's integrity during the component lifecycle to prevent side effects
    const originalOnDeleted = props.projectsManager.OnProjectDeleted
    const originalOnUpdated = props.projectsManager.OnProjectUpdated

    props.projectsManager.OnProjectDeleted = async (id) => {
      await deleteDocument("/projects", id)
      navigateTo("/")
    }  
    props.projectsManager.OnProjectUpdated = async (id, updatedProject) => {
      // Update Firestore
      await updateDocument<IProject>("/projects", id, updatedProject)
      //Update local state with data from Firestore for refresh UI 
      setProject((prev) => {
        if (!prev) return prev
        return { ...prev, ...updatedProject}
      })
    }
    }, [props.projectsManager, navigateTo])

    const onProjectEdit = () => {
      const modal = document.getElementById("new-project-modal")
      if (!(modal && modal instanceof HTMLDialogElement)) {return}
      modal.showModal()
    }

    

  return (
    <div className="page" id="project-details">
      <header>
        <div>
          <h2 data-project-info="name">{project.name}</h2>
          <p style={{ color: "#969696" }}>{project.description}</p>
        </div>
        <button onClick={() => props.projectsManager.deleteProject(project.id)} style={{backgroundColor: "red"}}>Delete Project</button>
      </header>
      <div className="main-page-content">
        <div style={{ display: "flex", flexDirection: "column", rowGap: 30 }}>
          <div className="dashboard-card" style={{ padding: "30px 0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0px 30px",
                marginBottom: 30
              }}
            >
              <p
                style={{
                  fontSize: 20,
                  backgroundColor: "#ca8134",
                  aspectRatio: 1,
                  borderRadius: "100%",
                  padding: 12
                }}
              >
                HC
              </p>
              <button onClick={onProjectEdit} className="btn-secondary">
                <p style={{ width: "100%" }}>Edit</p>
              </button>
            </div>
            <div style={{ padding: "0 30px" }}>
              <div>
                <h5>{project.name}</h5>
                <p>{project.description}</p>
              </div>
              <div
                style={{
                  display: "flex",
                  columnGap: 30,
                  padding: "30px 0px",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Status
                  </p>
                  <p>{project.status}</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Cost
                  </p>
                  <p>$ {project.cost}</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Role
                  </p>
                  <p>{project.userRole}</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Finish Date
                  </p>
                  <p>{project.finishDate instanceof Date ? project.finishDate.toDateString() : new Date(project.finishDate).toDateString()}</p>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#404040",
                  borderRadius: 9999,
                  overflow: "auto"
                }}
              >
                <div
                  style={{
                    width: `${project.progress * 100}%`,
                    backgroundColor: "green",
                    padding: "4px 0",
                    textAlign: "center"
                  }}
                >
                  {project.progress * 100}%
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-card" style={{ flexGrow: 1 }}>
            <div
              style={{
                padding: "20px 30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <h4>To-Do</h4>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "end",
                  columnGap: 20
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", columnGap: 10 }}
                >
                  <span className="material-icons-round">search</span>
                  <input
                    type="text"
                    placeholder="Search To-Do's by name"
                    style={{ width: "100%" }}
                  />
                </div>
                <span className="material-icons-round">add</span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "10px 30px",
                rowGap: 20
              }}
            >
              <div className="todo-item">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div
                    style={{ display: "flex", columnGap: 15, alignItems: "center" }}
                  >
                    <span
                      className="material-icons-round"
                      style={{
                        padding: 10,
                        backgroundColor: "#686868",
                        borderRadius: 10
                      }}
                    >
                      construction
                    </span>
                    <p>Make anything here as you want, even something longer.</p>
                  </div>
                  <p style={{ marginLeft: 10 }}>Fri, 20 sep</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ThreeViewer />
        <dialog id="new-project-modal">
           <ProjectForm project={project} projectsManager = {props.projectsManager} />
        </dialog>
      </div>
    </div>
  );
}