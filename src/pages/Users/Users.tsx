import {
  User,
  UserRequest,
  UserResponse,
} from "../../types/user.types.ts";

import {
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  ScrollArea,
  Select,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import useUsers from "../../hooks/useUsers.tsx";
import toast from "react-hot-toast";
import { roles } from "../../constants/static-data.ts";
import {
  createJsonPatchDocumentFromObject,
  JsonPatchKeyValuePair,
} from "../../types/json-patch-document.ts";
import useRequestHandler from "../../hooks/useRequestHandler.tsx";
import urls from "../../constants/urls.ts";
import RequestType from "../../request-handler/request-type.ts";
import { useEffect, useMemo, useState } from "react";
import {
  PAGE_FLEX_HEIGHT,
  SEARCH_ICON_SIZE,
  TITLE_DIVIDER_MY,
} from "../../constants/constants.ts";
import { SelectItem } from "../../types/select-item.types.ts";
import { Team } from "../../types/team.types.ts";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider.tsx";
import Dictionary from "../../helpers/translation/dictionary.ts";
import { useTranslation } from "react-i18next";
import { PiPlusCircle } from "react-icons/pi";
import EditUser from "./components/EditUser.tsx";


function Users() {
  const { users, addUser, updateUser, replaceUsers } = useUsers();

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const [showActiveUsers, setShowActiveUsers] = useState(true);

  const [activeTeamSelectData, setActiveTeamSelectData] = useState<
    SelectItem[]
  >([]);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserData, setEditingUserData] = useState<User | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(false);

  const { handleDataRequest } = useRequestHandler();

  const auth = useAuthentication();
  const { t } = useTranslation();

  const handleAddNewClick = () => {
    setEditingUserId("NEW_USER");
    setEditingUserData({
      id: "NEW_USER",
      name: "",
      surname: "",
      teamId: null,
      teamName: "",
      title: "",
      email: "",
      role: "",
      hideExpenses: false,
      temporaryPassword: "",
      hasTemporaryPassword: false,
      isActive: true,
      searchText: "",
      createUserId: "",
      createUserFullName: "",
      createDate: new Date(),
    });
    setEditErrors({});
  };

  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setEditingUserData({ ...user });
    setEditErrors({});
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingUserData(null);
    setEditErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editingUserData) return;

    setIsLoading(true);

    const errors: Record<string, string> = {};
    let hasError = false;

    if (
      !editingUserData.name.trim() ||
      editingUserData.name.trim().length < 2
    ) {
      errors.name = t(Dictionary.User.NAME_MIN_LENGTH);
      hasError = true;
    }
    if (
      !editingUserData.surname.trim() ||
      editingUserData.surname.trim().length < 2
    ) {
      errors.surname = t(Dictionary.User.SURNAME_MIN_LENGTH);
      hasError = true;
    }
    if (
      !editingUserData.title.trim() ||
      editingUserData.title.trim().length < 2
    ) {
      errors.title = t(Dictionary.User.TITLE_MIN_LENGTH);
      hasError = true;
    }
    if (!editingUserData.email.includes("@acibadem.com")) {
      errors.email = t(Dictionary.User.EMAIL_RULE);
      hasError = true;
    } else if (
      !editingUserData.email.trim() ||
      editingUserData.email.trim().length < 14
    ) {
      errors.email = t(Dictionary.User.EMAIL_MIN_LENGTH);
      hasError = true;
    }
    if (!editingUserData.teamId) {
      errors.teamId = t(Dictionary.User.TEAM_MUST_BE_SELECTED);
      hasError = true;
    }
    if (!editingUserData.role && editingUserData.role !== "0") {
      errors.role = t(Dictionary.User.ROLE_MUST_BE_SELECTED);
      hasError = true;
    }

    if (hasError) {
      setEditErrors(errors);
      setIsLoading(false);
      return;
    }

    if (
      !checkIfUserIsValid({
        ...editingUserData,
        teamId: String(editingUserData.teamId),
      })
    ) {
      setIsLoading(false);
      return;
    }

    if (editingUserData.id === "NEW_USER") {
      const userRequest: UserRequest = {
        ...editingUserData,
        name: editingUserData.name.trim(),
        surname: editingUserData.surname.trim(),
        teamId: editingUserData.teamId ?? "",
        email: editingUserData.email.trim(),
        role: Number(editingUserData.role),
        temporaryPassword: null,
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
        role: response.value.role.toString(),
        createUserFullName: auth.currentUserFullName,
      });

      toast.success(t(Dictionary.User.ADDED));
    } else {
      const userRequest: UserRequest = {
        ...editingUserData,
        name: editingUserData.name.trim(),
        surname: editingUserData.surname.trim(),
        teamId: editingUserData.teamId ?? "",
        email: editingUserData.email.trim(),
        role: Number(editingUserData.role),
        temporaryPassword: null,
        hasTemporaryPassword: false,
      };

      const response = await handleDataRequest<UserRequest, UserResponse>(
        `${urls.user}/${editingUserData.id}`,
        RequestType.Put,
        userRequest,
      );

      if (!response.isSuccess) {
        setIsLoading(false);
        return;
      }

      updateUser(editingUserData);

      toast.success(t(Dictionary.User.UPDATED));
    }

    setEditingUserId(null);
    setEditingUserData(null);
    setIsLoading(false);
  };

  const getActiveTeams = async () => {
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
      role: x.role.toString(),
    }));

    replaceUsers(users);
  };

  const checkIfUserIsValid = (user: User) => {
    if (
      users.some(
        (x) => x.id !== user.id && x.email.trim() === user.email.trim(),
      )
    ) {
      toast.error(t(Dictionary.User.SAME_EMAIL));
      return false;
    }

    return true;
  };

  const changeUserActivity = async (user: User) => {
    setIsLoading(true);

    if (auth.currentUser?.id === user.id) {
      toast.error(t(Dictionary.User.DEACTIVITY_RULE));
      setIsLoading(false);
      return;
    }

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
      toast.success(t(Dictionary.User.DEACTIVATED));
      setIsLoading(false);
      return;
    }

    toast.success(t(Dictionary.User.ACTIVATED));

    setIsLoading(false);
  };

  const openTemporaryPasswordModal = (user: User) => {
    modals.open({
      title: <Title order={5}>{t(Dictionary.User.TEMPORARY_PASSWORD)}</Title>,
      size: "md",
      closeOnClickOutside: false,
      children: (
        <Flex direction="column" gap={20}>
          <Badge size="xl" color="purple" variant="dot">
            {user.temporaryPassword}
          </Badge>
          <Flex direction="row">
            <Button onClick={() => modals.closeAll()} variant="light" fullWidth>
              {t(Dictionary.Common.CLOSE)}
            </Button>
          </Flex>
        </Flex>
      ),
    });
  };

  const openUserActivityModal = (user: User) => {
    modals.open({
      title: user.isActive ? (
        <Title order={4}>{t(Dictionary.User.DEACTIVATE)}</Title>
      ) : (
        <Title order={4}>{t(Dictionary.User.ACTIVATE)}</Title>
      ),
      size: "lg",
      closeOnClickOutside: false,
      children: (
        <Flex direction="column" gap={20}>
          {user.isActive
            ? t(Dictionary.User.DEACTIVITY_QUESTION)
            : t(Dictionary.User.ACTIVITY_QUESTION)}
          <Flex direction="row" gap={10} mt={10}>
            <Button
              loading={isLoading}
              onClick={() => {
                changeUserActivity(user);
                modals.closeAll();
              }}
              variant="light"
              flex={1}
              style={
                user.isActive
                  ? { color: "red", backgroundColor: "#ffeeee" }
                  : { color: "green", backgroundColor: "#e7ffe0" }
              }
            >
              {user.isActive
                ? t(Dictionary.User.DEACTIVATE)
                : t(Dictionary.User.ACTIVATE)}
            </Button>
            <Button onClick={() => modals.closeAll()} flex={1} variant="light">
              {t(Dictionary.Common.CANCEL)}
            </Button>
          </Flex>
        </Flex>
      ),
    });
  };

  const titleSelectData = useMemo(() => {
    return [
      ...new Map(
        users.map((user) => [
          user.title,
          { value: user.id, label: user.title },
        ]),
      ).values(),
    ];
  }, [users]);

  const memoizedUsers = useMemo(() => {
    let userList = users
      .filter((x) => (showActiveUsers === true ? x.isActive : x))
      .filter((x) =>
        x.searchText.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .filter((x) => (selectedTeam ? x.teamId === selectedTeam : true))
      .filter((x) => (selectedRole ? x.role === selectedRole : true));

    if (editingUserId === "NEW_USER" && editingUserData) {
      userList = [editingUserData, ...userList];
    }

    return userList.map((x: User) => {
      const isEditing = editingUserId === x.id;

      return (
        <EditUser
          key={x.id}
          user={x}
          isEditing={isEditing}
          editingUserData={editingUserData}
          setEditingUserData={setEditingUserData}
          editErrors={editErrors}
          setEditErrors={setEditErrors}
          titleSelectData={titleSelectData}
          activeTeamSelectData={activeTeamSelectData}
          isLoading={isLoading}
          handleSaveEdit={handleSaveEdit}
          handleCancelEdit={handleCancelEdit}
          handleEditClick={handleEditClick}
          openUserActivityModal={openUserActivityModal}
          openTemporaryPasswordModal={openTemporaryPasswordModal}
        />
      );
    });
  }, [
    users,
    searchQuery,
    showActiveUsers,
    selectedTeam,
    selectedRole,
    isLoading,
    activeTeamSelectData,
    titleSelectData,
    editingUserId,
    editingUserData,
    editErrors,
  ]);

  useEffect(() => {
    getUsers();
    getActiveTeams();
  }, []);

  return (
    <Flex direction="column" h={PAGE_FLEX_HEIGHT}>
      <Flex justify="space-between" align="center">
        <Title order={3}>{t(Dictionary.Common.USERS)}</Title>
        <Button
          onClick={handleAddNewClick}
          variant="light"
          leftSection={<PiPlusCircle size={22} />}
          disabled={editingUserId !== null}
        >
          {t(Dictionary.User.ADD_NEW)}
        </Button>
      </Flex>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card mt="xs" withBorder radius="md" padding="sm" flex={1}>
        <Flex gap="xs" align="center" mb="md">
          <TextInput
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE} />}
            flex={5}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            data={activeTeamSelectData}
            searchable
            comboboxProps={{ withinPortal: false }}
            placeholder={t(Dictionary.User.SELECT_TEAM)}
            flex={1}
            clearable
            onChange={(e) => setSelectedTeam(e ?? "")}
          />
          <Select
            data={roles}
            searchable
            comboboxProps={{ withinPortal: false }}
            placeholder={t(Dictionary.User.SELECT_ROLE)}
            flex={1}
            clearable
            onChange={(e) => setSelectedRole(e ?? "")}
          />
          <Checkbox
            labelPosition="left"
            label={t(Dictionary.User.SHOW_ACTIVE)}
            ml={10}
            checked={showActiveUsers}
            onChange={() => setShowActiveUsers(!showActiveUsers)}
            type="checkbox"
          />
        </Flex>
        <ScrollArea flex={1}>
          <Table
            striped
            stickyHeader
            highlightOnHover
            withTableBorder
            withColumnBorders
            layout="fixed"
            miw={1720}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={150}>{t(Dictionary.User.NAME)}</Table.Th>
                <Table.Th w={150}>{t(Dictionary.User.SURNAME)}</Table.Th>
                <Table.Th w={250}>{t(Dictionary.User.TITLE)}</Table.Th>
                <Table.Th w={220}>{t(Dictionary.User.TEAM_NAME)}</Table.Th>
                <Table.Th w={300}>{t(Dictionary.User.EMAIL)}</Table.Th>
                <Table.Th w={150}>{t(Dictionary.User.ROLE)}</Table.Th>
                <Table.Th w={100}>{t(Dictionary.Common.STATUS)}</Table.Th>
                <Table.Th w={400}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{memoizedUsers}</Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>
    </Flex>
  );
}

export default Users;
