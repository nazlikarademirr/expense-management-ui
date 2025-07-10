import { useForm } from "@mantine/form";
import { Project } from "../../types/project";
import { modals } from "@mantine/modals";
import useProjects from "../../hooks/useProjects";
import { useMemo } from "react";
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
import toast from "react-hot-toast";
import EditProjectModal from "./components/EditProjectModal";

function Projects() {
  const { projects, addProject, deleteProject, updateProject } = useProjects({
    hasValueLabel: false,
  });

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
        value.length < 2 ? "Name must have at least 2 letters" : null,
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

  const memoizedProjects = useMemo(
    () =>
      projects.map((x: Project) => (
        <Table.Tr key={x.id}>
          <Table.Td> {x.name} </Table.Td>
          <Table.Td> {x.code} </Table.Td>
          <Table.Td> {"true"} </Table.Td>
          <Table.Td> {x.createUser} </Table.Td>
          <Table.Td>{format(x.createDate, "dd/MM/yyyy HH:mm")}</Table.Td>
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
                onClick={() => deleteProject(x.id)}
                variant={"light"}
                color={"red"}
              >
                <IconTrash />
              </ActionIcon>
            </Flex>
          </Table.Td>
        </Table.Tr>
      )),
    [projects]
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
