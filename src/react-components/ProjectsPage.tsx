import * as React from "react";
import * as Router from "react-router-dom";
import * as Firestore from "firebase/firestore";
import { IProject, Project, ProjectStatus, UserRole } from "../classes/Project";
import { ProjectCard } from "./ProjectCard";
import { SearchBox } from "./SearchBox";
import { ProjectsManager } from "../classes/ProjectsManager";
import { toast } from "../classes/toast"
import { getCollection } from "../firebase";
import { ProjectForm } from "./ProjectForm";

interface Props {
  projectsManager: ProjectsManager
}

//Reference to "projects" collection in Firestore database.
const projectsCollection = getCollection<IProject>("projects")

export function ProjectsPage(props: Props) {
  toast.error("This is an error message")
  toast.warning("You can display a warning")
  toast.success("This is a sucess message")
  toast.info("This is to display info")
  const [projects, setProjects] = React.useState<Project[]>(props.projectsManager.list)
  
  React.useEffect(() => {
    props.projectsManager.OnProjectCreated = () => {
      setProjects([...props.projectsManager.list])
    }
    return () => {
      props.projectsManager.OnProjectCreated = () => {}
    }
  }, [props.projectsManager])

  const getFirestoreProjects = async () => {
    //QuerySnapshot containing all documents in the collection (accessible via firebaseProjects.docs)
    const firebaseProjects = await Firestore.getDocs(projectsCollection)
    //Loop through each document in the QuerySnapshot (object containin document snapshots from Firestore)
    for (const doc of firebaseProjects.docs) {
      //Retrieve each document's data using data() method
      const data = doc.data()
      //Reconstruct project object, converting finishDate from Firestore TimeStamp to Date
      const project: IProject = {
        ...data,
        finishDate: data.finishDate instanceof Firestore.Timestamp ? data.finishDate.toDate() : data.finishDate
      }

      //Check if project already exists
      if (!props.projectsManager.list.some(p => p.id === doc.id)) {
      try {
        props.projectsManager.newProject(project, doc.id)
      } catch (error) {
        toast.error("Failed to add project")
      }
      }
      setProjects([...props.projectsManager.list])
  }}

  React.useEffect(() => {
    getFirestoreProjects()
  }, [])

  const projectCards = projects.map((project) => {
    return (
      <Router.Link to={`/project/${project.id}`} key={project.id} >
        <ProjectCard project={project} />
      </Router.Link>
    )
  })

  React.useEffect(() => {
    console.log("Projects state updated", projects)
  }, [projects])

  const onNewProjectClick = () => {
    const modal = document.getElementById("new-project-modal")
    if (!(modal && modal instanceof HTMLDialogElement)) {return}
    modal.showModal()
  }

  const onExportProject = () => {
    props.projectsManager.exportToJSON()
  }

  const onImportProject = () => {
    props.projectsManager.importFromJSON()
  }

  const onProjectSearch = (value: string) => {
    setProjects(value ? props.projectsManager.filterProjects(value) : [...props.projectsManager.list])
  }

  return (
    <div className="page" id="projects-page" style={{ display: "flex" }}>
      <dialog id="new-project-modal">
         <ProjectForm projectsManager = {props.projectsManager} />
      </dialog>
      <header>
        <h2>Projects</h2>
        <SearchBox onChange={(value) => onProjectSearch(value)}/>
        <div style={{ display: "flex", alignItems: "center", columnGap: 15 }}>
          <span
            id="import-projects-btn"
            className="material-icons-round action-icon"
            onClick={onImportProject}
          >
            file_upload
          </span>
          <span
            id="export-projects-btn"
            className="material-icons-round action-icon"
            onClick={onExportProject}
          >
            file_download
          </span>
          <button onClick={onNewProjectClick} id="new-project-btn">
            <span className="material-icons-round">add</span>New Project
          </button>
        </div>
      </header>
      {
        projects.length > 0 ? <div id="projects-list">{ projectCards }</div> : <p>There is no projects to display!</p>
      }
    </div>
  )
}