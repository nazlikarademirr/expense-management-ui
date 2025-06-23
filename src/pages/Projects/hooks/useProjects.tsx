import { useEffect, useState } from "react";
import {
  Project,
  ProjectRequest,
  ProjectResponse,
} from "../../../types/project";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request.type";
import toast from "react-hot-toast";

function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  const { handleDataRequest } = useRequestHandler();

  const addProject = async (project: Project) => {
    const projectRequest: ProjectRequest = {
      name: project.name,
      code: project.code,
    };

    var response = await handleDataRequest<ProjectRequest, ProjectResponse>(
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
    var response = await handleDataRequest<object, undefined>(
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

  const updateProject = async (project: Project) => {
    const updateProjects = projects.map((x) => {
      if (x.id === project.id) {
        return project;
      }

      return x;
    });

    const projectRequest: ProjectRequest = {
      name: project.name,
      code: project.code,
    };

    var response = await handleDataRequest<ProjectRequest, ProjectResponse>(
      urls.project + "/" + project.id,
      RequestType.Patch,
      projectRequest
    );

    if (response.isSuccess) {
      setProjects(updateProjects);
      return true;
    }

    return false;
  };

  const replaceProject = (list: Project[]) => {
    setProjects(list);
  };

  const fetchProjects = async () => {
    var response = await handleDataRequest<never, ProjectResponse[]>(
      urls.project,
      RequestType.Get
    );
    if (response.isSuccess) {
      var projects: Project[] = response.value.map((x) => ({
        id: x.id,
        name: x.name,
        code: x.code,
        searchText: x.searchText,
        isActive: x.isActive,
        createUser: x.createUser,
        createDate: x.createDate,
      }));
      setProjects(projects);
    }
  };

  useEffect(() => {
    fetchProjects();
  });

  return { projects, addProject, updateProject, replaceProject, deleteProject };
}

export default useProjects;
