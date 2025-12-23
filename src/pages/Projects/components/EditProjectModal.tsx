import { useEffect, useRef } from "react";
import { Project, ProjectResponse } from "../../../types/project";
import { modals } from "@mantine/modals";
import { Button, Flex, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  createJsonPatchDocumentFromDirtyForm,
  JsonPatchKeyValuePair,
} from "../../../types/json-patch-document";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request-type";
import toast from "react-hot-toast";
import useProjects from "../../../hooks/useProjects";

interface EditProjectProps {
  project: Project;
  updateProject: (updateProject: Project) => void;
}

function EditProjectModal({ project, updateProject }: EditProjectProps) {
  const { handleDataRequest } = useRequestHandler();

  const { projects } = useProjects({
    hasValueLabel: false,
    hasActiveProjectValueLabel: false,
  });

  const projectForm = useForm({
    initialValues: {
      ...project,
      isActive: project.isActive ? "true" : "false",
    },
    validate: {
      name: (value) =>
        value.trim().length === 0
          ? "Name cannot be empty."
          : value.length < 2
            ? "Name must have at least 2 letters."
            : value.length > 128
              ? "Name cannot exceed 128 characters."
              : null,
      code: (value) =>
        value.trim().length === 0
          ? "Code cannot be empty."
          : value.length < 2
            ? "Code must have at least 2 letters."
            : value.length > 128
              ? "Code cannot exceed 128 characters."
              : null,
      isActive: (value) => (!value ? "Activity must be selected." : undefined),
    },
  });

  const initialValues = useRef<Project>({
    ...projectForm.values,
    isActive: Boolean(projectForm.values.isActive),
  });

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    projectForm.validate();

    if (!projectForm.isValid()) return;

    if (
      projects
        .filter((x) => x.isActive && x.id != projectForm.values.id)
        .find((x) => x.name === projectForm.values.name)
    ) {
      toast.error("There is a project with the same name!");
      return;
    }

    if (
      projects
        .filter((x) => x.isActive && x.id != projectForm.values.id)
        .find((x) => x.code === projectForm.values.code)
    ) {
      toast.error("There is a active project with the same code!");
      return;
    }

    const patchDocument = createJsonPatchDocumentFromDirtyForm(
      projectForm,
      projectForm.values
    );

    const response = await handleDataRequest<
      JsonPatchKeyValuePair[],
      ProjectResponse
    >(`${urls.project}/${project.id}`, RequestType.Patch, patchDocument);

    if (response.isSuccess) {
      initialValues.current = {
        ...projectForm.values,
        isActive: Boolean(projectForm.values.isActive),
      };

      updateProject({
        ...projectForm.values,
        isActive: Boolean(projectForm.values.isActive),
      });

      toast.success("Project edited successfully.");

      modals.closeAll();
    }
  };

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  return (
    <Flex direction={"column"} gap={10}>
      <TextInput
        ref={nameInputRef}
        {...projectForm.getInputProps("name")}
        label={"Name"}
      />

      <TextInput {...projectForm.getInputProps("code")} label={"Code"} />
      <Button
        variant="light"
        disabled={!projectForm.isDirty()}
        onClick={(e) => handleSave(e)}
      >
        Edit
      </Button>
    </Flex>
  );
}

export default EditProjectModal;
