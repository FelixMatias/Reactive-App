import * as React from "react";
import * as Router from "react-router-dom";
import { Project } from "../classes/Project";
import { ProjectCard } from "./ProjectCard";
import { SearchBox } from "./SearchBox";
import { ProjectsManager } from "../classes/ProjectsManager";
import { ProjectForm } from "./ProjectForm";
import { toast } from "../classes/toast";

interface Props {
  projectsManager: ProjectsManager;
}

export function ProjectsPage({ projectsManager }: Props) {
  // Local state for the filtered list of projects
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    /** * SYNC LOGIC:
     * This function runs whenever the Manager notifies us of a change
     * or whenever the user types in the search box.
     */
    const syncProjects = () => {
      const list = searchQuery 
        ? projectsManager.filterProjects(searchQuery) 
        : [...projectsManager.list];
      setProjects(list);
    };

    // 1. Initial local sync (Source of Truth)
    syncProjects();

    // 2. SUBSCRIBE: Listen for both Project metadata changes AND 
    // Todo sub-collection changes that affect progress percentages.
    const unsubscribeProjects = projectsManager.subscribeToProjects(syncProjects);
    const unsubscribeTodos = projectsManager.subscribeToTodos(() => syncProjects());

    // 3. INITIAL FETCH: Only pull from Firestore if the list is empty
    if (projectsManager.list.length === 0) {
      projectsManager.fetchFromFirestore().catch((err) => {
        toast.error("Database connection failed");
        console.error(err);
      });
    }

    // Cleanup listeners when component unmounts
    return () => {
      unsubscribeProjects();
      unsubscribeTodos();
    };
  }, [projectsManager, searchQuery]);

  const onProjectSearch = (value: string) => {
    setSearchQuery(value); 
  };

  return (
    <div className="page" id="projects-page">
      {/* PROJECT MODAL: Creating a project now uses the 'new' manager logic */}
      <ProjectForm 
        projectsManager={projectsManager} 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
      
      <header>
        <h2>Projects</h2>
        <div style={{ display: "flex", alignItems: "center", columnGap: 20 }}>
          <SearchBox onChange={onProjectSearch} />
          <button 
            onClick={() => setIsFormOpen(true)} 
            className="btn-secondary" 
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span className="material-icons-round">add</span>
            New Project
          </button>
        </div>
      </header>

      <div className="main-page-content">
        {projects.length > 0 ? (
          <div id="projects-list">
            {projects.map((project) => (
              <Router.Link 
                to={`/project/${project.id}`} 
                key={project.id} 
                style={{ textDecoration: 'none' }}
              >
                {/* The ProjectCard now receives a Project instance 
                   that has access to calculateProgress() 
                */}
                <ProjectCard project={project} />
              </Router.Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "50px", color: "#969696" }}>
            <p>
              {searchQuery 
                ? "No projects match your search." 
                : "No projects found. Use the 'New Project' button to begin."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}