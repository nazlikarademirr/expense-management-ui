import { useEffect, useMemo, useState } from "react";
import { User } from "../../types/user.ts";
import EditUser from "./components/EditUser.tsx";
import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  PasswordInput,
  Select,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import useUsers from "./hooks/useUsers.tsx";
import useRequestHandler from "../../hooks/useRequestHandler.tsx";
import urls from "../../constants/urls.ts";
import { SelectItem } from "../../types/select-item.ts";
import { TeamResponse } from "../../types/team.ts";
import Gender from "../../enums/gender.ts";
import Role from "../../enums/role.ts";
import RequestType from "../../request-handler/request.type.ts";
import { useForm } from "@mantine/form";
import toast from "react-hot-toast";
import { format } from "date-fns";

function Users() {
  const { users, addUser, updateUser, deleteUser } = useUsers();

  const [teamSelectData, setTeamSelectData] = useState<SelectItem[]>([]);

  const { handleDataRequest } = useRequestHandler();

  const form = useForm({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      surname: "",
      teamId: null,
      gender: null,
      cardNumber: "",
      email: "",
      password: "",
      role: null,
      searchText: "",
      isActive: false,
      createUser: "",
      createDate: new Date(),
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "First name must have at least 2 letters" : null,
    },
  });

  // const handleSetUser = (user: User) => {
  //   form.setValues({
  //     id: user.id,
  //     name: user.name,
  //     surname: user.surname,
  //     teamId: user.teamId,
  //     gender: user.gender,
  //     cardNumber: user.cardNumber,
  //     email: user.email,
  //     password: user.password,
  //     role: user.role,
  //     searchText: user.searchText,
  //     isActive: user.isActive,
  //     creareUser: user.createUser,
  //     createDate: user.createDate,
  //   });
  // };

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

  const openEditUser = (user: User) => {
    modals.open({
      title: "Edit User",
      size: "xl",
      children: <EditUser user={user} updateUser={updateUser} />,
    });
  };

  const memoizedUsers = useMemo(
    () =>
      users.map((x: User) => (
        <Table.Tr key={x.id}>
          <Table.Td> {x.name} </Table.Td>
          <Table.Td> {x.surname} </Table.Td>
          <Table.Td>
            {teamSelectData.find((y) => y.value === x.teamId)?.label}
          </Table.Td>
          <Table.Td>
            {gendersData.find((y) => y.value === x.gender)?.label}
          </Table.Td>
          <Table.Td> {x.cardNumber} </Table.Td>
          <Table.Td> {x.email} </Table.Td>
          <Table.Td>
            {rolesData.find((y) => y.value === x.gender)?.label}
          </Table.Td>
          <Table.Td> {"true"} </Table.Td>
          <Table.Td> {x.createUser} </Table.Td>
          <Table.Td>{format(x.createDate, "dd/MM/yyyy HH:mm")}</Table.Td>
          <Table.Td>
            <Flex justify={"center"} gap={5}>
              <ActionIcon
                onClick={() => openEditUser(x)}
                variant={"light"}
                color={"blue"}
              >
                <IconEdit />
              </ActionIcon>
              <ActionIcon
                onClick={() => deleteUser(x.id)}
                variant={"light"}
                color={"red"}
              >
                <IconTrash />
              </ActionIcon>
            </Flex>
          </Table.Td>
        </Table.Tr>
      )),
    [users]
  );

  const handleSave = async () => {
    if (!form.isValid()) return;

    const retVal = await addUser(form.values);

    if (retVal) {
      form.reset();
      toast.success("User has been added successfully!");
    }
  };

  const fetchTeams = async () => {
    var teams = await handleDataRequest<unknown, TeamResponse[]>(
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
    fetchTeams();
  }, []);

  return (
    <div>
      <Title order={3}>Users</Title>
      <Divider my={15} />
      <Card shadow={"md"} radius={"md"} withBorder>
        <Flex gap={10} direction={"column"}>
          <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <Group grow>
              <TextInput
                key={form.key("name")}
                {...form.getInputProps("name")}
                withAsterisk
                label={"Name"}
              />

              <TextInput
                {...form.getInputProps("surname")}
                withAsterisk
                label={"Surname"}
              />

              <Select
                {...form.getInputProps("teamId")}
                withAsterisk
                data={teamSelectData}
                searchable
                label={"Team Name"}
              />

              <Select
                {...form.getInputProps("gender")}
                withAsterisk
                data={gendersData}
                searchable
                label={"Gender"}
              />

              <TextInput
                {...form.getInputProps("cardNumber")}
                withAsterisk
                label={"Card Number"}
              />

              <TextInput
                {...form.getInputProps("email")}
                withAsterisk
                label={"Email"}
              />

              <PasswordInput
                {...form.getInputProps("password")}
                withAsterisk
                label={"Password"}
              />

              <Select
                {...form.getInputProps("role")}
                withAsterisk
                data={rolesData}
                searchable
                label={"Role"}
              />
            </Group>
          </form>
          <Button onClick={handleSave} variant={"light"}>
            Add New User
          </Button>
        </Flex>
      </Card>
      <Table
        stickyHeader
        highlightOnHover
        withTableBorder
        withColumnBorders
        mt={16}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Surname</Table.Th>
            <Table.Th>Team Name</Table.Th>
            <Table.Th>Gender</Table.Th>
            <Table.Th>Card Number</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Is Active</Table.Th>
            <Table.Th>Create User</Table.Th>
            <Table.Th>Create Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{memoizedUsers}</Table.Tbody>
      </Table>
    </div>
  );
}

export default Users;
