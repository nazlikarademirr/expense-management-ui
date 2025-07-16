import { useEffect, useRef } from "react";
import { modals } from "@mantine/modals";
import { Button, Flex, PasswordInput, Select, TextInput } from "@mantine/core";
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
import { genders, roles } from "../../../constants/static-data";
import useTeams from "../../../hooks/useTeams";

interface EditUserProps {
  user: User;
  updateUser: (userForm: User) => void;
}

function EditUserModal({ user, updateUser }: EditUserProps) {
  const { handleDataRequest } = useRequestHandler();

  const { teamSelectData } = useTeams({ hasValueLabel: true });

  const userForm = useForm({
    initialValues: {
      ...user,
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
      surname: (value) =>
        value.length === 0
          ? "Surname cannot be empty."
          : value.length < 2
            ? "Surname must have at least 2 letters."
            : value.length > 128
              ? "Surname cannot exceed 128 characters."
              : null,
      teamId: (value) =>
        value === null ? "Team id cannot be null." : undefined,
      gender: (value) =>
        value === null ? "Gender cannot be null." : undefined,
      cardNumber: (value) =>
        value.length === 0
          ? "Card number cannot be empty."
          : value.length > 8
            ? "Card number cannot exceed 8 characters."
            : null,
      email: (value) =>
        value.length === 0
          ? "Email cannot be empty."
          : value.length > 128
            ? "Email cannot exceed 128 characters."
            : null,
      password: (value) =>
        value.length === 0
          ? "Password cannot be empty."
          : value.length < 8
            ? "Password cannot be less than 8 characters."
            : value.length > 32
              ? "Password cannot exceed 32 characters."
              : null,
      role: (value) => (value === null ? "Role cannot be null." : undefined),
    },
  });

  const initialValues = useRef<User>(userForm.values);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    userForm.validate();

    if (!userForm.isValid()) return;

    const patchDocument = createJsonPatchDocumentFromDirtyForm(
      userForm,
      userForm.values
    );

    const response = await handleDataRequest<
      JsonPatchKeyValuePair[],
      UserResponse
    >(`${urls.user}/${user.id}`, RequestType.Patch, patchDocument);

    if (response.isSuccess) {
      initialValues.current = userForm.values;

      updateUser(userForm.values);

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
        data={teamSelectData}
        searchable
        label={"Team Name"}
      />
      <Select
        {...userForm.getInputProps("gender")}
        withAsterisk
        data={genders}
        searchable
        label={"Gender"}
      />
      <TextInput
        {...userForm.getInputProps("cardNumber")}
        withAsterisk
        label={"Card Number"}
      />
      <PasswordInput
        {...userForm.getInputProps("password")}
        withAsterisk
        label={"Password"}
      />
      <Select
        {...userForm.getInputProps("role")}
        withAsterisk
        data={roles}
        searchable
        label={"Role"}
      />
      <Button disabled={!userForm.isDirty()} onClick={(e) => handleSave(e)}>
        Edit
      </Button>
    </Flex>
  );
}

export default EditUserModal;
