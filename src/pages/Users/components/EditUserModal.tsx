import { useEffect, useRef } from "react";
import { modals } from "@mantine/modals";
import { Button, Flex, Group, Radio, Select, TextInput } from "@mantine/core";
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
import useUsers from "../../../hooks/useUsers";

interface EditUserProps {
  user: User;
  updateUser: (userForm: User) => void;
}

function EditUserModal({ user, updateUser }: EditUserProps) {
  const { handleDataRequest } = useRequestHandler();

  const { users } = useUsers({
    hasValueLabel: false,
    hasActiveUserValueLabel: false,
  });

  const { activeTeamSelectData } = useTeams({
    hasValueLabel: true,
    hasActiveTeamValueLabel: true,
  });

  const userForm = useForm({
    initialValues: {
      ...user,
      isActive: user.isActive ? "true" : "false",
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
    isActive: Boolean(userForm.values.isActive),
  });

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    userForm.validate();

    if (!userForm.isValid()) return;

    if (
      users
        .filter((x) => x.isActive && x.id != userForm.values.id)
        .find((x) => x.cardNumber === userForm.values.cardNumber)
    ) {
      toast.error("There is a active user with the same card number!");
      return;
    }

    if (
      users
        .filter((x) => x.isActive && x.id != userForm.values.id)
        .find((x) => x.email === userForm.values.email)
    ) {
      toast.error("There is a user with the same email!");
      return;
    }

    const patchDocument = createJsonPatchDocumentFromDirtyForm(
      userForm,
      userForm.values
    );

    const response = await handleDataRequest<
      JsonPatchKeyValuePair[],
      UserResponse
    >(`${urls.user}/${user.id}`, RequestType.Patch, patchDocument);

    if (response.isSuccess) {
      initialValues.current = {
        ...userForm.values,
        isActive: Boolean(userForm.values.isActive),
      };

      updateUser({
        ...userForm.values,
        isActive: Boolean(userForm.values.isActive),
      });

      toast.success("User edited successfully.");

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
