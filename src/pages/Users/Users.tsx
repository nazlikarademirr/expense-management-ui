import { User, UserResponse } from "../../types/user.ts";
import EditUserModal from "./components/EditUserModal.tsx";
import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  PasswordInput,
  Radio,
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
import {
  createJsonPatchDocumentFromObject,
  JsonPatchKeyValuePair,
} from "../../types/json-patch-document.ts";
import useRequestHandler from "../../hooks/useRequestHandler.tsx";
import urls from "../../constants/urls.ts";
import RequestType from "../../request-handler/request-type.ts";
import { useMemo } from "react";

function Users() {
  const { users, addUser, updateUser } = useUsers({
    hasValueLabel: false,
  });

  const { teamSelectData } = useTeams({
    hasValueLabel: true,
  });

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
        value === null ? "Team must be selected." : undefined,
      gender: (value) =>
        value === null ? "Gender must be selected." : undefined,
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
      role: (value) => (value === null ? "Role must be selected." : undefined),
    },
  });

  const openEditUser = (user: User) => {
    modals.open({
      title: "Edit User",
      size: "xl",
      children: <EditUserModal user={user} updateUser={updateUser} />,
    });
  };

  const disableUser = async (user: User) => {
    const patchDocument = createJsonPatchDocumentFromObject({
      isActive: false,
    });

    const response = await handleDataRequest<
      JsonPatchKeyValuePair[],
      UserResponse
    >(`${urls.user}/${user.id}`, RequestType.Patch, patchDocument);

    if (response.isSuccess) {
      updateUser({ ...user, isActive: false });

      toast.success("User deleted successfully.");
    }
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
          <Table.Td>{x.gender ? genders[x.gender].label : ""}</Table.Td>
          <Table.Td> {x.cardNumber} </Table.Td>
          <Table.Td> {x.email} </Table.Td>
          <Table.Td>{x.role ? roles[x.role].label : ""}</Table.Td>
          <Table.Td> {String(x.isActive)} </Table.Td>
          <Table.Td> {x.createUser} </Table.Td>
          <Table.Td>{format(x.createDate, "dd/MM/yyyy - HH.mm")}</Table.Td>
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
                onClick={() => disableUser(x)}
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
            <Radio.Group
              label="Gender"
              withAsterisk
              style={{ flexGrow: 1 }}
              {...form.getInputProps("gender")}
            >
              <Group mt="xs">
                {genders.map((x) => (
                  <Radio value={x.value.toString()} label={x.label}></Radio>
                ))}
              </Group>
            </Radio.Group>

            <Radio.Group
              label="Role"
              withAsterisk
              style={{ flexGrow: 1 }}
              {...form.getInputProps("role")}
            >
              <Group mt="xs">
                {roles.map((x) => (
                  <Radio value={x.value.toString()} label={x.label}></Radio>
                ))}
              </Group>
            </Radio.Group>
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
