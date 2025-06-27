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

interface EditProject {
  project: Project;
  partiallyUpdateProject: (formEditedProject: Project) => void;
}

function EditProject({ project, partiallyUpdateProject }: EditProject) {
  const { handleDataRequest } = useRequestHandler();

  const formEditedProject = useForm({
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

  const initialValues = useRef<Project>(formEditedProject.values);

  const userInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    formEditedProject.validate();

    if (formEditedProject.isDirty()) {
      const patchDocument = createJsonPatchDocumentFromDirtyForm(
        formEditedProject,
        formEditedProject.values
      );
      const response = await handleDataRequest<
        JsonPatchKeyValuePair[],
        ProjectResponse
      >(urls.project + "/" + project.id, RequestType.Patch, patchDocument);

      if (response.isSuccess) {
        initialValues.current = formEditedProject.values;

        partiallyUpdateProject(formEditedProject.values);

        toast.success("Project edited successfully.");

        modals.closeAll();
      }
    }
  };

  useEffect(() => {
    if (userInputRef.current) {
      userInputRef.current.focus();
    }
  }, []);

  return (
    <Flex direction={"column"} gap={10}>
      <TextInput
        ref={userInputRef}
        key={formEditedProject.key("id")}
        {...formEditedProject.getInputProps("name")}
        withAsterisk
        label={"Name"}
      />

      <TextInput
        {...formEditedProject.getInputProps("code")}
        withAsterisk
        label={"Code"}
      />
      <Button onClick={(e) => handleSave(e)}>Edit</Button>
    </Flex>
  );
}

export default EditProject;
