import { useForm } from "@mantine/form";
import reportSchema, { Report, ReportRequest } from "../../types/report.types";
import { Team } from "../../types/team.types";
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
  Group,
  Radio,
  Select,
  Autocomplete,
} from "@mantine/core";
import {
  IconDownload,
  IconEdit,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { format, subDays } from "date-fns";
import toast from "react-hot-toast";
import { modals } from "@mantine/modals";
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
import { currencyTypes, expenseTypes } from "../../constants/static-data";
import ExpenseType from "../../enums/expense-type";
import CurrencyType from "../../enums/currency-type";
import { formatIban } from "../../helpers/IbanFormatter";
import { User } from "../../types/user.types";
import { Project } from "../../types/project.types";
import EditReportModal from "./components/EditReportModal";
import Role from "../../enums/role";

const TEXT_INPUT_MIN_HEIGHT = 85;

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

  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  const [selectedDeclarant, setSelectedDeclarant] = useState<string | null>(
    null,
  );

  const [projectSelectData, setProjectSelectData] = useState<string[]>([]);

  const [teams, setTeams] = useState<Team[]>([]);

  const [expandedReportIds, setExpandedReportIds] = useState<string[]>([]);

  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);

  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  const toggleRow = (id: string) => {
    setExpandedReportIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const form = useForm<Report>({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      isAbroad: false,
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
      size: "60%",
      yOffset: 20,
      styles: { content: { minHeight: 930 } },
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
          namePlaceholder={namePlaceholder}
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
        declarant: x.declarant ? x.declarant : null,
        departmentManager: x.departmentManager ? x.departmentManager : null,
        departmentHead: x.departmentHead ? x.departmentHead : null,
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

  const travelPlaceSelectData = useMemo(() => {
    return [
      ...new Map(
        reports.map((report) => [
          report.travelPlace,
          { value: report.id, label: report.travelPlace },
        ]),
      ).values(),
    ];
  }, [reports]);

  const { activeUserSelectData, managerSelectData } = useMemo(() => {
    const activeUserSelectData = activeUsers.map((user) => ({
      value: user.id,
      label: `${user.name} ${user.surname}`,
    }));

    const managerSelectData = activeUsers
      .filter((user) => user.role.toString() === Role.Admin)
      .map((user) => ({
        value: user.id,
        label: `${user.name} ${user.surname}`,
      }));

    return {
      activeUserSelectData,
      managerSelectData,
    };
  }, [activeUsers]);

  const filteredCurrency = currencyTypes.filter(
    (x) =>
      x.value !== CurrencyType.MacedonianDenar &&
      x.value !== CurrencyType.MalaysianRinggit,
  );

  const handleCurrencyDeselect = (
    field: keyof typeof form.values,
    selectItem: { value: CurrencyType; label: string },
  ) => {
    if (form.values[field] === selectItem.value) {
      form.setFieldValue(field, null);
    }
  };

  const handleDeclarantChange = (value: string | null) => {
    const declarant = value ?? "";

    const selectedUser = activeUsers.find((x) => x.id === declarant);
    const selectedTeam = selectedUser?.teamId
      ? teams.find((x) => x.id === selectedUser.teamId)
      : null;

    form.setValues({
      declarant,
      title: selectedUser?.title ?? "",
      tlIban: selectedUser?.iban ? formatIban(selectedUser.iban) : "",
      department: selectedTeam?.department ?? "",
      departmentManager: selectedTeam?.departmentManager ?? "",
      departmentHead: selectedTeam?.departmentHead ?? "",
    });
  };

  const handleBulkDelete = async () => {
    setIsLoading(true);

    const response = await handleDataRequest<string[], never>(
      urls.reportBulkDelete,
      RequestType.Post,
      selectedReports,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    selectedReports.forEach((id) => deleteReport(id));
    setSelectedReports([]);
    setIsSelectionMode(false);

    toast.success(t(Dictionary.Report.DELETED));

    setIsLoading(false);
  };

  const openBulkDeleteModal = () => {
    if (selectedReports.length === 0) return;
    modals.open({
      title: <Title order={5}>{t(Dictionary.Report.DELETE)}</Title>,
      size: "md",
      children: (
        <Flex direction="column" gap={20}>
          <Text>
            {t(Dictionary.Report.BULK_DELETE, {
              selectedReports: selectedReports.length,
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

  const toggleReportSelection = (id: string) => {
    setSelectedReports((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const getProjects = async () => {
    const response = await handleDataRequest<never, Project[]>(
      urls.project,
      RequestType.Get,
    );

    if (!response.isSuccess) return;

    setProjectSelectData(
      response.value.filter((x) => x.isActive).map((x) => x.name),
    );
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
  };

  const getReportsTeams = async () => {
    const response = await handleDataRequest<never, Team[]>(
      urls.team,
      RequestType.Get,
    );
    if (!response.isSuccess) return;
    setTeams(response.value);
  };

  const filteredReports = useMemo(() => {
    return reports
      .filter((x) => (showAbroadReports === true ? x.isAbroad : x))
      .filter((x) =>
        x.searchText.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .filter((x) =>
        selectedDeclarant ? x.declarant === selectedDeclarant : x,
      );
  }, [reports, showAbroadReports, searchQuery, selectedDeclarant]);

  const memoizedReports = useMemo(
    () =>
      filteredReports.map((x: Report) => {
        const isExpanded = expandedReportIds.includes(x.id);
        const reportExpenses = expenses.filter((e) => e.reportId === x.id);

        const declarantUser = activeUsers.find((u) => u.id === x.declarant);
        const declarantName = declarantUser
          ? `${declarantUser.name} ${declarantUser.surname}`
          : "-";

        return (
          <Fragment key={x.id}>
            <Table.Tr onClick={() => toggleRow(x.id)}>
              {isSelectionMode && (
                <Table.Td onClick={(e) => e.stopPropagation()} w={50}>
                  <Checkbox
                    radius="xl"
                    checked={selectedReports.includes(x.id)}
                    onChange={() => toggleReportSelection(x.id)}
                  />
                </Table.Td>
              )}
              <Table.Td>
                <Flex justify="space-between" align="center">
                  {x.name}
                  <Text size="sm" c="dimmed">
                    {reportExpenses.length}
                  </Text>
                </Flex>
              </Table.Td>
              <Table.Td>{declarantName}</Table.Td>
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
                    loading={isLoading}
                    leftSection={<IconEdit size={16} />}
                  >
                    {t(Dictionary.Common.EDIT)}
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => openDeleteReportModal(x.id)}
                    variant="light"
                    leftSection={<IconTrash size={16} />}
                    loading={isLoading}
                    style={{ color: "red", backgroundColor: "#ffeeee" }}
                  >
                    {t(Dictionary.Common.DELETE)}
                  </Button>
                </Flex>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td colSpan={isSelectionMode ? 5 : 4} p={0}>
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
                              <Table.Td w={200}>
                                {expenseTypes[Number(e.expenseType)]?.label}
                              </Table.Td>
                              <Table.Td w={200}>
                                {format(new Date(e.expenseDate), "dd/MM/yyyy")}
                              </Table.Td>
                              <Table.Td w={200}>{e.totalPrice}</Table.Td>
                              <Table.Td w={200}>
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
      filteredReports,
      isLoading,
      expandedReportIds,
      expenses,
      activeUsers,
      isSelectionMode,
      selectedReports,
    ],
  );

  useEffect(() => {
    getReports();
    getExpenses();
    getProjects();
    getActiveUsers();
    getReportsTeams();
  }, []);

  return (
    <Flex direction="column" h={PAGE_FLEX_HEIGHT}>
      <Title order={3}>{t(Dictionary.Common.REPORTS)}</Title>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card shadow="xs" radius="md" withBorder>
        <Flex direction="column" mih={TEXT_INPUT_MIN_HEIGHT}>
          <Flex gap={20}>
            <Flex gap={10} flex={1} align="center">
              <TextInput
                label={t(Dictionary.Report.NAME)}
                flex={2}
                mih={TEXT_INPUT_MIN_HEIGHT}
                withAsterisk
                placeholder={namePlaceholder}
                {...form.getInputProps("name")}
              />
              <Checkbox
                {...form.getInputProps("isAbroad", { type: "checkbox" })}
                labelPosition="left"
                label={t(Dictionary.Report.ABROAD)}
              />
            </Flex>
            <Autocomplete
              label={t(Dictionary.Report.TRAVEL_PLACE)}
              flex={1}
              mih={TEXT_INPUT_MIN_HEIGHT}
              {...form.getInputProps("travelPlace")}
              data={travelPlaceSelectData}
              comboboxProps={{ withinPortal: false }}
            />
            <Flex gap={20} flex={1} align="center">
              <TextInput
                label={t(Dictionary.Report.ADVANCE_RECEIVED_AMOUNT)}
                flex={1}
                mih={TEXT_INPUT_MIN_HEIGHT}
                {...form.getInputProps("advanceReceivedAmount")}
              />
              <Radio.Group
                {...form.getInputProps("advanceReceivedAmountCurrency")}
              >
                <Group>
                  {filteredCurrency.map((x) => (
                    <Radio
                      value={x.value}
                      label={x.label}
                      onClick={() =>
                        handleCurrencyDeselect(
                          "advanceReceivedAmountCurrency",
                          x,
                        )
                      }
                    ></Radio>
                  ))}
                </Group>
              </Radio.Group>
            </Flex>
            <Autocomplete
              {...form.getInputProps("departmentManager")}
              mih={TEXT_INPUT_MIN_HEIGHT}
              data={managerSelectData}
              flex={1}
              clearable
              label={t(Dictionary.Team.DEPARTMENT_MANAGER)}
              comboboxProps={{ withinPortal: false }}
            />
          </Flex>
          <Flex gap={20}>
            <Select
              {...form.getInputProps("declarant")}
              value={form.values.declarant || null}
              mih={TEXT_INPUT_MIN_HEIGHT}
              data={activeUserSelectData}
              flex={1}
              searchable
              clearable
              label={t(Dictionary.Report.DECLARANT)}
              comboboxProps={{ withinPortal: false }}
              onChange={handleDeclarantChange}
            />
            <Autocomplete
              label={t(Dictionary.Report.PURPOSE_OF_TRAVEL)}
              flex={1}
              mih={TEXT_INPUT_MIN_HEIGHT}
              data={projectSelectData}
              clearable
              comboboxProps={{ withinPortal: false }}
              placeholder={t(Dictionary.Report.PURPOSE_OF_TRAVEL_PLACEHOLDER)}
              {...form.getInputProps("purposeOfTravel")}
            />
            <Flex gap={20} flex={1} align="center">
              <TextInput
                label={t(Dictionary.Report.AMOUNT_TO_BE_REFUNDED)}
                mih={TEXT_INPUT_MIN_HEIGHT}
                flex={1}
                {...form.getInputProps("amountToBeRefunded")}
              />
              <Radio.Group
                {...form.getInputProps("amountToBeRefundedCurrency")}
              >
                <Group>
                  {filteredCurrency.map((x) => (
                    <Radio
                      value={x.value}
                      label={x.label}
                      onClick={() =>
                        handleCurrencyDeselect("amountToBeRefundedCurrency", x)
                      }
                    ></Radio>
                  ))}
                </Group>
              </Radio.Group>
            </Flex>
            <Autocomplete
              {...form.getInputProps("departmentHead")}
              mih={TEXT_INPUT_MIN_HEIGHT}
              data={managerSelectData}
              flex={1}
              clearable
              label={t(Dictionary.Team.DEPARTMENT_HEAD)}
              comboboxProps={{ withinPortal: false }}
            />
          </Flex>
          <Flex gap={20}>
            <TextInput
              label={t(Dictionary.Report.TITLE)}
              flex={1}
              mih={TEXT_INPUT_MIN_HEIGHT}
              {...form.getInputProps("title")}
            />
            <TextInput
              label={t(Dictionary.Report.DEPARTURE_AND_RETURN_DATES)}
              flex={1}
              mih={TEXT_INPUT_MIN_HEIGHT}
              placeholder={`${format(subDays(new Date(), 10), "dd.MM.yyyy")} - ${format(new Date(), "dd.MM.yyyy")}`}
              maxLength={21}
              {...form.getInputProps("departureAndReturnDates")}
            />
            <Flex gap={20} flex={1} align="center">
              <TextInput
                label={t(Dictionary.Report.AMOUNT_TO_BE_PAID)}
                flex={1}
                mih={TEXT_INPUT_MIN_HEIGHT}
                {...form.getInputProps("amountToBePaid")}
              />
              <Radio.Group {...form.getInputProps("amountToBePaidCurrency")}>
                <Group>
                  {filteredCurrency.map((x) => (
                    <Radio
                      value={x.value}
                      label={x.label}
                      onClick={() =>
                        handleCurrencyDeselect("amountToBePaidCurrency", x)
                      }
                    ></Radio>
                  ))}
                </Group>
              </Radio.Group>
            </Flex>
            <TextInput
              label={t(Dictionary.Report.TL_IBAN)}
              mih={TEXT_INPUT_MIN_HEIGHT}
              flex={1}
              {...form.getInputProps("tlIban")}
              onChange={(e) =>
                form.setFieldValue("tlIban", formatIban(e.currentTarget.value))
              }
            />
          </Flex>
          <Flex gap={20}>
            <TextInput
              label={t(Dictionary.Team.DEPARTMENT)}
              flex={1}
              mih={TEXT_INPUT_MIN_HEIGHT}
              {...form.getInputProps("department")}
            />
            <TextInput
              label={t(Dictionary.Report.REQUESTED_ADVANCE_AMOUNT)}
              flex={1}
              mih={TEXT_INPUT_MIN_HEIGHT}
              {...form.getInputProps("requestedAdvanceAmount")}
            />
            <TextInput
              label={t(Dictionary.Report.FINANCE_OFFICER)}
              flex={1}
              mih={TEXT_INPUT_MIN_HEIGHT}
              {...form.getInputProps("financeOfficer")}
            />
            <TextInput
              label={t(Dictionary.Report.EUR_IBAN)}
              mih={TEXT_INPUT_MIN_HEIGHT}
              flex={1}
              {...form.getInputProps("eurIban")}
              onChange={(e) =>
                form.setFieldValue("eurIban", formatIban(e.currentTarget.value))
              }
            />
          </Flex>
          <Button
            variant="light"
            loading={isLoading}
            onClick={handleSave}
            leftSection={<PiPlusCircle size={22} />}
          >
            {t(Dictionary.Report.CREATE_NEW)}
          </Button>
        </Flex>
      </Card>
      <Card mt="sm" radius="md" withBorder padding="sm" flex={1}>
        <Flex gap="xs" mb="md" align="center">
          <TextInput
            size="xs"
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE}></IconSearch>}
            flex={5}
            {...form.getInputProps("searchText")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Select
            comboboxProps={{ withinPortal: false }}
            data={activeUserSelectData}
            value={selectedDeclarant}
            onChange={setSelectedDeclarant}
            placeholder={t(Dictionary.Report.SELECT_DECLARANT)}
            clearable
            searchable
            flex={1}
          />
          <Checkbox
            ml="10px"
            labelPosition="left"
            label={t(Dictionary.Report.SHOW_ABROAD)}
            checked={showAbroadReports}
            onChange={() => setShowAbroadReports(!showAbroadReports)}
            type="checkbox"
          />
          {!isSelectionMode ? (
            <Button variant="light" onClick={() => setIsSelectionMode(true)}>
              {t(Dictionary.Common.SELECT)}
            </Button>
          ) : (
            <Group gap="xs">
              <Button
                variant="light"
                onClick={() => {
                  setSelectedReports(filteredReports.map((x) => x.id));
                }}
              >
                {t(Dictionary.Common.SELECT_ALL)}
              </Button>
              <Button
                variant="light"
                style={{ color: "red", backgroundColor: "#ffeeee" }}
                onClick={openBulkDeleteModal}
                disabled={selectedReports.length === 0}
              >
                {t(Dictionary.Common.DELETE)}
              </Button>
              <Button
                variant="light"
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedReports([]);
                }}
              >
                {t(Dictionary.Common.CANCEL)}
              </Button>
            </Group>
          )}
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
                {isSelectionMode && <Table.Th w={50}></Table.Th>}
                <Table.Th>{t(Dictionary.Report.NAME)}</Table.Th>
                <Table.Th w={500}>{t(Dictionary.Report.DECLARANT)}</Table.Th>
                <Table.Th w={200}>{t(Dictionary.Report.ABROAD)}</Table.Th>
                <Table.Th w={400}></Table.Th>
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
