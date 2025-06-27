import { useEffect, useRef } from "react";
import { Team, TeamResponse } from "../../../types/team";
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

interface EditTeam {
  team: Team;
  partiallyUpdateTeam: (formEditedTeam: Team) => void;
}

function EditTeam({ team, partiallyUpdateTeam }: EditTeam) {
  const { handleDataRequest } = useRequestHandler();

  const formEditedTeam = useForm({
    initialValues: {
      id: team.id,
      name: team.name,
      searchText: team.searchText,
      isActive: team.isActive,
      createUser: team.createUser,
      createDate: team.createDate,
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  const initialValues = useRef<Team>(formEditedTeam.values);

  const userInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    formEditedTeam.validate();

    if (formEditedTeam.isDirty()) {
      const patchDocument = createJsonPatchDocumentFromDirtyForm(
        formEditedTeam,
        formEditedTeam.values
      );
      const response = await handleDataRequest<
        JsonPatchKeyValuePair[],
        TeamResponse
      >(urls.team + "/" + team.id, RequestType.Patch, patchDocument);

      if (response.isSuccess) {
        initialValues.current = formEditedTeam.values;

        partiallyUpdateTeam(formEditedTeam.values);

        toast.success("Team edited successfully.");

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
        key={formEditedTeam.key("id")}
        {...formEditedTeam.getInputProps("name")}
        withAsterisk
        label={"Name"}
      />
      <Button onClick={(e) => handleSave(e)}>Edit Team</Button>
    </Flex>
  );
}

export default EditTeam;
