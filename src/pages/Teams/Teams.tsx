import { useForm } from "@mantine/form";
import { Team, TeamResponse } from "../../types/team";
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
} from "@mantine/core";
import { IconEdit, IconSearch, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
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

function Teams() {
  const { teams, addTeam, updateTeam } = useTeams({
    hasValueLabel: false,
  });

  const [showActiveTeams, setShowActiveTeams] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const { handleDataRequest } = useRequestHandler();

  const form = useForm({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      searchText: "",
      isActive: false,
      createUser: "",
      createDate: new Date(),
    },
    validate: {
      name: (value) =>
        !value
          ? "Name cannot be empty."
          : value.length < 2
            ? "Name must have at least 2 letters."
            : value.length > 128
              ? "Name cannot exceed 128 characters."
              : undefined,
    },
  });

  const openEditTeam = (team: Team) => {
    modals.open({
      title: "Edit Team",
      size: "xl",
      children: <EditTeamModal team={team} updateTeam={updateTeam} />,
    });
  };

  const disableTeam = async (team: Team) => {
    const patchDocument = createJsonPatchDocumentFromObject({
      isActive: false,
    });

    const response = await handleDataRequest<
      JsonPatchKeyValuePair[],
      TeamResponse
    >(`${urls.team}/${team.id}`, RequestType.Patch, patchDocument);

    if (response.isSuccess) {
      updateTeam({ ...team, isActive: false });

      toast.success("Team deleted successfully.");
    }
  };

  const memoizedTeams = useMemo(
    () =>
      teams
        .filter((x) => (showActiveTeams === true ? x.isActive : x))
        .filter((x) =>
          x.searchText.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((x: Team) => (
          <Table.Tr key={x.id}>
            <Table.Td> {x.name} </Table.Td>
            <Table.Td>
              {x.isActive ? (
                <TiTick size={20} color="green" />
              ) : (
                <TiTimes size={20} color="#BA1A1A" />
              )}
            </Table.Td>
            <Table.Td> {x.createUser} </Table.Td>
            <Table.Td>{format(x.createDate, "dd/MM/yyyy - HH.mm")}</Table.Td>
            <Table.Td>
              <Flex justify={"center"} gap={5}>
                <ActionIcon
                  onClick={() => openEditTeam(x)}
                  variant={"light"}
                  color={"blue"}
                >
                  <IconEdit />
                </ActionIcon>
                <ActionIcon
                  onClick={() => disableTeam(x)}
                  variant={"light"}
                  color={"red"}
                >
                  <IconTrash />
                </ActionIcon>
              </Flex>
            </Table.Td>
          </Table.Tr>
        )),
    [teams, showActiveTeams, searchQuery]
  );

  const handleSave = async () => {
    form.validate();

    if (!form.isValid()) return;

    const retVal = await addTeam(form.values);

    if (retVal) {
      form.reset();
      toast.success("Team has been added successfully!");
    }
  };

  return (
    <div>
      <Title order={3}>Teams</Title>
      <Divider my={15} />
      <Card shadow={"md"} radius={"md"} withBorder>
        <Flex gap={10} direction={"column"}>
          <TextInput
            {...form.getInputProps("name")}
            withAsterisk
            label={"Name"}
          />
          <Button onClick={handleSave} variant={"light"}>
            Add New Team
          </Button>
        </Flex>
      </Card>
      <Card mt={7} withBorder padding={8}>
        <Flex gap={3}>
          <TextInput
            size="xs"
            radius="xl"
            rightSection={<IconSearch size={16}></IconSearch>}
            style={{ flexGrow: 120 }}
            {...form.getInputProps("searchText")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            <Table.Th>Is Active</Table.Th>
            <Table.Th>Create User</Table.Th>
            <Table.Th>Create Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{memoizedTeams}</Table.Tbody>
      </Table>
    </div>
  );
}

export default Teams;
