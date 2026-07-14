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
} from "@mantine/core";
import { modals } from "@mantine/modals";
import expenseSchema, {
  Expense,
  ExpenseRequest,
  ExpenseResponse,
} from "../../types/expense.types";
import useExpenses from "./hooks/useExpenses";
import { IconEdit, IconSearch, IconTrash } from "@tabler/icons-react";
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
import { Report, ReportRequest } from "../../types/report.types";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider";
import { useTranslation } from "react-i18next";
import Dictionary from "../../helpers/translation/dictionary";
import { OcrResult } from "../../types/ocr.types";
import { PiPlusCircle } from "react-icons/pi";
import ReceiptUploader from "../../components/ReceiptUploader/ReceiptUploader";
import normalizeText from "../../helpers/NormalizeText";
import { FaPlaneDeparture } from "react-icons/fa";
import CreateAbroadReportModal from "../Reports/components/CreateAbroadReportModal";
import useReports from "../../hooks/useReports";
import i18n from "../../helpers/translation/i18n";

const INPUT_WIDTH = "25%";
const MIN_FLEX_HEIGHT = 120;
const foodSelectorKeywords = ["yiyecek", "icecek", "KDV", "kdv"];
const tripSelectorKeywords = [
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
  const { t } = useTranslation();

  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    replaceExpenses,
  } = useExpenses();

  const { addReport } = useReports();

  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [activeUserSelectData, setActiveUserSelectData] = useState<
    SelectItem[]
  >([]);

  const [activeProjectSelectData, setActiveProjectSelectData] = useState<
    SelectItem[]
  >([]);

  const [reportSelectData, setReportSelectData] = useState<SelectItem[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const [newReportName, setNewReportName] = useState("");

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
      expenseDate: new Date(),
      totalPrice: 0,
      currency: null,
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

  const openCreateAbroadReportModal = () => {
    modals.open({
      title: <Title order={4}>{t(Dictionary.Report.ABROAD)}</Title>,
      size: "60%",
      returnFocus: false,
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

    setReportSelectData(
      response.value.map((x) => ({
        value: x.id,
        label: x.name,
      })),
    );
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
    if (expense.expenseDate > new Date()) {
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
      toast.error(t(Dictionary.Report.SELECT));
      setIsLoading(false);
      return;
    }

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

    form.reset();

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
  const addOvertimeMember = () => {
    modals.open({
      title: <Title order={5}>{t(Dictionary.OvertimeMember.ADD_NEW)}</Title>,
      size: "xl",
      children: (
        <AddOvertimeMemberModal
          expenseForm={form}
          activeUserSelectData={activeUserSelectData}
          currentUser={auth.currentUser}
        />
      ),
    });
  };

  const createNewReport = async (value: string) => {
    setIsLoading(true);

    if (!value) {
      toast.error(t(Dictionary.Report.NAME_MIN_LENGTH));
      setIsLoading(false);
      return;
    }

    const request: ReportRequest = {
      name: value.trim(),
      isAbroad: false,
      title: null,
      department: null,
      requestedAdvanceAmount: null,
      travelPlace: null,
      departureAndReturnDates: null,
      purposeOfTravel: null,
      advanceReceivedAmount: null,
      advanceReceivedAmountCurrency: null,
      amountToBeRefunded: null,
      amountToBeRefundedCurrency: null,
      amountToBePaid: null,
      amountToBePaidCurrency: null,
      declarant: null,
      departmentManager: null,
      departmentHead: null,
      financeOfficer: null,
      tlIban: null,
      eurIban: null,
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

    setSelectedReport(response.value.id);
    setNewReportName(response.value.name);

    const newReport = {
      label: response.value.name,
      value: response.value.id,
    };

    setReportSelectData([...reportSelectData, newReport]);

    combobox.closeDropdown();

    toast.success(t(Dictionary.Report.CREATED));

    setIsLoading(false);
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

    if (tripSelectorKeywords.some((x) => text.includes(x))) {
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

  const memoizedExpenses = useMemo(
    () =>
      expenses
        .filter((x) =>
          x.searchText.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .filter((x) => (selectedReport ? x.reportId === selectedReport : true))
        .filter((x) => (selectedUser ? x.declarantId === selectedUser : true))
        .filter(
          (x) =>
            activeUserSelectData.find((y) => y.value === x.declarantId)?.label,
        )
        .filter(
          (x) =>
            activeProjectSelectData.find((y) => y.value === x.projectId)?.label,
        )
        .map((x: Expense) => (
          <Table.Tr key={x.id}>
            <Table.Td>{x.declarantFullName}</Table.Td>
            <Table.Td>{x.projectName}</Table.Td>
            <Table.Td>{expenseTypes[Number(x.expenseType)].label}</Table.Td>
            <Table.Td>{format(x.expenseDate, "dd/MM/yyyy")}</Table.Td>
            <Table.Td> {x.totalPrice} </Table.Td>
            <Table.Td>{currencyTypes[Number(x.currency)].label}</Table.Td>
            <Table.Td>
              {x.expenseType !== ExpenseType.Food ? x.description : "-"}
            </Table.Td>

            <Table.Td>{x.reportName}</Table.Td>
            <Table.Td> {x.createUserFullName} </Table.Td>
            <Table.Td>{format(x.createDate, "dd/MM/yyyy - HH.mm")}</Table.Td>
            <Table.Td>
              <Flex justify="center" gap={5}>
                <Button
                  onClick={() => openEditExpense(x)}
                  variant="light"
                  radius={5}
                  leftSection={<IconEdit size={18} />}
                >
                  {t(Dictionary.Common.EDIT)}
                </Button>
                <Button
                  onClick={() => openDeleteExpenseModal(x.id)}
                  variant="light"
                  radius={5}
                  style={{ color: "red", backgroundColor: "#ffeeee" }}
                  leftSection={<IconTrash size={18} />}
                >
                  {t(Dictionary.Common.DELETE)}
                </Button>
              </Flex>
            </Table.Td>
          </Table.Tr>
        )),
    [
      expenses,
      searchQuery,
      selectedUser,
      selectedReport,
      activeUserSelectData,
      activeProjectSelectData,
    ],
  );

  const ocrMapping = useMemo(
    () => ({
      date: "expenseDate" as keyof Expense,
    }),
    [],
  );

  const handleReportSelect = (value: string) => {
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
    setNewReportName(event.currentTarget.value);
    setSearchQuery(event.currentTarget.value);
    setSelectedReport(null);
    combobox.openDropdown();
  };

  const handleOpenReportDropdown = () => {
    combobox.openDropdown();
  };

  const handleCreateAbroadReport = () => {
    openCreateAbroadReportModal();
    combobox.closeDropdown();
  };

  const clearDescriptionIfFoodExpense = () => {
    if (form.values.expenseType === ExpenseType.Food) {
      form.setFieldValue("description", "");
    }
  };

  useEffect(() => {
    clearDescriptionIfFoodExpense();
  }, [form.values.expenseType]);

  useEffect(() => {
    getActiveUsers();
    getActiveProjects();
    getReports();
    getExpenses();
  }, []);

  return (
    <Flex direction="column" h={PAGE_FLEX_HEIGHT} w="100%">
      <Flex justify="space-between" align="center" gap={10}>
        <Title order={3} mb={5}>
          {t(Dictionary.Common.EXPENSES)}
        </Title>
        <Box w={INPUT_WIDTH} pos="relative">
          <Combobox
            store={combobox}
            onOptionSubmit={handleReportSelect}
            withinPortal={false}
          >
            <Combobox.Target>
              <InputBase
                w="100%"
                value={newReportName}
                rightSection={<Combobox.Chevron />}
                onClick={handleOpenReportDropdown}
                onFocus={handleOpenReportDropdown}
                placeholder={t(Dictionary.Report.SELECT)}
                onChange={handleReportNameChange}
              ></InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
              <Combobox.Options>
                <Combobox.Option value="all">
                  {t(Dictionary.Common.ALL)}
                </Combobox.Option>
                {filteredReportSelectData.map((x) => (
                  <Combobox.Option key={x.value} value={x.value}>
                    {x.label}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
              <Combobox.Footer>
                <Button
                  mt={3}
                  variant="light"
                  fullWidth
                  leftSection={<PiPlusCircle size={22} />}
                  onClick={() => createNewReport(newReportName)}
                >
                  {t(Dictionary.Report.CREATE_NEW)}
                </Button>
                <Button
                  mt={10}
                  variant="light"
                  fullWidth
                  leftSection={<FaPlaneDeparture />}
                  onClick={handleCreateAbroadReport}
                >
                  {t(Dictionary.AbroadReport.CREATE)}
                </Button>
              </Combobox.Footer>
            </Combobox.Dropdown>
          </Combobox>
        </Box>
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
                    valueFormat="DD MMMM YYYY"
                    label={t(Dictionary.Expense.DATE)}
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
                  disabled={form.values.expenseType === ExpenseType.Food}
                />

                <Button
                  w={INPUT_WIDTH}
                  mt={25}
                  variant="light"
                  onClick={() => addOvertimeMember()}
                  leftSection={<PiPlusCircle size={22} />}
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
          <TextInput
            size="xs"
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE}></IconSearch>}
            value={searchQuery}
            flex={3}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Select
            data={activeUserSelectData}
            searchable
            placeholder={t(Dictionary.Expense.SELECT_USER)}
            clearable
            flex={1}
            onChange={(e) => setSelectedUser(e)}
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
                <Table.Th>{t(Dictionary.Expense.DECLARANT)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.PROJECT_NAME)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.TYPE)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.DATE)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.TOTAL_PRICE)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.CURRENCY)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.DESCRIPTION)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.REPORT_NAME)}</Table.Th>
                <Table.Th>{t(Dictionary.Common.CREATE_USER)}</Table.Th>
                <Table.Th>{t(Dictionary.Common.CREATE_DATE)}</Table.Th>
                <Table.Th></Table.Th>
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
