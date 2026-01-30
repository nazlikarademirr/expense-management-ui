import { useForm } from "@mantine/form";
import { Report, ReportRequest } from "../../types/report";
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
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconDownload,
  IconEdit,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { modals } from "@mantine/modals";
import EditReportModal from "./components/EditReportModal";
import useReports from "../../hooks/useReports";
import { TiTick, TiTimes } from "react-icons/ti";
import { HiCheck } from "react-icons/hi";
import {
  BOOLEAN_ICON_SIZE,
  CREATE_USER,
  SEARCH_ICON_SIZE,
  TITLE_DIVIDER_MY,
} from "../../constants/constants";
import {
  createJsonPatchDocumentFromObject,
  JsonPatchKeyValuePair,
} from "../../types/json-patch-document";
import urls from "../../constants/urls";
import RequestType from "../../request-handler/request-type";
import useRequestHandler from "../../hooks/useRequestHandler";

function Reports() {
  const { reports, addReport, updateReport, deleteReport, replaceReports } =
    useReports();

  const [searchQuery, setSearchQuery] = useState("");

  const [showUnapprovedReports, setShowUnapprovedReports] = useState(false);

  const { handleDataRequest, downloadFile } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      isApproved: false,
      searchText: "",
      createUser: "",
      createDate: new Date(),
    },
    validate: {
      name: (value) =>
        value.trim().length === 0
          ? "Name cannot be empty."
          : value.trim().length < 2
            ? "Name must have at least 2 letters."
            : value.trim().length > 128
              ? "Name cannot exceed 128 characters."
              : undefined,
    },
  });

  const openEditReport = (report: Report) => {
    modals.open({
      title: <Title order={4}>Edit Report</Title>,
      size: "xl",
      children: (
        <EditReportModal
          report={report}
          updateReport={updateReport}
          checkIfReportIsValid={checkIfReportIsValid}
        />
      ),
    });
  };

  const approveReport = async (report: Report) => {
    setIsLoading(true);

    const patchDocument = createJsonPatchDocumentFromObject({
      isApproved: true,
    });

    const response = await handleDataRequest<JsonPatchKeyValuePair[], Report>(
      `${urls.report}/${report.id}`,
      RequestType.Patch,
      patchDocument,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    updateReport({ ...report, isApproved: true });

    toast.success("Report approved successfully.");

    modals.closeAll();

    setIsLoading(false);
  };

  const openApproveReportModal = (report: Report) => {
    modals.open({
      title: <Title order={5}>Approve Report</Title>,
      size: "md",
      children: (
        <Flex direction={"column"} gap={20}>
          <Text>Are you sure you want to approve the report?</Text>
          <Flex direction={"row"} gap={10}>
            <Button
              style={{ flexGrow: 1 }}
              onClick={() => approveReport(report)}
              variant={"light"}
              color={"blue"}
            >
              Approve
            </Button>
            <Button style={{ flexGrow: 1 }} variant={"light"} color={"red"}>
              Cancel
            </Button>
          </Flex>
        </Flex>
      ),
    });
  };

  const openDeleteReportModal = (id: string) => {
    modals.open({
      title: <Title order={5}>Delete Report</Title>,
      size: "md",
      children: (
        <Flex direction={"column"} gap={20}>
          <Text>Are you sure you want to delete the report?</Text>
          <Flex direction={"row"} gap={10}>
            <Button
              style={{ flexGrow: 1 }}
              onClick={() => {
                handleDelete(id);
                modals.closeAll();
              }}
              variant={"light"}
              color={"blue"}
            >
              Delete
            </Button>
            <Button
              onClick={() => modals.closeAll()}
              style={{ flexGrow: 1 }}
              variant={"light"}
              color={"red"}
            >
              Cancel
            </Button>
          </Flex>
        </Flex>
      ),
    });
  };

  const getReports = async () => {
    const response = await handleDataRequest<never, Report[]>(
      urls.report,
      RequestType.Get,
    );

    if (!response.isSuccess) return;

    replaceReports(response.value);
  };

  const checkIfReportIsValid = (report: Report) => {
    if (reports.some((x) => x.name.trim() === report.name.trim())) {
      toast.error("There is a report with the same name!");
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

    if (!checkIfReportIsValid(form.values)) {
      setIsLoading(false);
      return;
    }

    const request: ReportRequest = {
      name: form.values.name,
      isApproved: form.values.isApproved,
    };

    const response = await handleDataRequest<ReportRequest, Report>(
      urls.report,
      RequestType.Post,
      request,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    addReport(response.value);

    form.reset();

    toast.success("Report has been added successfully!");

    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);

    const response = await handleDataRequest<string, never>(
      urls.report,
      RequestType.Delete,
      undefined,
      { id },
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    deleteReport(id);

    toast.success("Report has been deleted successfully!");

    setIsLoading(false);
  };

  const downloadReport = async (report: Report) => {
    setIsLoading(true);

    const response = await downloadFile(
      urls.expenseExcel,
      report.name,
      undefined,
      {
        reportId: report.id,
      },
    );

    if (!response) {
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  const memoizedReports = useMemo(
    () =>
      reports
        .filter((x) => (showUnapprovedReports === true ? !x.isApproved : x))
        .filter((x) =>
          x.searchText.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .map((x: Report) => (
          <Table.Tr key={x.id}>
            <Table.Td> {x.name} </Table.Td>
            <Table.Td>
              {x.isApproved ? (
                <TiTick size={BOOLEAN_ICON_SIZE} color="green" />
              ) : (
                <TiTimes size={BOOLEAN_ICON_SIZE} color="#BA1A1A" />
              )}
            </Table.Td>
            <Table.Td> {CREATE_USER} </Table.Td>
            <Table.Td>{format(x.createDate, "dd/MM/yyyy - HH.mm")}</Table.Td>
            <Table.Td>
              <Flex justify={"center"} gap={5}>
                {x.isApproved ? (
                  <Tooltip label="Download" withArrow>
                    <ActionIcon
                      onClick={() => downloadReport(x)}
                      variant={"light"}
                      color={"blue"}
                      loading={isLoading}
                    >
                      <IconDownload />
                    </ActionIcon>
                  </Tooltip>
                ) : (
                  <Flex>
                    <Tooltip label="Approve" withArrow>
                      <ActionIcon
                        disabled={x.isApproved}
                        onClick={() => openApproveReportModal(x)}
                        variant={"light"}
                        color={"green"}
                      >
                        <HiCheck size={30} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit" withArrow>
                      <ActionIcon
                        disabled={x.isApproved}
                        onClick={() => openEditReport(x)}
                        variant={"light"}
                        color={"blue"}
                      >
                        <IconEdit />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete" withArrow>
                      <ActionIcon
                        disabled={x.isApproved}
                        onClick={() => openDeleteReportModal(x.id)}
                        variant={"light"}
                        color={"red"}
                      >
                        <IconTrash />
                      </ActionIcon>
                    </Tooltip>
                  </Flex>
                )}
              </Flex>
            </Table.Td>
          </Table.Tr>
        )),
    [reports, showUnapprovedReports, searchQuery, isLoading],
  );

  useEffect(() => {
    getReports();
  }, []);

  return (
    <div>
      <Title order={3}>Reports</Title>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card shadow={"xs"} radius={"md"} withBorder>
        <Flex gap={"md"} direction={"column"}>
          <TextInput
            {...form.getInputProps("name")}
            withAsterisk
            placeholder={format(new Date(), "dd/MM/yyyy")}
            label={"Name"}
            style={{ minHeight: 80 }}
          />
          <Button onClick={handleSave} variant={"light"} loading={isLoading}>
            Add New Report
          </Button>
        </Flex>
      </Card>
      <Card mt={"sm"} radius={"md"} withBorder padding={"sm"}>
        <Flex gap={"xs"}>
          <TextInput
            size="xs"
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE}></IconSearch>}
            style={{ flexGrow: 120 }}
            {...form.getInputProps("searchText")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Checkbox
            labelPosition="left"
            label={"Show Unapproved Reports"}
            style={{ marginTop: "5px", marginLeft: "10px" }}
            checked={showUnapprovedReports}
            onChange={() => setShowUnapprovedReports(!showUnapprovedReports)}
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
              <Table.Th>Approved</Table.Th>
              <Table.Th>Create User</Table.Th>
              <Table.Th>Create Date</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{memoizedReports}</Table.Tbody>
        </Table>
      </Card>
    </div>
  );
}

export default Reports;
