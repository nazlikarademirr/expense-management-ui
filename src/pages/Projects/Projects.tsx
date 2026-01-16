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
import { IconEdit, IconSearch } from "@tabler/icons-react";
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
import {
  BOOLEAN_ICON_SIZE,
  SEARCH_ICON_SIZE,
  TITLE_DIVIDER_MY,
} from "../../constants/constants";
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";

function Projects() {
  const { projects, addProject, updateProject } = useProjects({
    hasValueLabel: false,
    hasActiveProjectValueLabel: false,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [showActiveProjects, setShowActiveProjects] = useState(true);

  const { handleDataRequest } = useRequestHandler();

  const form = useForm<Project>({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      code: "",
      searchText: "",
      isActive: false,
      createUser: crypto.randomUUID(),
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
      code: (value) =>
        value.trim().length === 0
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
      title: <Title order={4}>Edit Project</Title>,
      size: "xl",
      children: (
        <EditProjectModal project={project} updateProject={updateProject} />
      ),
    });
  };

  const changeProjectActivity = async (project: Project) => {
    const patchDocument = createJsonPatchDocumentFromObject({
      isActive: !project.isActive,
    });

    const response = await handleDataRequest<
      JsonPatchKeyValuePair[],
      ProjectResponse
    >(`${urls.project}/${project.id}`, RequestType.Patch, patchDocument);

    if (!response.isSuccess) return;

    updateProject({ ...project, isActive: !project.isActive });

    if (project.isActive) {
      toast.success("Project deactivated successfully.");
      return;
    }

    toast.success("Project activated successfully.");
  };

  const handleSave = async () => {
    form.validate();

    if (!form.isValid()) return;

    if (
      projects
        .filter((x) => x.isActive)
        .find((x) => x.name === form.values.name)
    ) {
      toast.error("There is a project with the same name!");
      return;
    }

    if (
      projects
        .filter((x) => x.isActive)
        .find((x) => x.code === form.values.code)
    ) {
      toast.error("There is a active project with the same code!");
      return;
    }

    const retVal = await addProject({
      ...form.values,
    });

    if (retVal) {
      form.reset();
      toast.success("Project has been added successfully!");
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
                    onClick={() => openEditProject(x)}
                    variant={"light"}
                    color={"blue"}
                  >
                    <IconEdit />
                  </ActionIcon>
                ) : (
                  <div></div>
                )}
                <ActionIcon
                  onClick={() => changeProjectActivity(x)}
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
    [projects, showActiveProjects, searchQuery]
  );

  return (
    <div>
      <Title order={3}>Projects</Title>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card shadow={"xs"} radius={"md"} withBorder>
        <Flex gap="md" direction="row">
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
        <Button
          onClick={handleSave}
          variant={"light"}
          style={{ flexGrow: 2, marginTop: "15px" }}
        >
          Add New Project
        </Button>
      </Card>

      <Card mt={"xs"} withBorder padding={"sm"}>
        <Flex gap={"xs"}>
          <TextInput
            size="xs"
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE}></IconSearch>}
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
              <Table.Th>Code</Table.Th>
              <Table.Th>Is Active</Table.Th>
              <Table.Th>Create User</Table.Th>
              <Table.Th>Create Date</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{memoizedProjects}</Table.Tbody>
        </Table>
      </Card>
    </div>
  );
}

export default Projects;
