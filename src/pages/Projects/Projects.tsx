import { useForm } from "@mantine/form";
import projectSchema, {
  Project,
  ProjectRequest,
} from "../../types/project.types";
import { modals } from "@mantine/modals";
import useProjects from "../../hooks/useProjects";
import { useEffect, useMemo, useState } from "react";
import {
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
import toast from "react-hot-toast";
import EditProject from "./components/EditProject";
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

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectData, setEditingProjectData] = useState<Project | null>(
    null,
  );
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

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

  const handleEditClick = (project: Project) => {
    setEditingProjectId(project.id);
    setEditingProjectData({ ...project });
    setEditErrors({});
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditingProjectData(null);
    setEditErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editingProjectData) return;

    setIsLoading(true);

    const errors: Record<string, string> = {};
    let hasError = false;

    if (
      !editingProjectData.name.trim() ||
      editingProjectData.name.trim().length < 2
    ) {
      errors.name = t(Dictionary.Project.NAME_MIN_LENGTH);
      hasError = true;
    } else if (editingProjectData.name.trim().length > 128) {
      errors.name = t(Dictionary.Project.NAME_MAX_LENGTH);
      hasError = true;
    }

    if (
      !editingProjectData.code.trim() ||
      editingProjectData.code.trim().length < 2
    ) {
      errors.code = t(Dictionary.Project.CODE_MIN_LENGTH);
      hasError = true;
    } else if (editingProjectData.code.trim().length > 128) {
      errors.code = t(Dictionary.Project.CODE_MAX_LENGTH);
      hasError = true;
    }

    if (hasError) {
      setEditErrors(errors);
      setIsLoading(false);
      return;
    }

    if (!checkIfProjectIsValid(editingProjectData)) {
      setIsLoading(false);
      return;
    }

    const patchDocument = createJsonPatchDocumentFromObject({
      name: editingProjectData.name.trim(),
      code: editingProjectData.code.trim(),
    });

    const response = await handleDataRequest<JsonPatchKeyValuePair[], Project>(
      `${urls.project}/${editingProjectData.id}`,
      RequestType.Patch,
      patchDocument,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    updateProject({
      ...editingProjectData,
      name: editingProjectData.name.trim(),
      code: editingProjectData.code.trim(),
    });

    toast.success(t(Dictionary.Project.UPDATED));

    setEditingProjectId(null);
    setEditingProjectData(null);
    setIsLoading(false);
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
      createUserFullName: auth.currentUserFullName,
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
      title: project.isActive ? (
        <Title order={4}>{t(Dictionary.Project.DEACTIVATE)}</Title>
      ) : (
        <Title order={4}>{t(Dictionary.Project.ACTIVATE)}</Title>
      ),
      size: "md",
      closeOnClickOutside: false,
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
              flex={1}
              style={
                project.isActive
                  ? { color: "red", backgroundColor: "#ffeeee" }
                  : { color: "green", backgroundColor: "#e7ffe0" }
              }
            >
              {project.isActive
                ? t(Dictionary.Project.DEACTIVATE)
                : t(Dictionary.Project.ACTIVATE)}
            </Button>
            <Button onClick={() => modals.closeAll()} flex={1} variant="light">
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
        .map((x: Project) => {
          const isEditing = editingProjectId === x.id;

          return (
            <EditProject
              key={x.id}
              project={x}
              isEditing={isEditing}
              editingProjectData={editingProjectData}
              setEditingProjectData={setEditingProjectData}
              editErrors={editErrors}
              setEditErrors={setEditErrors}
              isLoading={isLoading}
              handleSaveEdit={handleSaveEdit}
              handleCancelEdit={handleCancelEdit}
              handleEditClick={handleEditClick}
              openProjectActivityModal={openProjectActivityModal}
            />
          );
        }),
    [
      projects,
      showActiveProjects,
      searchQuery,
      isLoading,
      editingProjectId,
      editingProjectData,
      editErrors,
    ],
  );

  useEffect(() => {
    getProjects();
  }, []);

  return (
    <Flex direction="column" h={PAGE_FLEX_HEIGHT}>
      <Title order={3}>{t(Dictionary.Common.PROJECTS)}</Title>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card shadow="xs" radius="md" withBorder>
        <Flex gap="md" direction="row" mih={80}>
          <TextInput
            key={form.key("name")}
            {...form.getInputProps("name")}
            withAsterisk
            flex={1}
            label={t(Dictionary.Project.NAME)}
          />

          <TextInput
            {...form.getInputProps("code")}
            withAsterisk
            flex={1}
            label={t(Dictionary.Project.CODE)}
          />
        </Flex>
        <Button
          onClick={handleSave}
          variant="light"
          loading={isLoading}
          mt={15}
          leftSection={<PiPlusCircle size={22} />}
        >
          {t(Dictionary.Project.ADD_NEW)}
        </Button>
      </Card>

      <Card mt="xs" withBorder padding="sm" flex={1}>
        <Flex gap="xs" mb="md" align="center">
          <TextInput
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE}></IconSearch>}
            flex={1}
            {...form.getInputProps("searchText")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Checkbox
            labelPosition="left"
            label={t(Dictionary.Project.SHOW_ACTIVE)}
            ml={10}
            checked={showActiveProjects}
            onChange={() => setShowActiveProjects(!showActiveProjects)}
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
                <Table.Th>{t(Dictionary.Project.NAME)}</Table.Th>
                <Table.Th>{t(Dictionary.Project.CODE)}</Table.Th>
                <Table.Th w={150}>{t(Dictionary.Common.STATUS)}</Table.Th>
                <Table.Th w={450}></Table.Th>
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
