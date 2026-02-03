import { useForm } from "@mantine/form";
import projectSchema, { Project, ProjectRequest } from "../../types/project";
import { modals } from "@mantine/modals";
import useProjects from "../../hooks/useProjects";
import { useEffect, useMemo, useState } from "react";
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
  CREATE_USER,
  SEARCH_ICON_SIZE,
  TITLE_DIVIDER_MY,
} from "../../constants/constants";
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";
import { zod4Resolver } from "mantine-form-zod-resolver";

function Projects() {
  const { projects, addProject, updateProject, replaceProjects } =
    useProjects();

  const [searchQuery, setSearchQuery] = useState("");

  const [showActiveProjects, setShowActiveProjects] = useState(true);

  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

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
    validate: zod4Resolver(projectSchema),
  });

  const openEditProject = (project: Project) => {
    modals.open({
      title: <Title order={4}>Edit Project</Title>,
      size: "xl",
      children: (
        <EditProjectModal
          project={project}
          updateProject={updateProject}
          checkIfProjectIsValid={checkIfProjectIsValid}
        />
      ),
    });
  };

  const getProjects = async () => {
    const response = await handleDataRequest<never, Project[]>(
      urls.project,
      RequestType.Get,
    );

    if (!response.isSuccess) return;

    replaceProjects(response.value);
  };

  const checkIfProjectIsValid = (project: Project) => {
    if (projects.some((x) => x.name.trim() === project.name.trim())) {
      toast.error("There is a project with the same name!");
      return false;
    }

    if (projects.some((x) => x.code.trim() === project.code.trim())) {
      toast.error("There is a project with the same code!");
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

    if (!checkIfProjectIsValid(form.values)) {
      setIsLoading(false);
      return;
    }

    const request: ProjectRequest = {
      name: form.values.name,
      code: form.values.code,
    };

    const response = await handleDataRequest<ProjectRequest, Project>(
      urls.project,
      RequestType.Post,
      request,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    addProject(response.value);

    form.reset();

    toast.success("Project has been added successfully!");

    setIsLoading(false);
  };

  const changeProjectActivity = async (project: Project) => {
    setIsLoading(true);

    const patchDocument = createJsonPatchDocumentFromObject({
      isActive: !project.isActive,
    });

    const response = await handleDataRequest<JsonPatchKeyValuePair[], Project>(
      `${urls.project}/${project.id}`,
      RequestType.Patch,
      patchDocument,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    updateProject({ ...project, isActive: !project.isActive });

    if (project.isActive) {
      toast.success("Project deactivated successfully.");
      setIsLoading(false);
      return;
    }

    toast.success("Project activated successfully.");

    setIsLoading(false);
  };

  const memoizedProjects = useMemo(
    () =>
      projects
        .filter((x) => (showActiveProjects === true ? x.isActive : x))
        .filter((x) =>
          x.searchText.toLowerCase().includes(searchQuery.toLowerCase()),
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
            <Table.Td> {CREATE_USER} </Table.Td>
            <Table.Td>
              <Flex justify={"center"} gap={5}>
                {x.isActive ? (
                  <Tooltip label="Edit" withArrow>
                    <ActionIcon
                      onClick={() => openEditProject(x)}
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
                  label={x.isActive ? "Deactivate Project" : "Activate Project"}
                  withArrow
                >
                  <ActionIcon
                    onClick={() => changeProjectActivity(x)}
                    variant={"light"}
                    loading={isLoading}
                    color={x.isActive ? "red" : "green"}
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
    [projects, showActiveProjects, searchQuery, isLoading],
  );

  useEffect(() => {
    getProjects();
  }, []);

  return (
    <div>
      <Title order={3}>Projects</Title>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card shadow={"xs"} radius={"md"} withBorder>
        <Flex gap="md" direction="row" style={{ minHeight: 80 }}>
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
          loading={isLoading}
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
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Code</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Create User</Table.Th>
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
