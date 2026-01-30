import { useEffect, useRef, useState } from "react";
import { Project } from "../../../types/project";
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
  checkIfProjectIsValid: (project: Project) => boolean;
}

function EditProjectModal({
  project,
  updateProject,
  checkIfProjectIsValid,
}: EditProjectProps) {
  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const projectForm = useForm({
    initialValues: {
      ...project,
    },
    validate: {
      name: (value) =>
        value.trim().length === 0
          ? "Name cannot be empty."
          : value.trim().length < 2
            ? "Name must have at least 2 letters."
            : value.trim().length > 128
              ? "Name cannot exceed 128 characters."
              : null,
      code: (value) =>
        value.trim().length === 0
          ? "Code cannot be empty."
          : value.trim().length < 2
            ? "Code must have at least 2 letters."
            : value.trim().length > 128
              ? "Code cannot exceed 128 characters."
              : null,
    },
  });

  const initialValues = useRef<Project>({
    ...projectForm.values,
  });

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    setIsLoading(true);

    e.preventDefault();

    projectForm.validate();

    if (!projectForm.isValid()) {
      setIsLoading(false);
      return;
    }

    if (!checkIfProjectIsValid(projectForm.values)) {
      setIsLoading(false);
      return;
    }

    const patchDocument = createJsonPatchDocumentFromDirtyForm(
      projectForm,
      projectForm.values,
    );

    const response = await handleDataRequest<JsonPatchKeyValuePair[], Project>(
      `${urls.project}/${project.id}`,
      RequestType.Patch,
      patchDocument,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    initialValues.current = {
      ...projectForm.values,
    };

    updateProject({
      ...projectForm.values,
    });

    toast.success("Project edited successfully.");

    modals.closeAll();

    setIsLoading(false);
  };

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  return (
    <Flex direction={"column"} gap={10}>
      <TextInput
        style={{ minHeight: 80 }}
        ref={nameInputRef}
        {...projectForm.getInputProps("name")}
        label={"Name"}
      />

      <TextInput
        style={{ minHeight: 80 }}
        {...projectForm.getInputProps("code")}
        label={"Code"}
      />
      <Button
        variant="light"
        disabled={!projectForm.isDirty()}
        onClick={(e) => handleSave(e)}
        loading={isLoading}
      >
        Edit
      </Button>
    </Flex>
  );
}

export default EditProjectModal;
