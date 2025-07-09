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

interface EditProjectProps {
  project: Project;
  updateProject: (updateProject: Project) => void;
}

function EditProjectModal({ project, updateProject }: EditProjectProps) {
  const { handleDataRequest } = useRequestHandler();

  const projectForm = useForm({
    initialValues: {
      id: project.id,
      name: project.name,
      code: project.code,
      searchText: project.searchText,
      isActive: project.isActive,
      createUser: project.createUser,
      createDate: project.createDate,
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  const initialValues = useRef<Project>(projectForm.values);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    projectForm.validate();

    if (!projectForm.isValid()) return;

    const patchDocument = createJsonPatchDocumentFromDirtyForm(
      projectForm,
      projectForm.values
    );
    const response = await handleDataRequest<
      JsonPatchKeyValuePair[],
      ProjectResponse
    >(`${urls.project}/${project.id}`, RequestType.Patch, patchDocument);

    if (response.isSuccess) {
      initialValues.current = projectForm.values;

      updateProject(projectForm.values);

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
        withAsterisk
        label={"Name"}
      />

      <TextInput
        {...projectForm.getInputProps("code")}
        withAsterisk
        label={"Code"}
      />
      {projectForm.isDirty() ? (
        <Button onClick={(e) => handleSave(e)}>Edit</Button>
      ) : (
        <Button disabled>Edit</Button>
      )}
    </Flex>
  );
}

export default EditProjectModal;
