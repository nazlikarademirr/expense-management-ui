import { useForm } from "@mantine/form";
import { Report } from "../../types/report";
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
import { IconDownload, IconEdit, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { modals } from "@mantine/modals";
import EditReportModal from "./components/EditReportModal";
import useReports from "../../hooks/useReports";

function Reports() {
  const { reports, addReport, downloadReport, updateReport, deleteReport } =
    useReports({
      hasValueLabel: false,
    });

  const form = useForm({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      lastReportDate: new Date(),
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

  const openEditReport = (report: Report) => {
    modals.open({
      title: "Edit Report",
      size: "xl",
      children: <EditReportModal report={report} updateReport={updateReport} />,
    });
  };

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
                onClick={() => downloadReport(x.id)}
                variant={"light"}
                color={"blue"}
              >
                <IconDownload />
              </ActionIcon>
              <ActionIcon
                onClick={() => openEditReport(x)}
                variant={"light"}
                color={"blue"}
              >
                <IconEdit />
              </ActionIcon>
              <ActionIcon
                onClick={() => deleteReport(x.id)}
                variant={"light"}
                color={"red"}
              >
                <IconTrash />
              </ActionIcon>
            </Flex>
          </Table.Td>
        </Table.Tr>
      )),
    [reports]
  );

  const handleSave = async () => {
    form.validate();

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
          <TextInput
            {...form.getInputProps("name")}
            withAsterisk
            label={"Name"}
          />
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
