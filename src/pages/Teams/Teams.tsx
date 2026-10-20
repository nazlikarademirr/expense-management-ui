import { useForm } from "@mantine/form";
import teamSchema, { Team, TeamRequest } from "../../types/team.types";
import { modals } from "@mantine/modals";
import useTeams from "../../hooks/useTeams";
import {
  Autocomplete,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  ScrollArea,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import EditTeam from "./components/EditTeam";
import {
  createJsonPatchDocumentFromObject,
  JsonPatchKeyValuePair,
} from "../../types/json-patch-document";
import RequestType from "../../request-handler/request-type";
import urls from "../../constants/urls";
import useRequestHandler from "../../hooks/useRequestHandler";
import {
  PAGE_FLEX_HEIGHT,
  SEARCH_ICON_SIZE,
  TITLE_DIVIDER_MY,
} from "../../constants/constants";
import useUsers from "../../hooks/useUsers";
import { User } from "../../types/user.types";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider";
import { useTranslation } from "react-i18next";
import Dictionary from "../../helpers/translation/dictionary";
import { PiPlusCircle } from "react-icons/pi";
import Role from "../../enums/role";

const MIN_INPUT_HEIGHT = 80;

function Teams() {
  const { teams, addTeam, updateTeam, replaceTeams } = useTeams();

  const { users, replaceUsers } = useUsers();

  const [searchQuery, setSearchQuery] = useState("");

  const [showActiveTeams, setShowActiveTeams] = useState(true);

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamData, setEditingTeamData] = useState<Team | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuthentication();

  const { t } = useTranslation();

  const form = useForm<Team>({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      department: "",
      departmentManager: "",
      departmentHead: "",
      searchText: "",
      isActive: false,
      createUserId: "",
      createUserFullName: "",
      createDate: new Date(),
    },
    validate: zod4Resolver(teamSchema),
  });

  const handleEditClick = (team: Team) => {
    setEditingTeamId(team.id);
    setEditingTeamData({ ...team });
    setEditErrors({});
  };

  const handleCancelEdit = () => {
    setEditingTeamId(null);
    setEditingTeamData(null);
    setEditErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editingTeamData) return;

    setIsLoading(true);

    const errors: Record<string, string> = {};
    let hasError = false;

    if (
      !editingTeamData.name.trim() ||
      editingTeamData.name.trim().length < 2
    ) {
      errors.name = t(Dictionary.Team.NAME_MIN_LENGTH);
      hasError = true;
    } else if (editingTeamData.name.trim().length > 128) {
      errors.name = t(Dictionary.Team.NAME_MAX_LENGTH);
      hasError = true;
    }

    if (
      !editingTeamData.department.trim() ||
      editingTeamData.department.trim().length < 2
    ) {
      errors.department = t(Dictionary.Team.DEPARTMENT_MIN_LENGTH);
      hasError = true;
    } else if (editingTeamData.department.trim().length > 128) {
      errors.department = t(Dictionary.Team.DEPARTMENT_MAX_LENGTH);
      hasError = true;
    }

    if ((editingTeamData.departmentManager ?? "").trim().length > 128) {
      errors.departmentManager = t(
        Dictionary.Team.DEPARTMENT_MANAGER_MAX_LENGTH,
      );
      hasError = true;
    }

    if ((editingTeamData.departmentHead ?? "").trim().length > 128) {
      errors.departmentHead = t(Dictionary.Team.DEPARTMENT_HEAD_MAX_LENGTH);
      hasError = true;
    }

    if (hasError) {
      setEditErrors(errors);
      setIsLoading(false);
      return;
    }

    if (!checkIfTeamIsValid(editingTeamData)) {
      setIsLoading(false);
      return;
    }

    const patchDocument = createJsonPatchDocumentFromObject({
      name: editingTeamData.name.trim(),
      department: editingTeamData.department.trim(),
      departmentManager: editingTeamData.departmentManager
        ? editingTeamData.departmentManager.trim()
        : "",
      departmentHead: editingTeamData.departmentHead
        ? editingTeamData.departmentHead.trim()
        : "",
    });

    const response = await handleDataRequest<JsonPatchKeyValuePair[], Team>(
      `${urls.team}/${editingTeamData.id}`,
      RequestType.Patch,
      patchDocument,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    updateTeam({
      ...editingTeamData,
      name: editingTeamData.name.trim(),
      department: editingTeamData.department.trim(),
      departmentManager: editingTeamData.departmentManager
        ? editingTeamData.departmentManager.trim()
        : "",
      departmentHead: editingTeamData.departmentHead
        ? editingTeamData.departmentHead.trim()
        : "",
    });

    toast.success(t(Dictionary.Team.UPDATED));

    setEditingTeamId(null);
    setEditingTeamData(null);
    setIsLoading(false);
  };

  const getActiveUsers = async () => {
    const response = await handleDataRequest<never, User[]>(
      urls.user,
      RequestType.Get,
      undefined,
      { isActive: true },
    );

    if (!response.isSuccess) return;

    replaceUsers(response.value);
  };

  const getTeams = async () => {
    const response = await handleDataRequest<never, Team[]>(
      urls.team,
      RequestType.Get,
    );

    if (!response.isSuccess) return;

    replaceTeams(response.value);
  };

  const checkIfTeamIsValid = (team: Team) => {
    if (
      teams.some((x) => x.id !== team.id && x.name.trim() === team.name.trim())
    ) {
      toast.error(t(Dictionary.Team.SAME_NAME));
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

    if (!checkIfTeamIsValid(form.values)) {
      setIsLoading(false);
      return;
    }

    const request: TeamRequest = {
      ...form.values,
      name: form.values.name.trim(),
      department: form.values.department.trim(),
      departmentManager: form.values.departmentManager
        ? form.values.departmentManager.trim()
        : "",
      departmentHead: form.values.departmentHead
        ? form.values.departmentHead.trim()
        : "",
    };

    const response = await handleDataRequest<TeamRequest, Team>(
      urls.team,
      RequestType.Post,
      request,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    addTeam({
      ...response.value,
      createUserFullName: auth.currentUserFullName,
    });

    form.reset();

    toast.success(t(Dictionary.Team.ADDED));

    setIsLoading(false);
  };

  const changeTeamActivity = async (team: Team) => {
    setIsLoading(true);

    if (
      users.find((x) => team.isActive && x.isActive && x.teamId === team.id)
    ) {
      toast.error(t(Dictionary.Team.ACTIVITY_CHECK));
      setIsLoading(false);
      return;
    }

    const patchDocument = createJsonPatchDocumentFromObject({
      isActive: !team.isActive,
    });

    const response = await handleDataRequest<JsonPatchKeyValuePair[], Team>(
      `${urls.team}/${team.id}`,
      RequestType.Patch,
      patchDocument,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    updateTeam({ ...team, isActive: !team.isActive });

    if (team.isActive) {
      toast.success(t(Dictionary.Team.DEACTIVATED));
      setIsLoading(false);
      return;
    }

    toast.success(t(Dictionary.Team.ACTIVATED));

    setIsLoading(false);
  };

  const openTeamActivityModal = (team: Team) => {
    modals.open({
      title: team.isActive ? (
        <Title order={4}>{t(Dictionary.Team.DEACTIVATE)}</Title>
      ) : (
        <Title order={4}>{t(Dictionary.Team.ACTIVATE)}</Title>
      ),
      size: "md",
      closeOnClickOutside: false,
      children: (
        <Flex direction="column" gap={20}>
          {team.isActive
            ? t(Dictionary.Team.DEACTIVITY_QUESTION)
            : t(Dictionary.Team.ACTIVITY_QUESTION)}
          <Flex direction="row" gap={10} mt={10}>
            <Button
              loading={isLoading}
              onClick={() => {
                changeTeamActivity(team);
                modals.closeAll();
              }}
              variant="light"
              style={
                team.isActive
                  ? { flexGrow: 1, color: "red", backgroundColor: "#ffeeee" }
                  : { flexGrow: 1, color: "green", backgroundColor: "#e7ffe0" }
              }
            >
              {team.isActive
                ? t(Dictionary.Team.DEACTIVATE)
                : t(Dictionary.Team.ACTIVATE)}
            </Button>
            <Button onClick={() => modals.closeAll()} flex={1} variant="light">
              {t(Dictionary.Common.CANCEL)}
            </Button>
          </Flex>
        </Flex>
      ),
    });
  };

  const managerSelectData = useMemo(
    () =>
      users
        .filter((x) => x.role.toString() === Role.Admin)
        .map((user) => ({
          value: user.id,
          label: `${user.name} ${user.surname}`,
        })),
    [users],
  );

  const memoizedTeams = useMemo(
    () =>
      teams
        .filter((x) => (showActiveTeams === true ? x.isActive : x))
        .filter((x) =>
          x.searchText.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .map((x: Team) => {
          const isEditing = editingTeamId === x.id;

          return (
            <EditTeam
              key={x.id}
              team={x}
              isEditing={isEditing}
              editingTeamData={editingTeamData}
              setEditingTeamData={setEditingTeamData}
              editErrors={editErrors}
              setEditErrors={setEditErrors}
              managerSelectData={managerSelectData}
              isLoading={isLoading}
              handleSaveEdit={handleSaveEdit}
              handleCancelEdit={handleCancelEdit}
              handleEditClick={handleEditClick}
              openTeamActivityModal={openTeamActivityModal}
            />
          );
        }),
    [
      teams,
      showActiveTeams,
      searchQuery,
      isLoading,
      users,
      managerSelectData,
      editingTeamId,
      editingTeamData,
      editErrors,
    ],
  );

  useEffect(() => {
    getActiveUsers();
    getTeams();
  }, []);

  return (
    <Flex direction="column" h={PAGE_FLEX_HEIGHT}>
      <Title order={3}>{t(Dictionary.Common.TEAMS)}</Title>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card
        shadow="xs"
        radius="md"
        withBorder
        style={{ overflow: "visible", zIndex: 10 }}
      >
        <Flex gap="md" direction="column">
          <Flex gap={20}>
            <TextInput
              {...form.getInputProps("name")}
              mih={MIN_INPUT_HEIGHT}
              flex={1}
              withAsterisk
              label={t(Dictionary.Team.NAME)}
            />
            <TextInput
              flex={1}
              mih={MIN_INPUT_HEIGHT}
              withAsterisk
              {...form.getInputProps("department")}
              label={t(Dictionary.Team.DEPARTMENT)}
            />
            <Autocomplete
              {...form.getInputProps("departmentManager")}
              mih={MIN_INPUT_HEIGHT}
              flex={1}
              clearable
              data={managerSelectData}
              label={t(Dictionary.Team.DEPARTMENT_MANAGER)}
              maxDropdownHeight={200}
              comboboxProps={{
                withinPortal: false,
              }}
            />
            <Autocomplete
              {...form.getInputProps("departmentHead")}
              mih={MIN_INPUT_HEIGHT}
              flex={1}
              clearable
              data={managerSelectData}
              label={t(Dictionary.Team.DEPARTMENT_HEAD)}
              maxDropdownHeight={200}
              comboboxProps={{
                withinPortal: false,
              }}
            />
          </Flex>
          <Button
            onClick={handleSave}
            variant="light"
            loading={isLoading}
            leftSection={<PiPlusCircle size={22} />}
          >
            {t(Dictionary.Team.ADD_NEW)}
          </Button>
        </Flex>
      </Card>
      <Card mt="xs" withBorder radius="md" padding="sm" flex={1}>
        <Flex gap="xs" mb="md" align="center">
          <TextInput
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE}></IconSearch>}
            flex={1}
            {...form.getInputProps("searchText")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Checkbox
            labelPosition="left"
            label={t(Dictionary.Team.SHOW_ACTIVE)}
            ml="10px"
            checked={showActiveTeams}
            onChange={() => setShowActiveTeams(!showActiveTeams)}
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
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t(Dictionary.Team.NAME)}</Table.Th>
                <Table.Th>{t(Dictionary.Team.DEPARTMENT)}</Table.Th>
                <Table.Th>{t(Dictionary.Team.DEPARTMENT_MANAGER)}</Table.Th>
                <Table.Th>{t(Dictionary.Team.DEPARTMENT_HEAD)}</Table.Th>
                <Table.Th w={100}>{t(Dictionary.Common.STATUS)}</Table.Th>
                <Table.Th w={380}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{memoizedTeams}</Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>
    </Flex>
  );
}

export default Teams;
