import { useEffect, useReducer, useState } from "react";
import { Project, ProjectRequest, ProjectResponse } from "../types/project";
import useRequestHandler from "./useRequestHandler";
import urls from "../constants/urls";
import RequestType from "../request-handler/request-type";
import toast from "react-hot-toast";
import { SelectItem } from "../types/select-item";
import ReducerActions from "../enums/reducer-action";
import projectReducer from "../pages/Projects/project-reducer";

interface UseProjectsProps {
  hasValueLabel: boolean;
  hasActiveProjectValueLabel: boolean;
}

function useProjects({
  hasValueLabel,
  hasActiveProjectValueLabel,
}: UseProjectsProps) {
  const [projects, dispatch] = useReducer(projectReducer, []);

  const [projectSelectData, setProjectSelectData] = useState<SelectItem[]>([]);

  const [activeProjectSelectData, setActiveProjectSelectData] = useState<
    SelectItem[]
  >([]);

  const { handleDataRequest } = useRequestHandler();

  const addProject = async (project: Project) => {
    const projectRequest: ProjectRequest = {
      ...project,
    };

    const response = await handleDataRequest<ProjectRequest, ProjectResponse>(
      urls.project,
      RequestType.Post,
      projectRequest
    );

    if (!response.isSuccess) return false;

    const newProject: Project = {
      ...response.value,
    };

    dispatch({
      type: ReducerActions.Add,
      payload: newProject,
    });

    return true;
  };

  const deleteProject = async (id: string) => {
    const response = await handleDataRequest<string, never>(
      urls.project,
      RequestType.Delete,
      undefined,
      { id }
    );

    if (!response.isSuccess) return false;

    dispatch({
      type: ReducerActions.Delete,
      payload: id,
    });

    toast.success("Project has been deleted successfully!");

    return true;
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

  const fetchProjects = async () => {
    const response = await handleDataRequest<never, ProjectResponse[]>(
      urls.project,
      RequestType.Get
    );

    if (!response.isSuccess) return;

    const projects: Project[] = response.value.map((x) => ({
      ...x,
    }));

    dispatch({
      type: ReducerActions.Replace,
      payload: projects,
    });

    if (hasValueLabel) {
      setProjectSelectData(
        response.value.map((x) => ({ value: x.id, label: x.name }))
      );
    }

    if (hasActiveProjectValueLabel) {
      setActiveProjectSelectData(
        response.value
          .filter((x) => x.isActive === true)
          .map((x) => ({ value: x.id, label: x.name }))
      );
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    projectSelectData,
    activeProjectSelectData,
    fetchProjects,
    addProject,
    updateProject,
    replaceProjects,
    deleteProject,
  };
}

export default useProjects;
