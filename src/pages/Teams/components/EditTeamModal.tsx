import { useEffect, useRef } from "react";
import { Team, TeamResponse } from "../../../types/team";
import { Button, Flex, Group, Radio, TextInput } from "@mantine/core";
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

interface EditTeamProps {
  team: Team;
  updateTeam: (teamForm: Team) => void;
}

function EditTeamModal({ team, updateTeam }: EditTeamProps) {
  const { handleDataRequest } = useRequestHandler();

  const teamForm = useForm({
    initialValues: {
      ...team,
    },
    validate: {
      name: (value) =>
        value.length === 0
          ? "Name cannot be empty."
          : value.length < 2
            ? "Name must have at least 2 letters."
            : value.length > 128
              ? "Name cannot exceed 128 characters."
              : null,
      isActive: (value) =>
        value === null ? "Activity must be selected." : undefined,
    },
  });

  const initialValues = useRef<Team>(teamForm.values);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    teamForm.validate();

    if (!teamForm.isValid()) return;

    const patchDocument = createJsonPatchDocumentFromDirtyForm(
      teamForm,
      teamForm.values
    );

    const response = await handleDataRequest<
      JsonPatchKeyValuePair[],
      TeamResponse
    >(`${urls.team}/${team.id}`, RequestType.Patch, patchDocument);

    if (response.isSuccess) {
      initialValues.current = teamForm.values;

      updateTeam(teamForm.values);

      toast.success("Team edited successfully.");

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
        {...teamForm.getInputProps("name")}
        withAsterisk
        label={"Name"}
      />
      <Radio.Group label="Is Active" withAsterisk style={{ flexGrow: 1 }}>
        <Group mt="xs">
          <Radio value="true" label="True" />
          <Radio value="false" label="False" />
        </Group>
      </Radio.Group>
      <Button disabled={!teamForm.isDirty()} onClick={(e) => handleSave(e)}>
        Edit
      </Button>
    </Flex>
  );
}

export default EditTeamModal;
