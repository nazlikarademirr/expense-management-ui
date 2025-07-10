import { useMemo } from "react";
import { User } from "../../types/user.ts";
import EditUserModal from "./components/EditUserModal.tsx";
import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Flex,
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
  const { users, addUser, deleteUser, updateUser } = useUsers({
    hasValueLabel: false,
  });

  const { teamSelectData } = useTeams({
    hasValueLabel: true,
  });

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
        <Flex gap={"xl"} direction={"row"}>
          <Flex gap={"xl"} direction={"column"} style={{ flexGrow: 1 }}>
            <TextInput
              {...form.getInputProps("name")}
              withAsterisk
              style={{ flexGrow: 1 }}
              label={"Name"}
            />

            <TextInput
              {...form.getInputProps("cardNumber")}
              withAsterisk
              style={{ flexGrow: 1 }}
              label={"Card Number"}
            />
          </Flex>
          <Flex gap={"xl"} direction={"column"} style={{ flexGrow: 1 }}>
            <TextInput
              {...form.getInputProps("surname")}
              withAsterisk
              style={{ flexGrow: 1 }}
              label={"Surname"}
            />

            <TextInput
              {...form.getInputProps("email")}
              withAsterisk
              style={{ flexGrow: 1 }}
              label={"Email"}
            />
          </Flex>
          <Flex gap={"xl"} direction={"column"} style={{ flexGrow: 1 }}>
            <Select
              {...form.getInputProps("teamId")}
              withAsterisk
              data={teamSelectData}
              searchable
              style={{ flexGrow: 1 }}
              label={"Team Name"}
            />

            <PasswordInput
              {...form.getInputProps("password")}
              withAsterisk
              style={{ flexGrow: 1 }}
              label={"Password"}
            />
          </Flex>
          <Flex gap={"xl"} direction={"column"} style={{ flexGrow: 1 }}>
            <Select
              {...form.getInputProps("gender")}
              withAsterisk
              data={genders}
              searchable
              style={{ flexGrow: 1 }}
              label={"Gender"}
            />

            <Select
              {...form.getInputProps("role")}
              withAsterisk
              data={roles}
              searchable
              style={{ flexGrow: 1 }}
              label={"Role"}
            />
          </Flex>
        </Flex>
        <Flex>
          <Button
            onClick={handleSave}
            variant={"light"}
            style={{ flexGrow: 1, marginTop: "10px" }}
          >
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
