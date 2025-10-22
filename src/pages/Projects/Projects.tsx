import { useForm } from "@mantine/form";
import { Project, ProjectResponse } from "../../types/project";
import { modals } from "@mantine/modals";
import useProjects from "../../hooks/useProjects";
import { useMemo, useState } from "react";
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
import toast from "react-hot-toast";
import EditProjectModal from "./components/EditProjectModal";
import {
  createJsonPatchDocumentFromObject,
  JsonPatchKeyValuePair,
} from "../../types/json-patch-document";
import urls from "../../constants/urls";
import RequestType from "../../request-handler/request-type";
import useRequestHandler from "../../hooks/useRequestHandler";
import { TiTick, TiTimes } from "react-icons/ti";

function Projects() {
  const { projects, addProject, updateProject } = useProjects({
    hasValueLabel: false,
  });

  const [showActiveProjects, setShowActiveProjects] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const { handleDataRequest } = useRequestHandler();

  const form = useForm({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      code: "",
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
      code: (value) =>
        !value
          ? "Code cannot be empty."
          : value.length < 2
            ? "Code must have at least 2 letters."
            : value.length > 128
              ? "Code cannot exceed 128 characters."
              : undefined,
    },
  });

  const openEditProject = (project: Project) => {
    modals.open({
      title: "Edit Project",
      size: "xl",
      children: (
        <EditProjectModal project={project} updateProject={updateProject} />
      ),
    });
  };

  const disableProject = async (project: Project) => {
    const patchDocument = createJsonPatchDocumentFromObject({
      isActive: false,
    });

    const response = await handleDataRequest<
      JsonPatchKeyValuePair[],
      ProjectResponse
    >(`${urls.project}/${project.id}`, RequestType.Patch, patchDocument);

    if (response.isSuccess) {
      updateProject({ ...project, isActive: false });

      toast.success("Project deleted successfully.");
    }
  };

  const memoizedProjects = useMemo(
    () =>
      projects
        .filter((x) => (showActiveProjects === true ? x.isActive : x))
        .filter((x) =>
          x.searchText.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((x: Project) => (
          <Table.Tr key={x.id}>
            <Table.Td> {x.name} </Table.Td>
            <Table.Td> {x.code} </Table.Td>
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
                  onClick={() => openEditProject(x)}
                  variant={"light"}
                  color={"blue"}
                >
                  <IconEdit />
                </ActionIcon>
                <ActionIcon
                  onClick={() => disableProject(x)}
                  variant={"light"}
                  color={"red"}
                >
                  <IconTrash />
                </ActionIcon>
              </Flex>
            </Table.Td>
          </Table.Tr>
        )),
    [projects, showActiveProjects, searchQuery]
  );

  const handleSave = async () => {
    form.validate();

    if (!form.isValid()) return;

    const retVal = await addProject(form.values);

    if (retVal) {
      form.reset();
      toast.success("Project has been added successfully!");
    }
  };

  return (
    <div>
      <Title order={3}>Projects</Title>
      <Divider my={15} />
      <Card shadow={"md"} radius={"md"} withBorder>
        <Flex gap="xl" direction="row">
          <TextInput
            key={form.key("name")}
            {...form.getInputProps("name")}
            withAsterisk
            style={{ flexGrow: 1 }}
            label={"Name"}
          />

          <TextInput
            {...form.getInputProps("code")}
            withAsterisk
            style={{ flexGrow: 1 }}
            label={"Code"}
          />
        </Flex>
        <Flex gap="xl" direction="column">
          <Button
            onClick={handleSave}
            variant={"light"}
            style={{ flexGrow: 2, marginTop: "15px" }}
          >
            Add New Project
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
            label={"Show Active Projects"}
            style={{ marginTop: "5px", marginLeft: "10px" }}
            checked={showActiveProjects}
            onChange={() => setShowActiveProjects(!showActiveProjects)}
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
            <Table.Th>Code</Table.Th>
            <Table.Th>Is Active</Table.Th>
            <Table.Th>Create User</Table.Th>
            <Table.Th>Create Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{memoizedProjects}</Table.Tbody>
      </Table>
    </div>
  );
}

export default Projects;
