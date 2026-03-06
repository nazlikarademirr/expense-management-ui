import { useReducer } from "react";
import { Project } from "../types/project.types";
import ReducerActions from "../enums/reducer-action";
import projectReducer from "../pages/Projects/project-reducer";

function useProjects() {
  const [projects, dispatch] = useReducer(projectReducer, []);

  const addProject = (project: Project) => {
    dispatch({
      type: ReducerActions.Add,
      payload: project,
    });
  };

  const deleteProject = (id: string) => {
    dispatch({
      type: ReducerActions.Delete,
      payload: id,
    });
  };

  const updateProject = (updatedProject: Project) => {
    dispatch({
      type: ReducerActions.Update,
      payload: updatedProject,
    });
  };

  const replaceProjects = (list: Project[]) => {
    dispatch({
      type: ReducerActions.Replace,
      payload: list,
    });
  };

  return {
    projects,
    addProject,
    updateProject,
    replaceProjects,
    deleteProject,
  };
}

export default useProjects;
