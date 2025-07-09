import { useMemo } from "react";
import { User } from "../../types/user.ts";
import EditUserModal from "./components/EditUserModal.tsx";
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
import useUsers from "../../hooks/useUsers.tsx";
import { useForm } from "@mantine/form";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { genders, roles } from "../../constants/static-data.ts";
import useTeams from "../../hooks/useTeams.tsx";

function Users() {
  const { users, addUser, deleteUser, updateUser } = useUsers();

  const { teamSelectData } = useTeams();

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
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  const openEditUser = (user: User) => {
    modals.open({
      title: "Edit User",
      size: "xl",
      children: <EditUserModal user={user} updateUser={updateUser} />,
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
            {genders.find((y) => y.value === x.gender)?.label}
          </Table.Td>
          <Table.Td> {x.cardNumber} </Table.Td>
          <Table.Td> {x.email} </Table.Td>
          <Table.Td>{roles.find((y) => y.value === x.gender)?.label}</Table.Td>
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
    form.validate();

    if (!form.isValid()) return;

    const retVal = await addUser(form.values);

    if (retVal) {
      form.reset();
      toast.success("User has been added successfully!");
    }
  };

  return (
    <div>
      <Title order={3}>Users</Title>
      <Divider my={15} />
      <Card shadow={"md"} radius={"md"} withBorder>
        <Flex gap={10} direction={"column"}>
          <form>
            <Group grow>
              <TextInput
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
                data={genders}
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
                data={roles}
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
