import { useEffect, useRef, useState } from "react";
import teamSchema, { Team } from "../../../types/team";
import { Button, Flex, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  createJsonPatchDocumentFromDirtyForm,
  JsonPatchKeyValuePair,
} from "../../../types/json-patch-document";
import useRequestHandler from "../../../hooks/useRequestHandler";
import RequestType from "../../../request-handler/request-type";
import urls from "../../../constants/urls";
import toast from "react-hot-toast";
import { modals } from "@mantine/modals";
import { zod4Resolver } from "mantine-form-zod-resolver";

interface EditTeamProps {
  team: Team;
  updateTeam: (teamForm: Team) => void;
  checkIfTeamIsValid: (team: Team) => boolean;
}

function EditTeamModal({
  team,
  updateTeam,
  checkIfTeamIsValid,
}: EditTeamProps) {
  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const teamForm = useForm({
    initialValues: {
      ...team,
    },
    validate: zod4Resolver(teamSchema),
  });

  const initialValues = useRef<Team>({
    ...teamForm.values,
  });

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    setIsLoading(true);

    e.preventDefault();

    teamForm.validate();

    if (!teamForm.isValid()) {
      setIsLoading(false);
      return;
    }

    if (!checkIfTeamIsValid(teamForm.values)) {
      setIsLoading(false);
      return;
    }

    const patchDocument = createJsonPatchDocumentFromDirtyForm(
      teamForm,
      teamForm.values,
    );

    const response = await handleDataRequest<JsonPatchKeyValuePair[], Team>(
      `${urls.team}/${team.id}`,
      RequestType.Patch,
      patchDocument,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    initialValues.current = {
      ...teamForm.values,
    };

    updateTeam({
      ...teamForm.values,
    });

    toast.success("Team edited successfully.");

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
        ref={nameInputRef}
        {...teamForm.getInputProps("name")}
        style={{ minHeight: 80 }}
        withAsterisk
        label={"Name"}
      />

      <Button
        variant="light"
        disabled={!teamForm.isDirty()}
        onClick={(e) => handleSave(e)}
        loading={isLoading}
      >
        Edit
      </Button>
    </Flex>
  );
}

export default EditTeamModal;
