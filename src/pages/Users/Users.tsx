import userSchema, {
  User,
  UserRequest,
  UserResponse,
} from "../../types/user.types.ts";
import EditUserModal from "./components/EditUserModal.tsx";
import {
  ActionIcon,
  Badge,
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
  Tooltip,
} from "@mantine/core";
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import useUsers from "../../hooks/useUsers.tsx";
import { useForm } from "@mantine/form";
import toast from "react-hot-toast";
import { genders, roles } from "../../constants/static-data.ts";
import {
  createJsonPatchDocumentFromObject,
  JsonPatchKeyValuePair,
} from "../../types/json-patch-document.ts";
import useRequestHandler from "../../hooks/useRequestHandler.tsx";
import urls from "../../constants/urls.ts";
import RequestType from "../../request-handler/request-type.ts";
import { useEffect, useMemo, useState } from "react";
import { TiTick, TiTimes } from "react-icons/ti";
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";
import {
  BOOLEAN_ICON_SIZE,
  SEARCH_ICON_SIZE,
  TITLE_DIVIDER_MY,
} from "../../constants/constants.ts";
import { SelectItem } from "../../types/select-item.types.ts";
import { Team } from "../../types/team.types.ts";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { RiLockPasswordLine } from "react-icons/ri";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider.tsx";
import { useNavigate } from "react-router";
import routes from "../../constants/routes.ts";

const MIN_INPUT_HEIGHT = 80;
const MIN_INPUT_WIDTH = 250;

