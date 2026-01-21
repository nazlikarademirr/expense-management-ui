import { useEffect, useRef } from "react";
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
}

function EditProjectModal({ project, updateProject }: EditProjectProps) {
  const { handleDataRequest } = useRequestHandler();

  const projectForm = useForm({
    initialValues: {
      ...project,
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
  });

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    projectForm.validate();

    if (!projectForm.isValid()) return;

    const patchDocument = createJsonPatchDocumentFromDirtyForm(
      projectForm,
      projectForm.values,
    );

    const response = await handleDataRequest<JsonPatchKeyValuePair[], Project>(
      `${urls.project}/${project.id}`,
      RequestType.Patch,
      patchDocument,
    );

    if (!response.isSuccess) return;

    initialValues.current = {
      ...projectForm.values,
    };

    updateProject({
      ...projectForm.values,
    });

    toast.success("Project edited successfully.");

    modals.closeAll();
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
