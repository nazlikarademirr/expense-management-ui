import { useEffect, useRef, useState } from "react";
import { modals } from "@mantine/modals";
import {
  Button,
  ComboboxItem,
  Flex,
  Group,
  Radio,
  Select,
  TextInput,
} from "@mantine/core";
import { User, UserResponse } from "../../../types/user";
import { useForm } from "@mantine/form";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request-type";
import {
  createJsonPatchDocumentFromDirtyForm,
  JsonPatchKeyValuePair,
} from "../../../types/json-patch-document";
import toast from "react-hot-toast";
import useTeams from "../../../hooks/useTeams";
import { genders, roles } from "../../../constants/static-data";
import { SelectItem } from "../../../types/select-item";
import { Team } from "../../../types/team";

interface EditUserProps {
  user: User;
  updateUser: (userForm: User) => void;
}

function EditUserModal({ user, updateUser }: EditUserProps) {
  const { handleDataRequest } = useRequestHandler();

  const { fetchTeams } = useTeams();

  const [activeTeamSelectData, setActiveTeamSelectData] = useState<
    SelectItem[]
  >([]);

  const userForm = useForm({
    initialValues: {
      ...user,
    },
    validate: {
      name: (value) =>
        value.trim().length === 0
          ? "Name cannot be empty."
          : value.length < 2
            ? "Name must have at least 2 letters."
            : value.length > 128
              ? "Name cannot exceed 128 characters."
              : undefined,
      surname: (value) =>
        value.trim().length === 0
          ? "Surname cannot be empty."
          : value.length < 2
            ? "Surname must have at least 2 letters."
            : value.length > 128
              ? "Surname cannot exceed 128 characters."
              : undefined,
      teamId: (value) => (!value ? "Team must be selected." : undefined),
      gender: (value) => (!value ? "Gender must be selected." : undefined),
      cardNumber: (value) =>
        value.trim().length === 0
          ? "Card number cannot be empty."
          : value.length > 8
            ? "Card number cannot exceed 8 characters."
            : undefined,
      email: (value) =>
        value.trim().length === 0
          ? "Email cannot be empty."
          : value.length > 128
            ? "Email cannot exceed 128 characters."
            : undefined,
      role: (value) => (!value ? "Role must be selected." : undefined),
    },
  });

  const initialValues = useRef<User>({
    ...userForm.values,
  });

  const nameInputRef = useRef<HTMLInputElement>(null);

  const getTeams = async () => {
    const response = await handleDataRequest<never, Team[]>(
      urls.team,
      RequestType.Get,
    );

    if (!response.isSuccess) return;

    fetchTeams(response.value);

    setActiveTeamSelectData(
      response.value
        .filter((x) => x.isActive)
        .map((x) => ({ value: x.id, label: x.name })),
    );
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    userForm.validate();

    if (!userForm.isValid()) return;

    const patchDocument = createJsonPatchDocumentFromDirtyForm(
      userForm,
      userForm.values,
    );

    const response = await handleDataRequest<
      JsonPatchKeyValuePair[],
      UserResponse
    >(`${urls.user}/${user.id}`, RequestType.Patch, patchDocument);

    if (!response.isSuccess) return;

    initialValues.current = {
      ...userForm.values,
    };

    updateUser({
      ...userForm.values,
    });

    toast.success("User edited successfully.");

    modals.closeAll();
  };

  const changeTeam = (team: ComboboxItem) => {
    userForm.setFieldValue("teamId", team.value);
    userForm.setFieldValue("teamName", team.label);
  };

  useEffect(() => {
    getTeams();

    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  return (
    <Flex direction={"column"} gap={10}>
      <TextInput
        ref={nameInputRef}
        {...userForm.getInputProps("name")}
        withAsterisk
        label={"Name"}
      />
      <TextInput
        {...userForm.getInputProps("surname")}
        withAsterisk
        label={"Surname"}
      />
      <Select
        {...userForm.getInputProps("teamId")}
        onChange={(_, option) => changeTeam(option)}
        withAsterisk
        data={activeTeamSelectData}
        searchable
        label={"Team Name"}
      />
      <Radio.Group
        label="Gender"
        withAsterisk
        style={{ flexGrow: 1 }}
        {...userForm.getInputProps("gender")}
      >
        <Group mt="xs">
          {genders.map((x) => (
            <Radio value={x.value} label={x.label}></Radio>
          ))}
        </Group>
      </Radio.Group>
      <TextInput
        {...userForm.getInputProps("cardNumber")}
        withAsterisk
        label={"Card Number"}
      />
      <TextInput
        {...userForm.getInputProps("email")}
        withAsterisk
        label={"Email"}
      />
      <Radio.Group
        label="Role"
        withAsterisk
        style={{ flexGrow: 1 }}
        {...userForm.getInputProps("role")}
      >
        <Group mt="xs">
          {roles.map((x) => (
            <Radio value={x.value} label={x.label}></Radio>
          ))}
        </Group>
      </Radio.Group>

      <Button
        variant={"light"}
        disabled={!userForm.isDirty()}
        onClick={(e) => handleSave(e)}
      >
        Edit
      </Button>
    </Flex>
  );
}

export default EditUserModal;
