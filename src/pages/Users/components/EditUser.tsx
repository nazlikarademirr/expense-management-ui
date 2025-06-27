import { useEffect, useMemo, useRef, useState } from "react";
import { modals } from "@mantine/modals";
import { Button, Flex, PasswordInput, Select, TextInput } from "@mantine/core";
import { User, UserResponse } from "../../../types/user";
import Gender from "../../../enums/gender";
import Role from "../../../enums/role";
import { useForm } from "@mantine/form";
import useRequestHandler from "../../../hooks/useRequestHandler";
import { TeamResponse } from "../../../types/team";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request-type";
import { SelectItem } from "../../../types/select-item";
import {
  createJsonPatchDocumentFromDirtyForm,
  JsonPatchKeyValuePair,
} from "../../../types/json-patch-document";
import toast from "react-hot-toast";

interface EditUser {
  user: User;
  partiallyUpdateUser: (formEditedUser: User) => void;
}

function EditUser({ user, partiallyUpdateUser }: EditUser) {
  const [teamSelectData, setTeamSelectData] = useState<SelectItem[]>([]);

  const { handleDataRequest } = useRequestHandler();

  const formEditedUser = useForm({
    initialValues: {
      id: user.id,
      name: user.name,
      surname: user.surname,
      teamId: user.teamId,
      gender: user.gender,
      cardNumber: user.cardNumber,
      email: user.email,
      password: user.password,
      role: user.role,
      searchText: user.searchText,
      isActive: user.isActive,
      createUser: user.createUser,
      createDate: user.createDate,
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  const initialValues = useRef<User>(formEditedUser.values);

  const gendersData = useMemo(
    () => [
      {
        value: Gender.Male,
        label: "Male",
      },
      {
        value: Gender.Female,
        label: "Female",
      },
    ],
    []
  );

  const rolesData = useMemo(
    () => [
      {
        value: Role.Admin,
        label: "Admin",
      },
      {
        value: Role.Manager,
        label: "Manager",
      },
      {
        value: Role.User,
        label: "User",
      },
    ],
    []
  );

  const userInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    formEditedUser.validate();

    if (formEditedUser.isDirty()) {
      const patchDocument = createJsonPatchDocumentFromDirtyForm(
        formEditedUser,
        formEditedUser.values
      );

      const response = await handleDataRequest<
        JsonPatchKeyValuePair[],
        UserResponse
      >(urls.user + "/" + user.id, RequestType.Patch, patchDocument);

      if (response.isSuccess) {
        initialValues.current = formEditedUser.values;

        partiallyUpdateUser(formEditedUser.values);

        toast.success("User edited successfully.");

        modals.closeAll();
      }
    }
  };

  const fetchTeams = async () => {
    var teams = await handleDataRequest<never, TeamResponse[]>(
      urls.team,
      RequestType.Get
    );
    if (teams.isSuccess) {
      var teamsData: SelectItem[] = teams.value.map((x) => ({
        value: x.id,
        label: x.name,
      }));

      setTeamSelectData(teamsData);
    }
  };

  useEffect(() => {
    if (userInputRef.current) {
      userInputRef.current.focus();
    }
    fetchTeams();
  }, []);

  return (
    <Flex direction={"column"} gap={10}>
      <TextInput
        ref={userInputRef}
        key={formEditedUser.key("id")}
        {...formEditedUser.getInputProps("name")}
        withAsterisk
        label={"Name"}
      />

      <TextInput
        {...formEditedUser.getInputProps("surname")}
        withAsterisk
        label={"Surname"}
      />

      <Select
        {...formEditedUser.getInputProps("teamId")}
        withAsterisk
        data={teamSelectData}
        searchable
        label={"Team Name"}
      />

      <Select
        {...formEditedUser.getInputProps("gender")}
        withAsterisk
        data={gendersData}
        searchable
        label={"Gender"}
      />

      <TextInput
        {...formEditedUser.getInputProps("cardNumber")}
        withAsterisk
        label={"Card Number"}
      />

      <PasswordInput
        {...formEditedUser.getInputProps("password")}
        withAsterisk
        label={"Password"}
      />

      <Select
        {...formEditedUser.getInputProps("role")}
        withAsterisk
        data={rolesData}
        searchable
        label={"Role"}
      />

      <Button onClick={(e) => handleSave(e)}>Edit User</Button>
    </Flex>
  );
}

export default EditUser;
