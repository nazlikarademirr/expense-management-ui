import { useEffect, useRef, useState } from "react";
import teamSchema, { Team } from "../../../types/team.types";
import { Autocomplete, Button, Flex, TextInput } from "@mantine/core";
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
import { useTranslation } from "react-i18next";
import Dictionary from "../../../helpers/translation/dictionary";
import { SelectItem } from "../../../types/select-item.types";

const MIN_INPUT_HEIGHT = 80;

interface EditTeamProps {
  team: Team;
  updateTeam: (teamForm: Team) => void;
  checkIfTeamIsValid: (team: Team) => boolean;
  managerSelectData: SelectItem[];
}

function EditTeamModal({
  team,
  updateTeam,
  checkIfTeamIsValid,
  managerSelectData,
}: EditTeamProps) {
  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation();

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

    toast.success(t(Dictionary.Team.UPDATED));

    modals.closeAll();

    setIsLoading(false);
  };

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  return (
    <Flex direction="column" gap={10}>
      <TextInput
        ref={nameInputRef}
        {...teamForm.getInputProps("name")}
        mih={MIN_INPUT_HEIGHT}
        flex={1}
        withAsterisk
        label={t(Dictionary.Team.NAME)}
      />
      <TextInput
        flex={1}
        mih={MIN_INPUT_HEIGHT}
        withAsterisk
        {...teamForm.getInputProps("department")}
        label={t(Dictionary.Team.DEPARTMENT)}
      />
      <Autocomplete
        {...teamForm.getInputProps("departmentManager")}
        mih={MIN_INPUT_HEIGHT}
        flex={1}
        clearable
        data={managerSelectData}
        label={t(Dictionary.Team.DEPARTMENT_MANAGER)}
        comboboxProps={{ withinPortal: true, middlewares: { flip: false } }}
      />
      <Autocomplete
        {...teamForm.getInputProps("departmentHead")}
        mih={MIN_INPUT_HEIGHT}
        flex={1}
        clearable
        data={managerSelectData}
        label={t(Dictionary.Team.DEPARTMENT_HEAD)}
        comboboxProps={{ withinPortal: true, middlewares: { flip: false } }}
      />
      <Button
        variant="light"
        disabled={!teamForm.isDirty()}
        onClick={(e) => handleSave(e)}
        loading={isLoading}
      >
        {t(Dictionary.Common.EDIT)}
      </Button>
    </Flex>
  );
}

export default EditTeamModal;
