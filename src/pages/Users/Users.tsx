import { User, UserResponse } from "../../types/user.ts";
import EditUserModal from "./components/EditUserModal.tsx";
import {
  ActionIcon,
  Button,
  Card,
  Checkbox,
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
import { IconEdit, IconSearch } from "@tabler/icons-react";
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
import { useMemo, useState } from "react";
import { TiTick, TiTimes } from "react-icons/ti";
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";
import {
  BOOLEAN_ICON_SIZE,
  SEARCH_ICON_SIZE,
  TITLE_DIVIDER_MY,
} from "../../constants/constants.ts";

function Users() {
  const { users, addUser, updateUser } = useUsers({
    hasValueLabel: false,
    hasActiveUserValueLabel: false,
  });

  const { teamSelectData, activeTeamSelectData } = useTeams({
    hasValueLabel: true,
    hasActiveTeamValueLabel: true,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTeam, setSelectedTeam] = useState("");

  const [selectedRole, setSelectedRole] = useState("");

  const [showActiveUsers, setShowActiveUsers] = useState(true);

  const { handleDataRequest } = useRequestHandler();

  const form = useForm({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      surname: "",
      teamId: null,
      gender: "",
      cardNumber: "",
      email: "",
      password: "",
      role: "",
      searchText: "",
      isActive: false,
      createUser: "",
      createDate: new Date(),
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
      password: (value) =>
        value.trim().length === 0
          ? "Password cannot be empty."
          : value.length < 8
            ? "Password cannot be less than 8 characters."
            : value.length > 32
              ? "Password cannot exceed 32 characters."
              : undefined,
      role: (value) => (!value ? "Role must be selected." : undefined),
    },
  });

  const openEditUser = (user: User) => {
    modals.open({
      title: <Title order={4}>Edit User</Title>,
      size: "xl",
      children: <EditUserModal user={user} updateUser={updateUser} />,
    });
  };

  const changeUserActivity = async (user: User) => {
    if (
      users
        .filter((x) => x.isActive)
        .find((x) => x.cardNumber === user.cardNumber && !x.isActive)
    ) {
      toast.error("There is a active user with the same card number.");
      return;
    }

    if (
      users
        .filter((x) => x.isActive)
        .find((x) => x.email === user.email && !x.isActive)
    ) {
      toast.error("There is a active user with the same email.");
      return;
    }

    const patchDocument = createJsonPatchDocumentFromObject({
      isActive: !user.isActive,
    });

    const response = await handleDataRequest<
      JsonPatchKeyValuePair[],
      UserResponse
    >(`${urls.user}/${user.id}`, RequestType.Patch, patchDocument);

    if (response.isSuccess) {
      updateUser({ ...user, isActive: !user.isActive });

      if (user.isActive) {
        toast.success("User deavtivated successfully.");
        return;
      }

      toast.success("User activated successfully.");
    }
  };

  const handleSave = async () => {
    form.validate();

    if (!form.isValid()) return;

    if (
      users
        .filter((x) => x.isActive)
        .find((x) => x.cardNumber === form.values.cardNumber)
    ) {
      toast.error("There is a active user with the same card number!");
      return;
    }

    if (
      users.filter((x) => x.isActive).find((x) => x.email === form.values.email)
    ) {
      toast.error("There is a user with the same email!");
      return;
    }

    const retVal = await addUser(form.values);

    if (retVal) {
      form.reset();
      toast.success("User has been added successfully!");
    }
  };

  const memoizedUsers = useMemo(
    () =>
      users
        .filter((x) => (showActiveUsers === true ? x.isActive : x))
        .filter((x) =>
          x.searchText.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter((x) =>
          selectedTeam.length > 0 ? x.teamId === selectedTeam : true
        )
        .filter((x) =>
          selectedRole.length > 0 ? x.role.toString() === selectedRole : true
        )
        .map((x: User) => (
          <Table.Tr key={x.id}>
            <Table.Td> {x.name} </Table.Td>
            <Table.Td> {x.surname} </Table.Td>
            <Table.Td>
              {teamSelectData.find((y) => y.value === x.teamId)?.label}
            </Table.Td>
            <Table.Td>{genders[Number(x.gender)].label}</Table.Td>
            <Table.Td> {x.cardNumber} </Table.Td>
            <Table.Td> {x.email} </Table.Td>
            <Table.Td>{roles[Number(x.role)].label}</Table.Td>
            <Table.Td>
              {x.isActive ? (
                <TiTick size={BOOLEAN_ICON_SIZE} color="green" />
              ) : (
                <TiTimes size={BOOLEAN_ICON_SIZE} color="#BA1A1A" />
              )}
            </Table.Td>
            <Table.Td> {x.createUser} </Table.Td>
            <Table.Td>{format(x.createDate, "dd/MM/yyyy - HH.mm")}</Table.Td>
            <Table.Td>
              <Flex justify={"center"} gap={5}>
                {x.isActive ? (
                  <ActionIcon
                    onClick={() => openEditUser(x)}
                    variant={"light"}
                    color={"blue"}
                  >
                    <IconEdit />
                  </ActionIcon>
                ) : (
                  <div></div>
                )}
                <ActionIcon
                  onClick={() => changeUserActivity(x)}
                  variant={"light"}
                  color={x.isActive ? "red" : "green"}
                >
                  {x.isActive ? (
                    <IoMdRemoveCircleOutline size={22} />
                  ) : (
                    <IoMdAddCircleOutline size={22} />
                  )}
                </ActionIcon>
              </Flex>
            </Table.Td>
          </Table.Tr>
        )),
    [users, searchQuery, showActiveUsers, selectedTeam, selectedRole]
  );

  return (
    <div>
      <Title order={3}>Users</Title>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card shadow={"xs"} radius={"md"} withBorder>
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
              data={activeTeamSelectData}
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
                  <Radio value={x.value} label={x.label}></Radio>
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
                  <Radio value={x.value} label={x.label}></Radio>
                ))}
              </Group>
            </Radio.Group>
          </Flex>
        </Flex>
        <Button
          onClick={handleSave}
          variant={"light"}
          style={{ flexGrow: 1, marginTop: 15 }}
        >
          Add New User
        </Button>
      </Card>
      <Card mt={"xs"} withBorder radius={"md"} padding="sm">
        <Flex gap={"xs"} align={"center"}>
          <TextInput
            size="xs"
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE}></IconSearch>}
            style={{ flexGrow: 120 }}
            {...form.getInputProps("searchText")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            data={teamSelectData}
            searchable
            placeholder="Select Team"
            style={{ flexGrow: 1 }}
            clearable
            onChange={(e) => setSelectedTeam(e ? e : "")}
          />
          <Select
            data={roles}
            searchable
            placeholder="Select Role"
            style={{ flexGrow: 1 }}
            clearable
            onChange={(e) => setSelectedRole(e ? e : "")}
          />
          <Checkbox
            labelPosition="left"
            label={"Show Active Users"}
            style={{ marginLeft: "10px" }}
            checked={showActiveUsers}
            onChange={() => setShowActiveUsers(!showActiveUsers)}
            type="checkbox"
          />
        </Flex>

        <Table
          striped
          stickyHeader
          highlightOnHover
          withTableBorder
          withColumnBorders
          mt={15}
          style={{ tableLayout: "fixed" }}
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
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{memoizedUsers}</Table.Tbody>
        </Table>
      </Card>
    </div>
  );
}

export default Users;
