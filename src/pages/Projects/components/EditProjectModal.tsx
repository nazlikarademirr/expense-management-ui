import { useEffect, useRef, useState } from "react";
import projectSchema, { Project } from "../../../types/project";
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
import { zod4Resolver } from "mantine-form-zod-resolver";

interface EditProjectProps {
  project: Project;
  updateProject: (updateProject: Project) => void;
  checkIfProjectIsValid: (project: Project) => boolean;
}

const MIN_INPUT_HEIGHT = 80;

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
    validate: zod4Resolver(projectSchema),
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
        style={{ minHeight: MIN_INPUT_HEIGHT }}
        ref={nameInputRef}
        {...projectForm.getInputProps("name")}
        label={"Name"}
      />

      <TextInput
        style={{ minHeight: MIN_INPUT_HEIGHT }}
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
