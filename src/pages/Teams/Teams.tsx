import { useForm } from "@mantine/form";
import teamSchema, { Team, TeamRequest } from "../../types/team.types";
import { modals } from "@mantine/modals";
import useTeams from "../../hooks/useTeams";
import {
  Badge,
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
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import EditTeamModal from "./components/EditTeamModal";
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
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";
import { User } from "../../types/user.types";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider";
import { useTranslation } from "react-i18next";
import Dictionary from "../../helpers/translation/dictionary";
import { PiPlusCircle } from "react-icons/pi";

function Teams() {
  const { teams, addTeam, updateTeam, replaceTeams } = useTeams();

  const { users, replaceUsers } = useUsers();

  const [searchQuery, setSearchQuery] = useState("");

  const [showActiveTeams, setShowActiveTeams] = useState(true);

  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuthentication();

  const { t } = useTranslation();

  const form = useForm<Team>({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      searchText: "",
      isActive: false,
      createUserId: "",
      createUserFullName: "",
      createDate: new Date(),
    },
    validate: zod4Resolver(teamSchema),
  });

  const openEditTeam = (team: Team) => {
    modals.open({
      title: <Title order={4}>{t(Dictionary.Team.EDIT)}</Title>,
      size: "xl",
      children: (
        <EditTeamModal
          team={team}
          updateTeam={updateTeam}
          checkIfTeamIsValid={checkIfTeamIsValid}
        />
      ),
    });
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
      name: form.values.name.trim(),
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
      createUserFullName: auth.currentUser
        ? `${auth.currentUser.name} ${auth.currentUser.surname}`
        : "",
    });

    form.reset();

    toast.success(t(Dictionary.Team.ADDED));

    setIsLoading(false);
  };

  const changeTeamActivity = async (team: Team) => {
    setIsLoading(true);

    if (users.find((x) => team.isActive && x.teamId === team.id)) {
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
      size: "md",
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
            <Button
              onClick={() => modals.closeAll()}
              style={{ flexGrow: 1 }}
              variant="light"
            >
              {t(Dictionary.Common.CANCEL)}
            </Button>
          </Flex>
        </Flex>
      ),
    });
  };

  const memoizedTeams = useMemo(
    () =>
      teams
        .filter((x) => (showActiveTeams === true ? x.isActive : x))
        .filter((x) =>
          x.searchText.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .map((x: Team) => (
          <Table.Tr key={x.id}>
            <Table.Td> {x.name} </Table.Td>
            <Table.Td>
              <Badge
                size="md"
                color={x.isActive ? "green" : "gray"}
                variant="light"
              >
                {x.isActive
                  ? t(Dictionary.Common.ACTIVE)
                  : t(Dictionary.Common.PASSIVE)}
              </Badge>
            </Table.Td>
            <Table.Td>
              <Flex justify={"center"} gap={5}>
                <Flex justify="center" gap={10}>
                  {x.isActive && (
                    <Button
                      onClick={() => openEditTeam(x)}
                      variant="light"
                      color="blue"
                      leftSection={<IconEdit size={18} />}
                    >
                      {t(Dictionary.Common.EDIT)}
                    </Button>
                  )}

                  <Button
                    onClick={() => openTeamActivityModal(x)}
                    variant="light"
                    style={
                      x.isActive
                        ? { color: "red", backgroundColor: "#ffeeee" }
                        : { color: "green", backgroundColor: "#e7ffe0" }
                    }
                    loading={isLoading}
                    leftSection={
                      x.isActive ? (
                        <IoMdRemoveCircleOutline size={20} />
                      ) : (
                        <IoMdAddCircleOutline size={20} />
                      )
                    }
                  >
                    {x.isActive
                      ? t(Dictionary.Team.DEACTIVATE)
                      : t(Dictionary.Team.ACTIVATE)}
                  </Button>
                </Flex>
              </Flex>
            </Table.Td>
          </Table.Tr>
        )),
    [teams, showActiveTeams, searchQuery, isLoading],
  );

  useEffect(() => {
    getActiveUsers();
    getTeams();
  }, []);

  return (
    <Flex direction="column" h={PAGE_FLEX_HEIGHT}>
      <Title order={3}>{t(Dictionary.Common.TEAMS)}</Title>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card shadow={"xs"} radius={"md"} withBorder>
        <Flex gap={"md"} direction={"column"}>
          <TextInput
            {...form.getInputProps("name")}
            style={{ minHeight: 80 }}
            withAsterisk
            label={t(Dictionary.Team.NAME)}
          />
          <Button
            onClick={handleSave}
            variant={"light"}
            loading={isLoading}
            leftSection={<PiPlusCircle size={22} />}
          >
            {t(Dictionary.Team.ADD_NEW)}
          </Button>
        </Flex>
      </Card>
      <Card
        mt={"xs"}
        withBorder
        radius={"md"}
        padding={"sm"}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Flex gap={"xs"} mb="md" align="center">
          <TextInput
            size="xs"
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE}></IconSearch>}
            style={{ flex: 1 }}
            {...form.getInputProps("searchText")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Checkbox
            labelPosition="left"
            label={t(Dictionary.Team.SHOW_ACTIVE)}
            style={{ marginLeft: "10px" }}
            checked={showActiveTeams}
            onChange={() => setShowActiveTeams(!showActiveTeams)}
            type="checkbox"
          />
        </Flex>
        {memoizedTeams.length > 0 ? (
          <ScrollArea style={{ flex: 1 }}>
            <Table
              striped
              stickyHeader
              highlightOnHover
              withTableBorder
              withColumnBorders
              style={{ tableLayout: "fixed" }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t(Dictionary.Team.NAME)}</Table.Th>
                  <Table.Th>{t(Dictionary.Common.STATUS)}</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{memoizedTeams}</Table.Tbody>
            </Table>
          </ScrollArea>
        ) : (
          <div></div>
        )}
      </Card>
    </Flex>
  );
}

export default Teams;
