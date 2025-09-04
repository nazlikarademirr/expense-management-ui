import { useForm } from "@mantine/form";
import { Team, TeamResponse } from "../../types/team";
import { modals } from "@mantine/modals";
import useTeams from "../../hooks/useTeams";
import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Flex,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import { useMemo } from "react";
import toast from "react-hot-toast";
import EditTeamModal from "./components/EditTeamModal";
import {
  createJsonPatchDocumentFromObject,
  JsonPatchKeyValuePair,
} from "../../types/json-patch-document";
import RequestType from "../../request-handler/request-type";
import urls from "../../constants/urls";
import useRequestHandler from "../../hooks/useRequestHandler";

function Teams() {
  const { teams, addTeam, updateTeam } = useTeams({
    hasValueLabel: false,
  });

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
        value.length === 0
          ? "Name cannot be empty."
          : value.length < 2
            ? "Name must have at least 2 letters."
            : value.length > 128
              ? "Name cannot exceed 128 characters."
              : null,
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
      teams.map((x: Team) => (
        <Table.Tr key={x.id}>
          <Table.Td> {x.name} </Table.Td>
          <Table.Td> {String(x.isActive)} </Table.Td>
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
    [teams]
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
