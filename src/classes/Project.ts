import { v4 as uuidv4 } from 'uuid'

export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"

export interface IProject {
  name: string
	description: string
	status: ProjectStatus
	userRole: UserRole
	finishDate: Date
  cost?: number
  progress?: number
  id?: string
}

export class Project implements IProject {
	//To satisfy IProject
  name: string
	description: string
	status: "Pending" | "Active" | "Finished"
	userRole: "Architect" | "Engineer" | "Developer"
  finishDate: Date

  
  //Class internals
  cost: number = 0
  progress: number = 0
  id: string

    constructor(data: IProject, id: string = uuidv4()) {
    this.id = id
    this.name = data.name
    this.description = data.description
    this.status = data.status
    this.userRole = data.userRole
    this.finishDate = data.finishDate instanceof Date ? data.finishDate : new Date(data.finishDate)
    this.cost = data.cost ?? 0
    this.progress = data.progress ?? 0
    }

}