import { useForm } from "@mantine/form";
import {
  Button,
  Card,
  Divider,
  Flex,
  Group,
  NumberInput,
  Radio,
  ScrollArea,
  Select,
  Table,
  TextInput,
  Title,
  Text,
  Combobox,
  useCombobox,
  InputBase,
  Box,
  Checkbox,
  Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import expenseSchema, {
  Expense,
  ExpenseRequest,
  ExpenseResponse,
} from "../../types/expense.types";
import useExpenses from "./hooks/useExpenses";
import {
  IconEdit,
  IconSearch,
  IconTrash,
  IconDownload,
} from "@tabler/icons-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { DateInput, DatesProvider } from "@mantine/dates";
import EditExpenseModal from "./components/EditExpenseModal";
import AddOvertimeMemberModal from "./components/AddOvertimeMemberModal";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { currencyTypes, expenseTypes } from "../../constants/static-data";
import ExpenseType from "../../enums/expense-type";
import { PAGE_FLEX_HEIGHT, SEARCH_ICON_SIZE } from "../../constants/constants";
import urls from "../../constants/urls";
import RequestType from "../../request-handler/request-type";
import useRequestHandler from "../../hooks/useRequestHandler";
import { SelectItem } from "../../types/select-item.types";
import { User } from "../../types/user.types";
import { Project } from "../../types/project.types";
import { Report } from "../../types/report.types";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider";
import { useTranslation } from "react-i18next";
import Dictionary from "../../helpers/translation/dictionary";
import { OcrResult } from "../../types/ocr.types";
import { PiPlusCircle, PiWarningCircle } from "react-icons/pi";
import ReceiptUploader from "../../components/ReceiptUploader/ReceiptUploader";
import normalizeText from "../../helpers/NormalizeText";
import useReports from "../../hooks/useReports";
import i18n from "../../helpers/translation/i18n";
import CreateReportModal from "./components/CreateReportModal";
import { dateParse } from "../../helpers/DateParser";
import CurrencyType from "../../enums/currency-type";
import { useLocation } from "react-router";
import EditReportModal from "../Reports/components/EditReportModal";
import Role from "../../enums/role";
import { AiOutlineTeam } from "react-icons/ai";

const INPUT_WIDTH = "25%";
const MIN_FLEX_HEIGHT = 120;
const foodSelectorKeywords = ["yiyecek", "icecek", "KDV", "kdv"];
const travelSelectorKeywords = [
  "maliye",
  "bakanligi",
  "turkiye",
  "esnaf",
  "sanatkarlari",
  "konfederasyonu",
];

const tlCurrencySelectorKeywords = [
  "tl",
  "₺",
  "yiyecek",
  "icecek",
  "kdv",
  "KDV",
  "%10",
  "maliye",
  "bakanligi",
  "turkiye",
  "esnaf",
  "sanatkarlari",
  "konfederasyonu",
];

function Expenses() {
  const location = useLocation();
  const { t } = useTranslation();

  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    replaceExpenses,
  } = useExpenses();

  const { addReport, updateReport } = useReports();

  const { handleDataRequest, downloadFile } = useRequestHandler();

  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [activeUserSelectData, setActiveUserSelectData] = useState<
    SelectItem[]
  >([]);

  const [activeProjectSelectData, setActiveProjectSelectData] = useState<
    SelectItem[]
  >([]);

  const [reports, setReports] = useState<Report[]>([]);

  const reportSelectData = useMemo<SelectItem[]>(
    () => reports.map((x) => ({ value: x.id, label: x.name })),
    [reports],
  );

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDeclarant, setSelectedDeclarant] = useState<string | null>(
    null,
  );

  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const [showReportError, setShowReportError] = useState(false);

  const [newReportName, setNewReportName] = useState("");

  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);

  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  const [isInitialDeclarantSet, setIsInitialDeclarantSet] = useState(false);

  const combobox = useCombobox();

  const auth = useAuthentication();

  const form = useForm<Expense>({
    initialValues: {
      id: crypto.randomUUID(),
      declarantId: null,
      declarantFullName: "",
      projectId: null,
      projectName: "",
      expenseType: "",
      expenseDate: null,
      totalPrice: 0,
      currency: CurrencyType.TL,
      description: "",
      reportId: "",
      reportName: "",
      overtimeMembers: [],
      isActive: false,
      searchText: "",
      createUserId: "",
      createUserFullName: "",
      createDate: new Date(),
    },
    validate: zod4Resolver(expenseSchema),
  });

  const openEditExpense = (expense: Expense) => {
    modals.open({
      title: <Title order={4}>{t(Dictionary.Expense.EDIT)}</Title>,
      size: "90%",
      closeOnClickOutside: false,
      children: (
        <EditExpenseModal
          expense={expense}
          updateExpense={updateExpense}
          activeUserSelectData={activeUserSelectData}
          activeProjectSelectData={activeProjectSelectData}
          reportSelectData={reportSelectData}
          checkIfExpenseIsValid={checkIfExpenseIsValid}
          currentUserFullName={auth.currentUserFullName}
        />
      ),
    });
  };

  const openDeleteExpenseModal = (id: string) => {
    modals.open({
      title: <Title order={5}>{t(Dictionary.Expense.DELETE)}</Title>,
      size: "md",
      closeOnClickOutside: false,
      children: (
        <Flex direction="column" gap={20}>
          <Text>{t(Dictionary.Expense.DELETION_QUESTION)}</Text>
          <Flex direction="row" gap={10}>
            <Button
              loading={isLoading}
              onClick={() => {
                handleDelete(id);
                modals.closeAll();
              }}
              variant="light"
              flex={1}
              style={{ color: "red", backgroundColor: "#ffeeee" }}
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

  const handleAddReport = (report: Report) => {
    addReport(report);
    setReports((prev) => [...prev, report]);
    setSelectedReport(report.id);
    setNewReportName(report.name);
    setSearchQuery("");
    setShowReportError(false);
  };

  const openCreateReportModal = () => {
    modals.open({
      title: <Title order={4}>{t(Dictionary.Report.NEW)}</Title>,
      size: "60%",
      returnFocus: false,
      closeOnClickOutside: false,
      styles: {
        content: {
          minHeight: 840,
        },
      },
      children: (
        <CreateReportModal
          addReport={handleAddReport}
          checkIfReportIsValid={checkIfReportIsValid}
          currentUserFullName={auth.currentUserFullName}
          activeProjectSelectData={activeProjectSelectData}
        />
      ),
    });
  };

  const checkIfReportIsValid = (report: Report) => {
    if (
      reportSelectData.some(
        (x) => x.value !== report.id && x.label.trim() === report.name.trim(),
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

  const getActiveUsers = async () => {
    const response = await handleDataRequest<never, User[]>(
      urls.user,
      RequestType.Get,
      undefined,
      { isActive: true },
    );

    if (!response.isSuccess) return;

    setActiveUsers(response.value);

    setActiveUserSelectData(
      response.value.map((x) => ({
        value: x.id,
        label: `${x.name} ${x.surname}`,
      })),
    );
  };

  const getActiveProjects = async () => {
    const response = await handleDataRequest<never, Project[]>(
      urls.project,
      RequestType.Get,
      undefined,
      { isActive: true },
    );

    if (!response.isSuccess) return;

    setActiveProjectSelectData(
      response.value.map((x) => ({ value: x.id, label: x.name })),
    );
  };

  const getReports = async () => {
    const response = await handleDataRequest<never, Report[]>(
      urls.report,
      RequestType.Get,
    );

    if (!response.isSuccess) return;

    setReports(response.value);
  };

  const getExpenses = async () => {
    const response = await handleDataRequest<never, ExpenseResponse[]>(
      urls.expense,
      RequestType.Get,
    );

    if (!response.isSuccess) return;

    const expenseList = response.value.map((x) => ({
      ...x,
      expenseType: x.expenseType.toString(),
      currency: x.currency.toString(),
    }));

    replaceExpenses(expenseList);
  };

  const checkIfExpenseIsValid = (expense: Expense) => {
    if (expense.expenseDate && expense.expenseDate > new Date()) {
      toast.error(t(Dictionary.Expense.DATE_VALID));
      return false;
    }

    let totalPrice = 0;

    expense.overtimeMembers.forEach((x) => {
      totalPrice = totalPrice + x.price;
    });

    if (totalPrice > expense.totalPrice) {
      toast.error(t(Dictionary.Expense.TOTAL_PRICE_VALID));
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setIsLoading(true);

    if (!selectedReport) {
      setShowReportError(true);
      toast.error(t(Dictionary.Report.SELECT));
      setIsLoading(false);
      return;
    }

    setShowReportError(false);

    form.validate();

    if (!form.isValid()) {
      setIsLoading(false);
      return;
    }

    if (!checkIfExpenseIsValid(form.values)) {
      setIsLoading(false);
      return;
    }

    if (
      form.values.overtimeMembers.some(
        (x) => x.userId === form.values.declarantId,
      )
    ) {
      toast.error(
        t(
          Dictionary.OvertimeMember.YOU_CAN_NOT_ADD_YOURSELF_AS_OVERTIME_MEMBER,
        ),
      );
      setIsLoading(false);
      return;
    }

    const expenseRequest: ExpenseRequest = {
      ...form.values,
      declarantId: form.values.declarantId ?? "",
      projectId: form.values.projectId ?? "",
      expenseType: Number(form.values.expenseType),
      expenseDate: form.values.expenseDate!,
      currency: Number(form.values.currency),
      reportId: selectedReport,
    };

    const response = await handleDataRequest<ExpenseRequest, ExpenseResponse>(
      urls.expense,
      RequestType.Post,
      expenseRequest,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    addExpense({
      ...response.value,
      expenseType: expenseTypes[response.value.expenseType].value,
      currency: currencyTypes[response.value.currency].value,
      createUserFullName: auth.currentUserFullName,
    });

    const currentDeclarantId = form.values.declarantId;
    const currentProjectId = form.values.projectId;
    const currentCurrency = form.values.currency;
    const currentExpenseType = form.values.expenseType;

    form.reset();

    form.setValues({
      declarantId: currentDeclarantId,
      projectId: currentProjectId,
      currency: currentCurrency,
      expenseType: currentExpenseType,
    });

    if (
      expenses.find(
        (x) =>
          x.expenseDate &&
          format(x.expenseDate, "dd/MM/yyyy") ===
            format(form.values.expenseDate!, "dd/MM/yyyy") &&
          x.declarantId === form.values.declarantId &&
          x.projectId === form.values.projectId &&
          x.expenseType === form.values.expenseType &&
          x.totalPrice === form.values.totalPrice &&
          x.currency === form.values.currency,
      )
    ) {
      toast(t(Dictionary.Expense.SIMILARITY_WARNING), {
        icon: <PiWarningCircle size={70} color="green" />,
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    toast.success(t(Dictionary.Expense.ADDED));

    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);

    const response = await handleDataRequest<string, never>(
      urls.expense,
      RequestType.Delete,
      undefined,
      { id },
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    deleteExpense(id);

    toast.success(t(Dictionary.Expense.DELETED));

    setIsLoading(false);
  };

  const handleBulkDelete = async () => {
    setIsLoading(true);

    const response = await handleDataRequest<string[], never>(
      urls.expenseBulkDelete,
      RequestType.Post,
      selectedExpenses,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    selectedExpenses.forEach((id) => deleteExpense(id));
    setSelectedExpenses([]);
    setIsSelectionMode(false);

    toast.success(t(Dictionary.Expense.DELETED));

    setIsLoading(false);
  };

  const openBulkDeleteModal = () => {
    if (selectedExpenses.length === 0) return;
    modals.open({
      title: <Title order={5}>{t(Dictionary.Expense.DELETE)}</Title>,
      size: "md",
      closeOnClickOutside: false,
      children: (
        <Flex direction="column" gap={20}>
          <Text>
            {t(Dictionary.Expense.BULK_DELETE, {
              selectedExpenses: selectedExpenses.length,
            })}
          </Text>
          <Flex direction="row" gap={10}>
            <Button
              loading={isLoading}
              onClick={() => {
                handleBulkDelete();
                modals.closeAll();
              }}
              variant="light"
              flex={1}
              style={{ color: "red", backgroundColor: "#ffeeee" }}
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

  const toggleExpenseSelection = (id: string) => {
    setSelectedExpenses((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const addOvertimeMember = () => {
    modals.open({
      title: <Title order={5}>{t(Dictionary.OvertimeMember.ADD_NEW)}</Title>,
      size: "xl",
      closeOnClickOutside: false,
      children: (
        <AddOvertimeMemberModal
          expenseForm={form}
          activeUserSelectData={activeUserSelectData}
          currentUser={auth.currentUser}
        />
      ),
    });
  };

  const filteredReportSelectData = reportSelectData.filter((x) =>
    x.label.includes(searchQuery.trim()),
  );

  const setExpenseTypeFromOcr = (result: OcrResult) => {
    const text = normalizeText(result.rawText.join(" "));

    if (foodSelectorKeywords.some((x) => text.includes(x))) {
      const foodValue = expenseTypes[ExpenseType.Food].value;
      form.setFieldValue("expenseType", foodValue);
      return foodValue;
    }

    if (travelSelectorKeywords.some((x) => text.includes(x))) {
      const transportationValue =
        expenseTypes[ExpenseType.Transportation].value;
      form.setFieldValue("expenseType", transportationValue);
      return transportationValue;
    }
  };

  const setCurrencyFromOcr = (result: OcrResult) => {
    const text = normalizeText(result.rawText.join(" "));

    if (tlCurrencySelectorKeywords.some((x) => text.includes(x))) {
      const tl = currencyTypes.find(
        (x) =>
          x.label.toLowerCase().includes("tl") ||
          x.label.toLowerCase().includes("try"),
      );

      if (tl) {
        form.setFieldValue("currency", tl.value);
        return tl.value;
      }
    }

    return null;
  };

  const ocrComplete = (result: OcrResult) => {
    if (result.confidence < 0.7) return;
    setExpenseTypeFromOcr(result);
    setCurrencyFromOcr(result);
    if (result.totalPrice)
      form.setFieldValue("totalPrice", parseFloat(result.totalPrice));
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((x) =>
        x.searchText.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .filter((x) => (selectedReport ? x.reportId === selectedReport : true))
      .filter((x) =>
        selectedDeclarant ? x.declarantId === selectedDeclarant : true,
      )
      .filter(
        (x) =>
          activeUserSelectData.find((y) => y.value === x.declarantId)?.label,
      )
      .filter(
        (x) =>
          activeProjectSelectData.find((y) => y.value === x.projectId)?.label,
      );
  }, [
    expenses,
    searchQuery,
    selectedDeclarant,
    selectedReport,
    activeUserSelectData,
    activeProjectSelectData,
  ]);

  const memoizedExpenses = useMemo(
    () =>
      filteredExpenses.map((x: Expense) => (
        <Table.Tr key={x.id}>
          {isSelectionMode && (
            <Table.Td>
              <Checkbox
                radius="xl"
                checked={selectedExpenses.includes(x.id)}
                onChange={() => toggleExpenseSelection(x.id)}
              />
            </Table.Td>
          )}
          <Table.Td>{x.declarantFullName}</Table.Td>
          <Table.Td>{x.projectName}</Table.Td>
          <Table.Td>{expenseTypes[Number(x.expenseType)].label}</Table.Td>
          <Table.Td>
            {x.expenseDate && format(x.expenseDate, "dd/MM/yyyy")}
          </Table.Td>
          <Table.Td> {x.totalPrice} </Table.Td>
          <Table.Td>{currencyTypes[Number(x.currency)].label}</Table.Td>
          <Table.Td>
            {x.expenseType !== ExpenseType.Food ? x.description : "-"}
          </Table.Td>

          <Table.Td>{x.reportName}</Table.Td>
          <Table.Td>
            <Flex justify="center" gap={5}>
              <Button
                onClick={() => openEditExpense(x)}
                variant="light"
                radius={5}
                loading={isLoading}
                leftSection={<IconEdit size={18} />}
              >
                {t(Dictionary.Common.EDIT)}
              </Button>
              <Button
                onClick={() => openDeleteExpenseModal(x.id)}
                variant="light"
                radius={5}
                loading={isLoading}
                style={{ color: "red", backgroundColor: "#ffeeee" }}
                leftSection={<IconTrash size={18} />}
              >
                {t(Dictionary.Common.DELETE)}
              </Button>
            </Flex>
          </Table.Td>
        </Table.Tr>
      )),
    [isLoading, filteredExpenses, isSelectionMode, selectedExpenses],
  );

  const ocrMapping = useMemo(
    () => ({
      date: "expenseDate" as keyof Expense,
    }),
    [],
  );

  const managerSelectData = useMemo(() => {
    return activeUsers
      .filter((user) => user.role.toString() === Role.Admin)
      .map((user) => ({
        value: user.id,
        label: `${user.name} ${user.surname}`,
      }));
  }, [activeUsers]);

  const travelPlaceSelectData = useMemo(() => {
    return [
      ...new Map(
        reports
          .filter(
            (report) => report.travelPlace && report.travelPlace.trim() !== "",
          )
          .map((report) => [
            report.travelPlace,
            { value: report.id, label: report.travelPlace },
          ]),
      ).values(),
    ];
  }, [reports]);

  const projectSelectData = useMemo(() => {
    return activeProjectSelectData.map((x) => x.label);
  }, [activeProjectSelectData]);

  const handleReportSelect = (value: string) => {
    setShowReportError(false);
    setSearchQuery("");
    if (value === "all") {
      setSelectedReport(null);
      setNewReportName(t(Dictionary.Common.ALL));
      combobox.closeDropdown();
      return;
    }
    const selected = reportSelectData.find((x) => x.value === value);

    setSelectedReport(value);
    setNewReportName(selected?.label ?? "");

    combobox.closeDropdown();
  };

  const handleReportNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowReportError(false);
    setNewReportName(event.currentTarget.value);
    setSearchQuery(event.currentTarget.value);
    setSelectedReport(null);
    combobox.openDropdown();
  };

  const handleOpenReportDropdown = () => {
    combobox.openDropdown();
  };

  const handleCreateReport = () => {
    openCreateReportModal();
    combobox.closeDropdown();
  };

  const handleDownloadReport = async () => {
    if (!selectedReport) return;
    const report = reports.find((r) => r.id === selectedReport);
    if (!report) return;

    setIsLoading(true);

    await downloadFile(urls.expenseExcel, report.name, undefined, {
      reportId: report.id,
      isTravel: report.isTravel,
    });

    setIsLoading(false);
  };

  const handleEditReport = () => {
    if (!selectedReport) return;
    const report = reports.find((r) => r.id === selectedReport);
    if (!report) return;

    modals.open({
      title: <Title order={4}>{t(Dictionary.Report.EDIT)}</Title>,
      size: "60%",
      yOffset: 20,
      styles: { content: { minHeight: 930 } },
      closeOnClickOutside: false,
      children: (
        <EditReportModal
          report={report}
          updateReport={updateReport}
          checkIfReportIsValid={checkIfReportIsValid}
          activeUsers={activeUsers}
          activeUserSelectData={activeUserSelectData}
          managerSelectData={managerSelectData}
          projectSelectData={projectSelectData}
          travelPlaceSelectData={travelPlaceSelectData}
          namePlaceholder={report.name}
        />
      ),
    });
  };

  useEffect(() => {
    if (!isInitialDeclarantSet && auth.currentUser) {
      form.setFieldValue("declarantId", auth.currentUser.id);
      setIsInitialDeclarantSet(true);
    }
  }, [auth.currentUser, isInitialDeclarantSet, form]);

  useEffect(() => {
    getActiveUsers();
    getActiveProjects();
    getReports();
    getExpenses();
  }, []);

  useEffect(() => {
    if (location.state?.reportId && location.state?.reportName) {
      setSelectedReport(location.state.reportId);
      setNewReportName(location.state.reportName);
    }
  }, [location.state]);

  return (
    <Flex direction="column" h={PAGE_FLEX_HEIGHT} w="100%">
      <Flex justify="space-between" align="center" gap={10} w="100%">
        <Title order={3} mb={5}>
          {t(Dictionary.Common.EXPENSES)}
        </Title>
        <Flex flex={1} justify="flex-end" align="center">
          <Text fw={600} size="sm">
            {t(Dictionary.Expense.REPORT)}
          </Text>
        </Flex>
        <Flex gap={10} align="center" w="25%">
          <Box flex={1} pos="relative">
            <Combobox
              store={combobox}
              onOptionSubmit={handleReportSelect}
              withinPortal={false}
            >
              <Combobox.Target>
                <Tooltip
                  label={t(Dictionary.Report.SELECT)}
                  disabled={!!newReportName}
                  position="bottom"
                  withArrow
                  withinPortal={false}
                >
                  <InputBase
                    w="100%"
                    value={newReportName}
                    error={showReportError}
                    styles={{
                      input: {
                        borderColor: showReportError ? "red" : undefined,
                      },
                    }}
                    rightSection={<Combobox.Chevron />}
                    onClick={handleOpenReportDropdown}
                    onFocus={handleOpenReportDropdown}
                    placeholder={t(Dictionary.Report.SELECT)}
                    onChange={handleReportNameChange}
                  ></InputBase>
                </Tooltip>
              </Combobox.Target>

              <Combobox.Dropdown>
                <Combobox.Options>
                  <Combobox.Option value="all">
                    {t(Dictionary.Common.ALL)}
                  </Combobox.Option>
                  {filteredReportSelectData.map((x) => (
                    <Combobox.Option key={x.value} value={x.value}>
                      <Flex justify="space-between" align="center">
                        {x.label}
                        <Text size="sm" c="dimmed">
                          {
                            expenses.filter((e) => e.reportId === x.value)
                              .length
                          }
                        </Text>
                      </Flex>
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
                <Combobox.Footer>
                  <Button
                    mt={10}
                    variant="light"
                    fullWidth
                    loading={isLoading}
                    leftSection={<PiPlusCircle size={22} />}
                    onClick={handleCreateReport}
                  >
                    {t(Dictionary.Report.CREATE_NEW)}
                  </Button>
                </Combobox.Footer>
              </Combobox.Dropdown>
            </Combobox>
          </Box>
          <Box pos="relative">
            <Tooltip
              label={t(Dictionary.Report.EDIT)}
              withArrow
              withinPortal={false}
            >
              <Button
                variant="light"
                onClick={handleEditReport}
                loading={isLoading}
                disabled={!selectedReport}
              >
                <IconEdit size={18} />
              </Button>
            </Tooltip>
          </Box>
          <Box pos="relative">
            <Tooltip
              label={t(Dictionary.Report.DOWNLOAD)}
              withArrow
              withinPortal={false}
            >
              <Button
                variant="light"
                onClick={handleDownloadReport}
                loading={isLoading}
                disabled={!selectedReport}
              >
                <IconDownload size={18} />
              </Button>
            </Tooltip>
          </Box>
        </Flex>
      </Flex>
      <Divider mt={7} mb={12} />
      <Flex gap={10} w="100%">
        <Card
          w="75%"
          shadow="xs"
          radius="xs"
          withBorder
          padding={10}
          style={{ overflow: "visible" }}
        >
          <Flex gap="md" w="100%">
            <Flex direction="column" w="100%">
              <Flex gap="sm" mih={MIN_FLEX_HEIGHT}>
                <Select
                  w={INPUT_WIDTH}
                  {...form.getInputProps("declarantId")}
                  withAsterisk
                  data={activeUserSelectData}
                  searchable
                  label={t(Dictionary.Expense.DECLARANT)}
                  comboboxProps={{ withinPortal: false }}
                />

                <Select
                  w={INPUT_WIDTH}
                  {...form.getInputProps("projectId")}
                  withAsterisk
                  data={activeProjectSelectData}
                  label={t(Dictionary.Expense.PROJECT_NAME)}
                  comboboxProps={{ withinPortal: false }}
                />
                <DatesProvider
                  settings={{ locale: i18n.language === "en" ? "en" : "tr" }}
                >
                  <DateInput
                    w={INPUT_WIDTH}
                    {...form.getInputProps("expenseDate")}
                    withAsterisk
                    valueFormat="DD.MM.YYYY"
                    dateParser={dateParse}
                    label={t(Dictionary.Expense.DATE)}
                    maxLength={10}
                    popoverProps={{ withinPortal: false, position: "bottom" }}
                  />
                </DatesProvider>
                <Radio.Group
                  w={INPUT_WIDTH}
                  label={t(Dictionary.Expense.TYPE)}
                  withAsterisk
                  {...form.getInputProps("expenseType")}
                  display="center"
                >
                  <Group mt="xs">
                    {expenseTypes.map((x) => (
                      <Radio value={x.value} label={x.label}></Radio>
                    ))}
                  </Group>
                </Radio.Group>
              </Flex>
              <Flex gap="sm" flex={1} mih={MIN_FLEX_HEIGHT}>
                <NumberInput
                  w={INPUT_WIDTH}
                  {...form.getInputProps("totalPrice")}
                  withAsterisk
                  label={t(Dictionary.Expense.TOTAL_PRICE)}
                  hideControls
                  allowLeadingZeros={false}
                />

                <Radio.Group
                  w={INPUT_WIDTH}
                  label={t(Dictionary.Expense.CURRENCY)}
                  withAsterisk
                  {...form.getInputProps("currency")}
                  display="center"
                >
                  <Group mt="xs" gap={10}>
                    {currencyTypes.map((x) => (
                      <Radio value={x.value} label={x.label}></Radio>
                    ))}
                  </Group>
                </Radio.Group>

                <TextInput
                  w={INPUT_WIDTH}
                  {...form.getInputProps("description")}
                  label={t(Dictionary.Expense.DESCRIPTION)}
                  withAsterisk={
                    form.values.expenseType === ExpenseType.Transportation ||
                    form.values.expenseType === ExpenseType.Other
                  }
                  maxLength={128}
                />

                <Button
                  w={INPUT_WIDTH}
                  mt={25}
                  variant="light"
                  loading={isLoading}
                  onClick={() => addOvertimeMember()}
                  leftSection={<AiOutlineTeam size={22} />}
                >
                  {t(Dictionary.OvertimeMember.ADD_NEW)}
                </Button>
              </Flex>
            </Flex>
          </Flex>
          <Button
            onClick={handleSave}
            variant="light"
            loading={isLoading}
            leftSection={<PiPlusCircle size={22} />}
          >
            {t(Dictionary.Expense.ADD_NEW)}
          </Button>
        </Card>
        <Card w="25%">
          <ReceiptUploader<Expense>
            form={form}
            mapping={ocrMapping}
            onOcrComplete={ocrComplete}
            onResetComplete={() => {
              form.reset();
            }}
          />
        </Card>
      </Flex>
      <Card w="100%" mt="sm" withBorder padding="sm" flex={1}>
        <Flex gap="xs" align="center" mb="md">
          {!isSelectionMode ? (
            <Button variant="light" onClick={() => setIsSelectionMode(true)}>
              {t(Dictionary.Common.SELECT)}
            </Button>
          ) : (
            <Group gap="xs">
              <Button
                variant="light"
                onClick={() => {
                  setSelectedExpenses(filteredExpenses.map((x) => x.id));
                }}
              >
                {t(Dictionary.Common.SELECT_ALL)}
              </Button>
              <Button
                variant="light"
                style={{ color: "red", backgroundColor: "#ffeeee" }}
                onClick={openBulkDeleteModal}
                disabled={selectedExpenses.length === 0}
              >
                {t(Dictionary.Common.DELETE)}
              </Button>
              <Button
                variant="light"
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedExpenses([]);
                }}
              >
                {t(Dictionary.Common.CANCEL)}
              </Button>
            </Group>
          )}
          <TextInput
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE}></IconSearch>}
            value={searchQuery}
            flex={3}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Select
            data={activeUserSelectData}
            searchable
            placeholder={t(Dictionary.Expense.SELECT_DECLARANT)}
            clearable
            flex={1}
            onChange={(e) => setSelectedDeclarant(e)}
            comboboxProps={{ withinPortal: false }}
          />
        </Flex>
        <ScrollArea flex={1}>
          <Table
            striped
            stickyHeader
            highlightOnHover
            withTableBorder
            withColumnBorders
          >
            <Table.Thead>
              <Table.Tr>
                {isSelectionMode && <Table.Th w={40}></Table.Th>}
                <Table.Th>{t(Dictionary.Expense.DECLARANT)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.PROJECT_NAME)}</Table.Th>
                <Table.Th w={80}>{t(Dictionary.Expense.TYPE)}</Table.Th>
                <Table.Th w={100}>{t(Dictionary.Expense.DATE)}</Table.Th>
                <Table.Th w={90}>{t(Dictionary.Expense.TOTAL_PRICE)}</Table.Th>
                <Table.Th w={70}>{t(Dictionary.Expense.CURRENCY)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.DESCRIPTION)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.REPORT_NAME)}</Table.Th>
                <Table.Th w={250}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{memoizedExpenses}</Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>
    </Flex>
  );
}

export default Expenses;