function Users() {
  const { users, addUser, updateUser, replaceUsers } = useUsers();

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const [showActiveUsers, setShowActiveUsers] = useState(true);

  const [activeTeamSelectData, setActiveTeamSelectData] = useState<
    SelectItem[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuthentication();

  const navigate = useNavigate();

  const { handleDataRequest } = useRequestHandler();

  if (!auth.currentUser) {
    auth.logout();
    navigate(routes.login);
    toast.error("A problem occurred with the user.");
  }

  const form = useForm<User>({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      surname: "",
      teamId: "",
      teamName: "",
      gender: "",
      cardNumber: "",
      email: "",
      password: "",
      role: "",
      temporaryPassword: "",
      hasTemporaryPassword: false,
      isActive: false,
      searchText: "",
      createUser: "",
      createUserFullName: "",
      createDate: new Date(),
    },
    validate: zod4Resolver(userSchema),
  });

  const openEditUser = (user: User) => {
    modals.open({
      title: <Title order={4}>Edit User</Title>,
      size: "xl",
      children: (
        <EditUserModal
          user={user}
          activeTeamSelectData={activeTeamSelectData}
          updateUser={updateUser}
          checkIfUserIsValid={checkIfUserIsValid}
        />
      ),
    });
  };

  const getActiveTeamsSelectData = async () => {
    const activeTeamResponse = await handleDataRequest<never, Team[]>(
      urls.team,
      RequestType.Get,
      undefined,
      { isActive: true },
    );

    if (!activeTeamResponse.isSuccess) return;

    setActiveTeamSelectData(
      activeTeamResponse.value.map((x) => ({ value: x.id, label: x.name })),
    );
  };

  const getUsers = async () => {
    const response = await handleDataRequest<never, User[]>(
      urls.user,
      RequestType.Get,
    );

    if (!response.isSuccess) return;

    const users: User[] = response.value.map((x) => ({
      ...x,
      gender: x.gender.toString(),
      role: x.role.toString(),
    }));

    replaceUsers(users);
  };

  const checkIfUserIsValid = (user: User) => {
    if (
      users.some(
        (x) =>
          x.id !== user.id && x.cardNumber.trim() === user.cardNumber.trim(),
      )
    ) {
      toast.error("There is a user with the same card number!");
      return false;
    }

    if (
      users.some(
        (x) => x.id !== user.id && x.email.trim() === user.email.trim(),
      )
    ) {
      toast.error("There is a user with the same email!");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setIsLoading(true);

    form.validate();

    if (!form.isValid()) {
      setIsLoading(false);
      return;
    }

    if (
      !checkIfUserIsValid({
        ...form.values,
        teamId: String(form.values.teamId),
      })
    ) {
      setIsLoading(false);
      return;
    }

    const userRequest: UserRequest = {
      name: form.values.name,
      surname: form.values.surname,
      teamId: form.values.teamId ?? "",
      gender: Number(form.values.gender),
      cardNumber: form.values.cardNumber,
      email: form.values.email,
      password: form.values.password,
      role: Number(form.values.role),
      temporaryPassword: "",
      hasTemporaryPassword: false,
      isActive: true,
    };

    const response = await handleDataRequest<UserRequest, UserResponse>(
      urls.user,
      RequestType.Post,
      userRequest,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    addUser({
      ...response.value,
      gender: response.value.gender.toString(),
      role: response.value.role.toString(),
    });

    form.reset();

    toast.success("User has been added successfully!");

    setIsLoading(false);
  };

  const changeUserActivity = async (user: User) => {
    setIsLoading(true);

    const patchDocument = createJsonPatchDocumentFromObject({
      isActive: !user.isActive,
    });

    const response = await handleDataRequest<
      JsonPatchKeyValuePair[],
      UserResponse
    >(`${urls.user}/${user.id}`, RequestType.Patch, patchDocument);

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    updateUser({ ...user, isActive: !user.isActive });

    if (user.isActive) {
      toast.success("User deactivated successfully.");
      setIsLoading(false);
      return;
    }

    toast.success("User activated successfully.");

    setIsLoading(false);
  };

  const openTemporaryPasswordModal = (user: User) => {
    modals.open({
      title: <Title order={5}>Temporary Password</Title>,
      size: "md",
      children: (
        <Flex direction="column" gap={20}>
          <Badge size="xl" color="cyan" variant="dot">
            {user.temporaryPassword}
          </Badge>
          <Flex direction="row">
            <Button
              onClick={() => modals.closeAll()}
              variant="light"
              color="cyan"
              fullWidth
            >
              Close
            </Button>
          </Flex>
        </Flex>
      ),
    });
  };

  const memoizedUsers = useMemo(
    () =>
      users
        .filter((x) => (showActiveUsers === true ? x.isActive : x))
        .filter((x) =>
          x.searchText.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .filter((x) => (selectedTeam ? x.teamId === selectedTeam : true))
        .filter((x) => (selectedRole ? x.role === selectedRole : true))
        .map((x: User) => (
          <Table.Tr key={x.id}>
            <Table.Td> {x.name} </Table.Td>
            <Table.Td> {x.surname} </Table.Td>
            <Table.Td>{x.teamName}</Table.Td>
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
            <Table.Td>{x.createUser}</Table.Td>
            <Table.Td>
              <Flex justify="center" gap={5}>
                {x.isActive && (
                  <Tooltip label="Edit" withArrow>
                    <ActionIcon
                      onClick={() => openEditUser(x)}
                      variant="light"
                      color="blue"
                    >
                      <IconEdit />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Tooltip
                  label={x.isActive ? "Deactivate User" : "Activate User"}
                  withArrow
                >
                  <ActionIcon
                    onClick={() => changeUserActivity(x)}
                    variant="light"
                    color={x.isActive ? "red" : "green"}
                    loading={isLoading}
                  >
                    {x.isActive ? (
                      <IoMdRemoveCircleOutline size={22} />
                    ) : (
                      <IoMdAddCircleOutline size={22} />
                    )}
                  </ActionIcon>
                </Tooltip>
                {x.hasTemporaryPassword && (
                  <Tooltip label="Temporary Password" withArrow>
                    <ActionIcon
                      onClick={() => openTemporaryPasswordModal(x)}
                      variant="light"
                      color="grape"
                      loading={isLoading}
                    >
                      <RiLockPasswordLine size={22} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Flex>
            </Table.Td>
          </Table.Tr>
        )),
    [
      users,
      searchQuery,
      showActiveUsers,
      selectedTeam,
      selectedRole,
      isLoading,
    ],
  );

  useEffect(() => {
    getUsers();
    getActiveTeamsSelectData();
  }, []);

  return (
    <>
      <Title order={3}>Users</Title>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card shadow="xs" radius="md" withBorder>
        <Flex gap="xl" direction="row" justify="center">
          <Flex gap="xl" direction="column" style={{ flexGrow: 1 }}>
            <TextInput
              {...form.getInputProps("name")}
              withAsterisk
              style={{
                flexGrow: 1,
                minHeight: MIN_INPUT_HEIGHT,
                minWidth: MIN_INPUT_WIDTH,
              }}
              label="Name"
            />

            <TextInput
              {...form.getInputProps("cardNumber")}
              withAsterisk
              style={{
                flexGrow: 1,
                minHeight: MIN_INPUT_HEIGHT,
                minWidth: MIN_INPUT_WIDTH,
              }}
              label="Card Number"
            />
          </Flex>
          <Flex gap="xl" direction="column" style={{ flexGrow: 1 }}>
            <TextInput
              {...form.getInputProps("surname")}
              withAsterisk
              style={{
                flexGrow: 1,
                minHeight: MIN_INPUT_HEIGHT,
                minWidth: MIN_INPUT_WIDTH,
              }}
              label="Surname"
            />

            <TextInput
              {...form.getInputProps("email")}
              withAsterisk
              style={{
                flexGrow: 1,
                minHeight: MIN_INPUT_HEIGHT,
                minWidth: MIN_INPUT_WIDTH,
              }}
              label="Email"
            />
          </Flex>
          <Flex gap="xl" direction="column" style={{ flexGrow: 1 }}>
            <Select
              {...form.getInputProps("teamId")}
              withAsterisk
              data={activeTeamSelectData}
              searchable
              style={{
                flexGrow: 1,
                minHeight: MIN_INPUT_HEIGHT,
                minWidth: MIN_INPUT_WIDTH,
              }}
              label="Team Name"
            />

            <PasswordInput
              {...form.getInputProps("password")}
              withAsterisk
              style={{
                flexGrow: 1,
                minHeight: MIN_INPUT_HEIGHT,
                minWidth: MIN_INPUT_WIDTH,
              }}
              label="Password"
            />
          </Flex>
          <Flex gap="xl" direction="column" style={{ flexGrow: 1 }}>
            <Radio.Group
              label="Gender"
              withAsterisk
              style={{
                flexGrow: 1,
                minHeight: MIN_INPUT_HEIGHT,
                minWidth: MIN_INPUT_WIDTH,
              }}
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
              style={{
                flexGrow: 1,
                minHeight: MIN_INPUT_HEIGHT,
                minWidth: MIN_INPUT_WIDTH,
              }}
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
          variant="light"
          style={{ flexGrow: 1, marginTop: 15 }}
          loading={isLoading}
        >
          Add New User
        </Button>
      </Card>
      <Card mt="xs" withBorder radius="md" padding="sm">
        <Flex gap="xs" align="center">
          <TextInput
            size="xs"
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE} />}
            style={{ flexGrow: 120 }}
            {...form.getInputProps("searchText")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            data={activeTeamSelectData}
            searchable
            placeholder="Select Team"
            style={{ flexGrow: 1 }}
            clearable
            onChange={(e) => setSelectedTeam(e ?? "")}
          />
          <Select
            data={roles}
            searchable
            placeholder="Select Role"
            style={{ flexGrow: 1 }}
            clearable
            onChange={(e) => setSelectedRole(e ?? "")}
          />
          <Checkbox
            labelPosition="left"
            label="Show Active Users"
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
              <Table.Th>Status</Table.Th>
              <Table.Th>Create User</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{memoizedUsers}</Table.Tbody>
        </Table>
      </Card>
    </>
  );
}

export default Users;
