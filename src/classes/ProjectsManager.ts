import { IProject, Project } from "./Project"

export class ProjectsManager {
  list: Project[] = []
  OnProjectCreated: (project: Project) => void = () => {} 
  OnProjectDeleted: (id: string) => void = () =>{}
  OnProjectUpdated: (id: string, project: IProject) => Promise<void> = async () => {}

  filterProjects(value: string) {
    const filteredProjects = this.list.filter((project) => {
      return project.name.includes(value)
    })
    return filteredProjects
  }

  newProject(data: IProject, id?: string) {
    const projectNames = this.list.map((project) => {
      return project.name
    })
    const nameInUse = projectNames.includes(data.name)
    if (nameInUse) {
      throw new Error(`A project with the name "${data.name}" already exists`)
    }
    const project = new Project(data, id)
    this.list.push(project)
    this.OnProjectCreated(project)
    return project
  }

  getProject(id: string) {
    const project = this.list.find((project) => {
      return project.id === id
    })
    return project
  }
  
  deleteProject(id: string) {
    const project = this.getProject(id)
    if (!project) { return }
    const remaining = this.list.filter((project) => {
      return project.id !== id
    })
    this.list = remaining
    this.OnProjectDeleted(id)
  }

  updateProject(id: string, data: Partial<Project>) {
    const project = this.getProject(id)
    if (!project) return
    Object.assign(project, data)
    this.OnProjectUpdated(id, {
    name: project.name,
    description: project.description,
    status: project.status,
    userRole: project.userRole,
    finishDate: project.finishDate,
    cost: project.cost,
    progress: project.progress
  })
  }
  
  exportToJSON(fileName: string = "projects") {
    const json = JSON.stringify(this.list, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }
  
  importFromJSON() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      const json = reader.result
      if (!json) { return }
      const projects: IProject[] = JSON.parse(json as string)
      for (const project of projects) {
        try {
          this.newProject(project)
        } catch (error) {
          
        }
      }
    })
    input.addEventListener('change', () => {
      const filesList = input.files
      if (!filesList) { return }
      reader.readAsText(filesList[0])
    })
    input.click()
  }
}