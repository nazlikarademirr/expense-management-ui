import { useForm } from "@mantine/form";
import { Report } from "../../types/report";
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
import { IconDownload } from "@tabler/icons-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import useReports from "./hooks/useReports";

function Reports() {
  const { reports, addReport, downloadReport } = useReports();

  const form = useForm({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      lastReportDate: new Date(),
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

  const memoizedReports = useMemo(
    () =>
      reports.map((x: Report) => (
        <Table.Tr key={x.id}>
          <Table.Td> {x.name} </Table.Td>
          <Table.Td> {String(x.lastReportDate)} </Table.Td>
          <Table.Td> {"true"} </Table.Td>
          <Table.Td> {x.createUser} </Table.Td>
          <Table.Td>{format(x.createDate, "dd/MM/yyyy HH:mm")}</Table.Td>
          <Table.Td>
            <Flex justify={"center"} gap={5}>
              <ActionIcon
                onClick={(_) => downloadReport(x.id)}
                variant={"light"}
                color={"blue"}
              >
                <IconDownload />
              </ActionIcon>
            </Flex>
          </Table.Td>
        </Table.Tr>
      )),
    [reports]
  );

  const handleSave = async () => {
    if (!form.isValid()) return;

    const retVal = await addReport(form.values);

    if (retVal) {
      form.reset();
      toast.success("Report has been added successfully!");
    }
  };

  return (
    <div>
      <Title order={3}>Reports</Title>
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
            </Group>
          </form>
          <Button onClick={handleSave} variant={"light"}>
            Add New Report
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
            <Table.Th>Last Report Date</Table.Th>
            <Table.Th>Is Active</Table.Th>
            <Table.Th>Create User</Table.Th>
            <Table.Th>Create Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{memoizedReports}</Table.Tbody>
      </Table>
    </div>
  );
}

export default Reports;
