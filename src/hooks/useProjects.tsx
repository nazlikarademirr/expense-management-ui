import { useEffect, useState } from "react";
import { Project, ProjectRequest, ProjectResponse } from "../types/project";
import useRequestHandler from "./useRequestHandler";
import urls from "../constants/urls";
import RequestType from "../request-handler/request-type";
import toast from "react-hot-toast";
import { SelectItem } from "../types/select-item";

interface UseProjectsProps {
  hasValueLabel: boolean;
}

function useProjects({ hasValueLabel }: UseProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);

  const [projectSelectData, setProjectSelectData] = useState<SelectItem[]>([]);

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

    if (response.isSuccess) {
      const newProject: Project = {
        ...response.value,
      };
      setProjects([newProject, ...projects]);
      return true;
    }

    return false;
  };

  const deleteProject = async (id: string) => {
    const response = await handleDataRequest<string, never>(
      urls.project,
      RequestType.Delete,
      undefined,
      { id }
    );

    if (response.isSuccess) {
      setProjects(projects.filter((x) => x.id !== id));
      toast.success("Project has been deleted successfully!");
      return true;
    }

    return false;
  };

  const updateProject = (updatedProject: Project) => {
    const replacedProjects = projects.map((x) => {
      if (x.id === updatedProject.id) {
        return updatedProject;
      }
      return x;
    });
    setProjects(replacedProjects);
  };

  const replaceProject = (list: Project[]) => {
    setProjects(list);
  };

  const fetchProjects = async () => {
    const response = await handleDataRequest<never, ProjectResponse[]>(
      urls.project,
      RequestType.Get
    );
    if (response.isSuccess) {
      setProjects(response.value);
      if (hasValueLabel) {
        setProjectSelectData(
          response.value.map((x) => ({ value: x.id, label: x.name }))
        );
      }
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    projectSelectData,
    fetchProjects,
    addProject,
    updateProject,
    replaceProject,
    deleteProject,
  };
}

export default useProjects;
