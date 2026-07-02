import { useForm } from "@mantine/form";
import projectSchema, {
  Project,
  ProjectRequest,
} from "../../types/project.types";
import { modals } from "@mantine/modals";
import useProjects from "../../hooks/useProjects";
import { useEffect, useMemo, useState } from "react";
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
import toast from "react-hot-toast";
import EditProjectModal from "./components/EditProjectModal";
import {
  createJsonPatchDocumentFromObject,
  JsonPatchKeyValuePair,
} from "../../types/json-patch-document";
import urls from "../../constants/urls";
import RequestType from "../../request-handler/request-type";
import useRequestHandler from "../../hooks/useRequestHandler";
import {
  PAGE_FLEX_HEIGHT,
  SEARCH_ICON_SIZE,
  TITLE_DIVIDER_MY,
} from "../../constants/constants";
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider";
import Dictionary from "../../helpers/translation/dictionary";
import { useTranslation } from "react-i18next";
import { PiPlusCircle } from "react-icons/pi";

function Projects() {
  const { projects, addProject, updateProject, replaceProjects } =
    useProjects();

  const [searchQuery, setSearchQuery] = useState("");

  const [showActiveProjects, setShowActiveProjects] = useState(true);

  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuthentication();

  const { t } = useTranslation();

  const form = useForm<Project>({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      code: "",
      searchText: "",
      isActive: false,
      createUserId: crypto.randomUUID(),
      createUserFullName: "",
      createDate: new Date(),
    },
    validate: zod4Resolver(projectSchema),
  });

  const openEditProject = (project: Project) => {
    modals.open({
      title: <Title order={4}>{t(Dictionary.Project.EDIT)}</Title>,
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
    if (
      projects.some(
        (x) => x.id !== project.id && x.name.trim() === project.name.trim(),
      )
    ) {
      toast.error(t(Dictionary.Project.SAME_NAME));
      return false;
    }

    if (
      projects.some(
        (x) => x.id !== project.id && x.code.trim() === project.code.trim(),
      )
    ) {
      toast.error(t(Dictionary.Project.SAME_CODE));
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
      name: form.values.name.trim(),
      code: form.values.code.trim(),
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

    addProject({
      ...response.value,
      createUserFullName: auth.currentUser
        ? `${auth.currentUser.name} ${auth.currentUser.surname}`
        : "",
    });

    form.reset();

    toast.success(t(Dictionary.Project.ADDED));

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
      toast.success(t(Dictionary.Project.DEACTIVATED));
      setIsLoading(false);
      return;
    }

    toast.success(t(Dictionary.Project.ACTIVATED));

    setIsLoading(false);
  };

  const openProjectActivityModal = (project: Project) => {
    modals.open({
      size: "md",
      children: (
        <Flex direction="column" gap={20}>
          {project.isActive
            ? t(Dictionary.Project.DEACTIVITY_QUESTION)
            : t(Dictionary.Project.ACTIVITY_QUESTION)}
          <Flex direction="row" gap={10} mt={10}>
            <Button
              loading={isLoading}
              onClick={() => {
                changeProjectActivity(project);
                modals.closeAll();
              }}
              variant="light"
              style={
                project.isActive
                  ? { flexGrow: 1, color: "red", backgroundColor: "#ffeeee" }
                  : { flexGrow: 1, color: "green", backgroundColor: "#e7ffe0" }
              }
            >
              {project.isActive
                ? t(Dictionary.Project.DEACTIVATE)
                : t(Dictionary.Project.ACTIVATE)}
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
              <Flex justify="center" gap={5}>
                {x.isActive ? (
                  <Button
                    onClick={() => openEditProject(x)}
                    variant="light"
                    leftSection={<IconEdit size={18} />}
                    color="blue"
                  >
                    {t(Dictionary.Common.EDIT)}
                  </Button>
                ) : (
                  <div></div>
                )}
                <Button
                  onClick={() => openProjectActivityModal(x)}
                  variant="light"
                  loading={isLoading}
                  style={{
                    color: x.isActive ? "red" : "green",
                    backgroundColor: x.isActive ? "#ffeeee" : "#e7ffe0",
                  }}
                  leftSection={
                    x.isActive ? (
                      <IoMdRemoveCircleOutline size={20} />
                    ) : (
                      <IoMdAddCircleOutline size={20} />
                    )
                  }
                >
                  {x.isActive
                    ? t(Dictionary.Project.DEACTIVATE)
                    : t(Dictionary.Project.ACTIVATE)}
                </Button>
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
    <Flex direction="column" h={PAGE_FLEX_HEIGHT}>
      <Title order={3}>{t(Dictionary.Common.PROJECTS)}</Title>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card shadow={"xs"} radius={"md"} withBorder>
        <Flex gap="md" direction="row" style={{ minHeight: 80 }}>
          <TextInput
            key={form.key("name")}
            {...form.getInputProps("name")}
            withAsterisk
            style={{ flexGrow: 1 }}
            label={t(Dictionary.Project.NAME)}
          />

          <TextInput
            {...form.getInputProps("code")}
            withAsterisk
            style={{ flexGrow: 1 }}
            label={t(Dictionary.Project.CODE)}
          />
        </Flex>
        <Button
          onClick={handleSave}
          variant="light"
          loading={isLoading}
          leftSection={<PiPlusCircle size={22} />}
          style={{ flexGrow: 2, marginTop: "15px" }}
        >
          {t(Dictionary.Project.ADD_NEW)}
        </Button>
      </Card>

      <Card
        mt="xs"
        withBorder
        padding="sm"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Flex gap="xs" mb="md" align="center">
          <TextInput
            size="xs"
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE}></IconSearch>}
            style={{ flex: 1 }}
            {...form.getInputProps("searchText")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Checkbox
            labelPosition="left"
            label={t(Dictionary.Project.SHOW_ACTIVE)}
            style={{ marginLeft: "10px" }}
            checked={showActiveProjects}
            onChange={() => setShowActiveProjects(!showActiveProjects)}
            type="checkbox"
          />
        </Flex>
        <ScrollArea style={{ flex: 1 }}>
          <Table
            striped
            stickyHeader
            highlightOnHover
            withTableBorder
            withColumnBorders
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t(Dictionary.Project.NAME)}</Table.Th>
                <Table.Th>{t(Dictionary.Project.CODE)}</Table.Th>
                <Table.Th>{t(Dictionary.Common.STATUS)}</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{memoizedProjects}</Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>
    </Flex>
  );
}

export default Projects;
