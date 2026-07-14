import { useForm } from "@mantine/form";
import reportSchema, { Report, ReportRequest } from "../../types/report.types";
import { useEffect, useMemo, useState, Fragment } from "react";
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
  Text,
  Badge,
  Collapse,
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
import {
  PAGE_FLEX_HEIGHT,
  SEARCH_ICON_SIZE,
  TITLE_DIVIDER_MY,
} from "../../constants/constants";
import urls from "../../constants/urls";
import RequestType from "../../request-handler/request-type";
import useRequestHandler from "../../hooks/useRequestHandler";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider";
import { useTranslation } from "react-i18next";
import Dictionary from "../../helpers/translation/dictionary";
import { PiPlusCircle } from "react-icons/pi";
import { Expense } from "../../types/expense.types";
import { FaPlaneDeparture } from "react-icons/fa";
import CreateAbroadReportModal from "./components/CreateAbroadReportModal";
import EditAbroadReportModal from "./components/EditAbroadReportModal";
import { currencyTypes, expenseTypes } from "../../constants/static-data";
import ExpenseType from "../../enums/expense-type";

function Reports() {
  const { reports, addReport, updateReport, deleteReport, replaceReports } =
    useReports();

  const [searchQuery, setSearchQuery] = useState("");

  const [showAbroadReports, setShowAbroadReports] = useState(false);

  const { handleDataRequest, downloadFile } = useRequestHandler();

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuthentication();

  const { t, i18n } = useTranslation();

  const currentMonth = new Intl.DateTimeFormat(i18n.language, {
    month: "long",
  }).format(new Date());
  const currentYear = new Date().getFullYear();
  const namePlaceholder = `${auth.currentUserFullName} - ${currentMonth} ${currentYear}`;

  const [expandedReportIds, setExpandedReportIds] = useState<string[]>([]);

  const toggleRow = (id: string) => {
    setExpandedReportIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const form = useForm<Report>({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      isAbroad: true,
      title: "",
      department: "",
      requestedAdvanceAmount: "",
      travelPlace: "",
      departureAndReturnDates: "",
      purposeOfTravel: "",
      advanceReceivedAmount: null,
      advanceReceivedAmountCurrency: null,
      amountToBeRefunded: null,
      amountToBeRefundedCurrency: null,
      amountToBePaid: null,
      amountToBePaidCurrency: null,
      declarant: "",
      departmentManager: "",
      departmentHead: "",
      financeOfficer: "",
      tlIban: "",
      eurIban: "",
      searchText: "",
      createUserId: "",
      createUserFullName: "",
      createDate: new Date(),
    },
    validate: zod4Resolver(reportSchema),
  });

  const openEditReport = (report: Report) => {
    modals.open({
      title: <Title order={4}>{t(Dictionary.Report.EDIT)}</Title>,
      size: report.isAbroad ? "60%" : "40%",
      styles: report.isAbroad
        ? {
            content: {
              minHeight: 840,
            },
          }
        : undefined,
      children: report.isAbroad ? (
        <EditAbroadReportModal
          report={report}
          updateReport={updateReport}
          checkIfReportIsValid={checkIfReportIsValid}
        />
      ) : (
        <EditReportModal
          report={report}
          updateReport={updateReport}
          checkIfReportIsValid={checkIfReportIsValid}
        />
      ),
    });
  };

  const openCreateAbroadReportModal = () => {
    modals.open({
      title: <Title order={4}>{t(Dictionary.Report.ABROAD)}</Title>,
      size: "60%",
      styles: {
        content: {
          minHeight: 840,
        },
      },
      children: (
        <CreateAbroadReportModal
          addReport={addReport}
          checkIfReportIsValid={checkIfReportIsValid}
          currentUserFullName={auth.currentUserFullName}
        />
      ),
    });
  };

  const openDeleteReportModal = (id: string) => {
    modals.open({
      title: <Title order={5}>{t(Dictionary.Report.DELETE)}</Title>,
      size: "md",
      children: (
        <Flex direction="column" gap={20}>
          <Text>{t(Dictionary.Report.DELETE_QUESTION)}</Text>
          <Flex direction="row" gap={10}>
            <Button
              flex={1}
              style={{ color: "red", backgroundColor: "#ffeeee" }}
              onClick={() => {
                handleDelete(id);
                modals.closeAll();
              }}
              variant="light"
            >
              {t(Dictionary.Common.DELETE)}
            </Button>
            <Button onClick={() => modals.closeAll()} flex={1} variant="light">
              {t(Dictionary.Common.CANCEL)}
            </Button>
          </Flex>
        </Flex>
      ),
    });
  };

  const getExpenses = async () => {
    const response = await handleDataRequest<never, Expense[]>(
      urls.expense,
      RequestType.Get,
    );

    if (!response.isSuccess) return;

    setExpenses(response.value);
  };

  const getReports = async () => {
    const response = await handleDataRequest<never, Report[]>(
      urls.report,
      RequestType.Get,
    );

    if (!response.isSuccess) return;

    replaceReports(
      response.value.map((x) => ({
        ...x,
        advanceReceivedAmountCurrency:
          x.advanceReceivedAmountCurrency !== null
            ? x.advanceReceivedAmountCurrency.toString()
            : null,
        amountToBeRefundedCurrency:
          x.amountToBeRefundedCurrency !== null
            ? x.amountToBeRefundedCurrency.toString()
            : null,
        amountToBePaidCurrency:
          x.amountToBePaidCurrency !== null
            ? x.amountToBePaidCurrency.toString()
            : null,
      })),
    );
  };

  const checkIfReportIsValid = (report: Report) => {
    if (
      reports.some(
        (x) => x.id !== report.id && x.name.trim() === report.name.trim(),
      )
    ) {
      toast.error(t(Dictionary.Report.SAME_NAME));
      return false;
    }

    const reportName = report.name.trim().toUpperCase();

    if (reportName === "HEPSI" || reportName === "ALL") {
      toast.error(t(Dictionary.Report.ALL_NAME));
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
      ...form.values,
      name: form.values.name.trim(),
      isAbroad: false,
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

    addReport({
      ...response.value,
      createUserFullName: auth.currentUserFullName,
    });

    form.reset();

    toast.success(t(Dictionary.Report.CREATED));

    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);

    if (expenses.find((x) => x.reportId === id)) {
      toast.error(t(Dictionary.Report.DELETE_RULE));
      setIsLoading(false);
      return;
    }

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

    toast.success(t(Dictionary.Report.DELETED));

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
        isAbroad: report.isAbroad,
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
        .filter((x) => (showAbroadReports === true ? x.isAbroad : x))
        .filter((x) =>
          x.searchText.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .map((x: Report) => {
          const isExpanded = expandedReportIds.includes(x.id);
          const reportExpenses = expenses.filter((e) => e.reportId === x.id);

          return (
            <Fragment key={x.id}>
              <Table.Tr onClick={() => toggleRow(x.id)}>
                <Table.Td> {x.name} </Table.Td>
                <Table.Td>
                  <Badge
                    size="md"
                    color={x.isAbroad ? "green" : "gray"}
                    variant="light"
                  >
                    {x.isAbroad
                      ? t(Dictionary.Common.YES)
                      : t(Dictionary.Common.NO)}
                  </Badge>
                </Table.Td>
                <Table.Td> {x.createUserFullName} </Table.Td>
                <Table.Td>
                  {format(x.createDate, "dd/MM/yyyy - HH.mm")}
                </Table.Td>
                <Table.Td onClick={(e) => e.stopPropagation()}>
                  <Flex justify="center" gap={10} align="center">
                    <Button
                      size="xs"
                      onClick={() => downloadReport(x)}
                      variant="light"
                      color="blue"
                      loading={isLoading}
                      leftSection={<IconDownload size={16} />}
                    >
                      {t(Dictionary.Report.DOWNLOAD)}
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => openEditReport(x)}
                      variant="light"
                      leftSection={<IconEdit size={16} />}
                    >
                      {t(Dictionary.Common.EDIT)}
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => openDeleteReportModal(x.id)}
                      variant="light"
                      leftSection={<IconTrash size={16} />}
                      style={{ color: "red", backgroundColor: "#ffeeee" }}
                    >
                      {t(Dictionary.Common.DELETE)}
                    </Button>
                  </Flex>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td colSpan={5} p={0}>
                  <Collapse in={isExpanded} transitionDuration={200}>
                    <Card
                      style={{
                        borderRadius: 0,
                        boxShadow: "none",
                      }}
                    >
                      {reportExpenses.length > 0 ? (
                        <Table striped highlightOnHover withColumnBorders>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>
                                {t(Dictionary.Expense.DECLARANT)}
                              </Table.Th>
                              <Table.Th>{t(Dictionary.Expense.TYPE)}</Table.Th>
                              <Table.Th>{t(Dictionary.Expense.DATE)}</Table.Th>
                              <Table.Th>
                                {t(Dictionary.Expense.TOTAL_PRICE)}
                              </Table.Th>
                              <Table.Th>
                                {t(Dictionary.Expense.CURRENCY)}
                              </Table.Th>
                              <Table.Th>
                                {t(Dictionary.Expense.DESCRIPTION)}
                              </Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {reportExpenses.map((e) => (
                              <Table.Tr key={e.id}>
                                <Table.Td>{e.declarantFullName}</Table.Td>
                                <Table.Td>
                                  {expenseTypes[Number(e.expenseType)]?.label}
                                </Table.Td>
                                <Table.Td>
                                  {format(
                                    new Date(e.expenseDate),
                                    "dd/MM/yyyy",
                                  )}
                                </Table.Td>
                                <Table.Td>{e.totalPrice}</Table.Td>
                                <Table.Td>
                                  {currencyTypes[Number(e.currency)]?.label}
                                </Table.Td>
                                <Table.Td>
                                  {Number(e.expenseType) !==
                                  Number(ExpenseType.Food)
                                    ? e.description
                                    : "-"}
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      ) : (
                        <Text size="sm" c="dimmed" ta="center">
                          {t(Dictionary.Expense.NO_FOUND)}
                        </Text>
                      )}
                    </Card>
                  </Collapse>
                </Table.Td>
              </Table.Tr>
            </Fragment>
          );
        }),
    [
      reports,
      showAbroadReports,
      searchQuery,
      isLoading,
      expandedReportIds,
      expenses,
    ],
  );

  useEffect(() => {
    getReports();
    getExpenses();
  }, []);

  return (
    <Flex direction="column" h={PAGE_FLEX_HEIGHT}>
      <Title order={3}>{t(Dictionary.Common.REPORTS)}</Title>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card shadow="xs" radius="md" withBorder>
        <Flex gap={20}>
          <Flex gap="md" direction="column" w="100%">
            <TextInput
              {...form.getInputProps("name")}
              withAsterisk
              placeholder={namePlaceholder}
              label={t(Dictionary.Report.NAME)}
              mih={80}
            />
            <Button
              onClick={handleSave}
              variant="light"
              loading={isLoading}
              leftSection={<PiPlusCircle size={22} />}
            >
              {t(Dictionary.Report.CREATE_NEW)}
            </Button>
          </Flex>
          <Divider orientation="vertical" />
          <Flex align="center">
            <Button
              variant="light"
              leftSection={<FaPlaneDeparture />}
              onClick={openCreateAbroadReportModal}
            >
              {t(Dictionary.AbroadReport.CREATE)}
            </Button>
          </Flex>
        </Flex>
      </Card>
      <Card mt="sm" radius="md" withBorder padding="sm" flex={1}>
        <Flex gap="xs" mb="md" align="center">
          <TextInput
            size="xs"
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE}></IconSearch>}
            flex={1}
            {...form.getInputProps("searchText")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Checkbox
            ml="10px"
            labelPosition="left"
            label={t(Dictionary.Report.SHOW_ABROAD)}
            checked={showAbroadReports}
            onChange={() => setShowAbroadReports(!showAbroadReports)}
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
            style={{ tableLayout: "fixed" }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t(Dictionary.Report.NAME)}</Table.Th>
                <Table.Th>{t(Dictionary.Report.ABROAD)}</Table.Th>
                <Table.Th>{t(Dictionary.Common.CREATE_USER)}</Table.Th>
                <Table.Th>{t(Dictionary.Common.CREATE_DATE)}</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{memoizedReports}</Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>
    </Flex>
  );
}

export default Reports;
