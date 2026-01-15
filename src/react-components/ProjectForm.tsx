import * as React from "react"
import * as Firestore from "firebase/firestore"
import { IProject, Project, ProjectStatus, UserRole } from "../classes/Project"
import { ProjectsManager } from "../classes/ProjectsManager"
import { toast } from "../classes/toast"
import { getCollection } from "../firebase"

interface Props {
  project?: Project
  projectsManager: ProjectsManager
}

const projectsCollection = getCollection<IProject>("projects")

//Convert form data into a plain IProject object for Firestore
function formDataToProject(formData: FormData): IProject {
  return {
    name: String(formData.get("name")),
    description: String(formData.get("description")),
    status: formData.get("status") as ProjectStatus,
    userRole: formData.get("userRole") as UserRole,
    finishDate: new Date(String(formData.get("finishDate")))
  }
}

export function ProjectForm({ project, projectsManager }: Props) {
  const finishDate = project?.finishDate ? project.finishDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  
const onFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  const projectForm = document.getElementById("new-project-form") as HTMLFormElement
  const formData = new FormData(projectForm)
  const projectData = formDataToProject(formData)
  try {
    //Create a new project
    if (!project) {
      const docRef = await Firestore.addDoc(projectsCollection, projectData)  
      projectsManager.newProject(projectData, docRef.id)
    }else { //Edit an existing project
        projectsManager.updateProject(project.id, projectData)
    }
    projectForm.reset()
    const modal = document.getElementById("new-project-modal")
    if (modal instanceof HTMLDialogElement) modal.close()
  } catch (err) {
    toast.error(`Failed to save project: ${(err as Error).message}`)
    console.error(err)
}
}

const onFormReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const modal = document.getElementById("new-project-modal")
    if (modal instanceof HTMLDialogElement) modal.close() 
    }

  return (
    <form onSubmit={(e) => onFormSubmit(e)} onReset={onFormReset} id="new-project-form">
          <h2>New Project</h2>
          <div className="input-list">
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">apartment</span>Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="What's the name of your project?"
                defaultValue={project?.name || ""}
              />
              <p
                style={{
                  color: "gray",
                  fontSize: "var(--font-sm)",
                  marginTop: 5,
                  fontStyle: "italic"
                }}
              >
                TIP: Give it a short name
              </p>
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">subject</span>Description
              </label>
              <textarea
                name="description"
                cols={30}
                rows={5}
                placeholder="Give your project a nice description! So people will be jealous about it."
                defaultValue={project?.description ?? ""}
              />
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">person</span>Role
              </label>
              <select name="userRole" defaultValue={project?.userRole ?? "Architect"}>
                <option>Architect</option>
                <option>Engineer</option>
                <option>Developer</option>
              </select>
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">not_listed_location</span>
                Status
              </label>
              <select name="status" defaultValue={project?.status ?? "Pending"}>
                <option>Pending</option>
                <option>Active</option>
                <option>Finished</option>
              </select>
            </div>
            <div className="form-field-container">
              <label htmlFor="finishDate">
                <span className="material-icons-round">calendar_month</span>
                Finish Date
              </label>
              <input name="finishDate" type="date" defaultValue={finishDate}/>
            </div>
            <div
              style={{
                display: "flex",
                margin: "10px 0px 10px auto",
                columnGap: 10
              }}
            >
              <button type="reset" style={{ backgroundColor: "transparent" }}>
                Cancel
              </button>
              <button type="submit" style={{ backgroundColor: "rgb(18, 145, 18)" }}>
                Accept
              </button>
            </div>
          </div>
        </form>
  )
}
