import { useForm } from "@mantine/form";
import teamSchema, { Team, TeamRequest } from "../../types/team";
import { modals } from "@mantine/modals";
import useTeams from "../../hooks/useTeams";
import {
  ActionIcon,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Table,
  TextInput,
  Title,
  Tooltip,
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
import { TiTick, TiTimes } from "react-icons/ti";
import {
  BOOLEAN_ICON_SIZE,
  CREATE_USER,
  SEARCH_ICON_SIZE,
  TITLE_DIVIDER_MY,
} from "../../constants/constants";
import useUsers from "../../hooks/useUsers";
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";
import { User } from "../../types/user";
import { zod4Resolver } from "mantine-form-zod-resolver";

function Teams() {
  const { teams, addTeam, updateTeam, replaceTeams } = useTeams();

  const { users, replaceUsers } = useUsers();

  const [searchQuery, setSearchQuery] = useState("");

  const [showActiveTeams, setShowActiveTeams] = useState(true);

  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      searchText: "",
      isActive: false,
      createUser: "",
      createDate: new Date(),
    },
    validate: zod4Resolver(teamSchema),
  });

  const openEditTeam = (team: Team) => {
    modals.open({
      title: <Title order={4}>Edit Team</Title>,
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
      toast.error("There is a team with the same name!");
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

    const request: TeamRequest = { name: form.values.name };

    const response = await handleDataRequest<TeamRequest, Team>(
      urls.team,
      RequestType.Post,
      request,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    addTeam(response.value);

    form.reset();

    toast.success("Team has been added successfully!");

    setIsLoading(false);
  };

  const changeTeamActivity = async (team: Team) => {
    setIsLoading(true);

    if (users.find((x) => team.isActive && x.teamId === team.id)) {
      toast.error(
        "This team already has active users; to deactivate the team, first deactivate the users in that team.",
      );
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
      toast.success("Team deactivated successfully.");
      setIsLoading(false);
      return;
    }

    toast.success("Team activated successfully.");

    setIsLoading(false);
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
              {x.isActive ? (
                <TiTick size={BOOLEAN_ICON_SIZE} color="green" />
              ) : (
                <TiTimes size={BOOLEAN_ICON_SIZE} color="#BA1A1A" />
              )}
            </Table.Td>
            <Table.Td> {CREATE_USER} </Table.Td>
            <Table.Td>
              <Flex justify={"center"} gap={5}>
                {x.isActive ? (
                  <Tooltip label="Edit" withArrow>
                    <ActionIcon
                      onClick={() => openEditTeam(x)}
                      variant={"light"}
                      color={"blue"}
                    >
                      <IconEdit />
                    </ActionIcon>
                  </Tooltip>
                ) : (
                  <div></div>
                )}
                <Tooltip
                  label={x.isActive ? "Deactivate Team" : "Activate Team"}
                  withArrow
                >
                  <ActionIcon
                    onClick={() => changeTeamActivity(x)}
                    variant={"light"}
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
    <div>
      <Title order={3}>Teams</Title>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card shadow={"xs"} radius={"md"} withBorder>
        <Flex gap={"md"} direction={"column"}>
          <TextInput
            {...form.getInputProps("name")}
            style={{ minHeight: 80 }}
            withAsterisk
            label={"Name"}
          />
          <Button onClick={handleSave} variant={"light"} loading={isLoading}>
            Add New Team
          </Button>
        </Flex>
      </Card>
      <Card mt={"xs"} withBorder radius={"md"} padding={"sm"}>
        <Flex gap={"xs"}>
          <TextInput
            size="xs"
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE}></IconSearch>}
            style={{ flexGrow: 120 }}
            {...form.getInputProps("searchText")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Checkbox
            labelPosition="left"
            label={"Show Active Teams"}
            style={{ marginTop: "5px", marginLeft: "10px" }}
            checked={showActiveTeams}
            onChange={() => setShowActiveTeams(!showActiveTeams)}
            type="checkbox"
          />
        </Flex>
        {memoizedTeams.length > 0 ? (
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
                <Table.Th>Status</Table.Th>
                <Table.Th>Create User</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{memoizedTeams}</Table.Tbody>
          </Table>
        ) : (
          <div></div>
        )}
      </Card>
    </div>
  );
}

export default Teams;
