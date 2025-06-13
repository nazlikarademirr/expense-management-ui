import { useForm } from "@mantine/form";
import { Project } from "../../types/project";
import { modals } from "@mantine/modals";
import useProjects from "./hooks/useProjects";
import { useMemo } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import EditProject from "./components/EditProject";

function Projects() {
  const { projects, addProject, updateProject, deleteProject } = useProjects();

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
      children: <EditProject project={project} updateProject={updateProject} />,
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
                onClick={(_) => openEditProject(x)}
                variant={"light"}
                color={"blue"}
              >
                <IconEdit />
              </ActionIcon>
              <ActionIcon
                onClick={(_) => deleteProject(x.id)}
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
    // form.validate();

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
        <Flex gap={10} direction={"column"}>
          <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <Group grow>
              <TextInput
                key={form.key("name")}
                {...form.getInputProps("name")}
                withAsterisk
                label={"Name"}
              />

              <TextInput
                {...form.getInputProps("code")}
                withAsterisk
                label={"Code"}
              />
            </Group>
          </form>
          <Button onClick={handleSave} variant={"light"}>
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
