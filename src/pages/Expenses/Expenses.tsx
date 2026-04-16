import { useForm } from "@mantine/form";
import {
  ActionIcon,
  Button,
  Card,
  Checkbox,
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
  Tooltip,
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
import { DateInput } from "@mantine/dates";
import overtimeMemberSchema, {
  OvertimeMember,
} from "../../types/overtime-member.types";
import EditExpenseModal from "./components/EditExpenseModal";
import { useEffect, useMemo, useState } from "react";
import { currencyTypes, expenseTypes } from "../../constants/static-data";
import ExpenseType from "../../enums/expense-type";
import { TiTick, TiTimes } from "react-icons/ti";
import {
  BOOLEAN_ICON_SIZE,
  PAGE_FLEX_HEIGHT,
  SEARCH_ICON_SIZE,
  TITLE_DIVIDER_MY,
} from "../../constants/constants";
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
const MIN_FLEX_HEIGHT = 110;

function Expenses() {
  const { t } = useTranslation();

  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    replaceExpenses,
  } = useExpenses();

  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [activeUserSelectData, setActiveUserSelectData] = useState<
    SelectItem[]
  >([]);

  const [activeProjectSelectData, setActiveProjectSelectData] = useState<
    SelectItem[]
  >([]);

  const [reportSelectData, setReportSelectData] = useState<SelectItem[]>([]);

  const [unapprovedReportSelectData, setUnapprovedReportSelectData] = useState<
    SelectItem[]
  >([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const [showUnapprovedExpenses, setShowUnapprovedExpenses] = useState(false);

  const auth = useAuthentication();

  const form = useForm<Expense>({
    initialValues: {
      id: crypto.randomUUID(),
      userId: null,
      userFullName: "",
      projectId: null,
      projectName: "",
      expenseType: "",
      expenseDate: new Date(),
      totalPrice: 0,
      currency: null,
      tripDescription: "",
      outOfOffice: false,
      reportId: null,
      reportName: "",
      isApproved: false,
      overtimeMembers: [],
      isActive: false,
      searchText: "",
      createUserId: "",
      createUserFullName: "",
      createDate: new Date(),
    },
    validate: zod4Resolver(expenseSchema),
  });

  const overtimeMemberForm = useForm<OvertimeMember>({
    initialValues: {
      id: crypto.randomUUID(),
      userId: null,
      userFullName: "",
      expenseId: form.values.id,
      price: 0,
      createUserId: "",
      createUserFullName: "",
      createDate: new Date(),
    },
    validate: zod4Resolver(overtimeMemberSchema),
  });

  const openEditExpense = (expense: Expense) => {
    modals.open({
      title: <Title order={4}>Edit Expense</Title>,
      size: 2000,
      children: (
        <EditExpenseModal
          currentUser={auth.currentUser ? auth.currentUser : null}
          expense={expense}
          updateExpense={updateExpense}
          activeUserSelectData={activeUserSelectData}
          activeProjectSelectData={activeProjectSelectData}
          unapprovedReportSelectData={unapprovedReportSelectData}
          checkIfExpenseIsValid={checkIfExpenseIsValid}
        />
      ),
    });
  };

  const openDeleteExpenseModal = (id: string) => {
    modals.open({
      title: <Title order={5}>{t(Dictionary.Expense.DELETE_EXPENSE)}</Title>,
      size: "md",
      children: (
        <Flex direction="column" gap={20}>
          <Text>{t(Dictionary.Expense.DELETE_EXPENSE_QUESTION)}</Text>
          <Flex direction="row" gap={10}>
            <Button
              style={{ flexGrow: 1 }}
              loading={isLoading}
              onClick={() => {
                handleDelete(id);
                modals.closeAll();
              }}
              variant="light"
              color="blue"
            >
              {t(Dictionary.Expense.DELETE)}
            </Button>
            <Button
              onClick={() => modals.closeAll()}
              style={{ flexGrow: 1 }}
              variant="light"
              color="red"
            >
              {t(Dictionary.Expense.CANCEL)}
            </Button>
          </Flex>
        </Flex>
      ),
    });
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
      response.value.map((x) => ({ value: x.id, label: x.name })),
    );

    setUnapprovedReportSelectData(
      response.value
        .filter((x) => !x.isApproved)
        .map((x) => ({ value: x.id, label: x.name })),
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
      toast.error(t(Dictionary.Expense.EXPENSE_DATE_VALID));
      return false;
    }

    let totalPrice = 0;

    expense.overtimeMembers.forEach((x) => {
      totalPrice = totalPrice + x.price;
    });

    if (totalPrice > expense.totalPrice) {
      toast.error(Dictionary.Expense.EXPENSE_TOTAL_PRICE_VALID);
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

    if (!checkIfExpenseIsValid(form.values)) {
      setIsLoading(false);
      return;
    }

    if (
      form.values.overtimeMembers.some((x) => x.userId === form.values.userId)
    ) {
      toast.error(
        Dictionary.Expense.YOU_CAN_NOT_ADD_YOURSELF_AS_OVERTIME_MEMBER,
      );
      setIsLoading(false);
      return;
    }

    const expenseRequest: ExpenseRequest = {
      userId: form.values.userId ?? "",
      projectId: form.values.projectId ?? "",
      expenseType: Number(form.values.expenseType),
      expenseDate: form.values.expenseDate,
      totalPrice: form.values.totalPrice,
      currency: Number(form.values.currency),
      tripDescription: form.values.tripDescription,
      outOfOffice: form.values.outOfOffice,
      reportId: form.values.reportId ?? "",
      overtimeMembers: form.values.overtimeMembers,
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
      createUserFullName: auth.currentUser
        ? `${auth.currentUser.name} ${auth.currentUser.surname}`
        : "",
    });

    form.reset();
    overtimeMemberForm.reset();

    toast.success(Dictionary.Expense.EXPENSE_ADDED);

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

    toast.success(Dictionary.Expense.EXPENSE_DELETED);

    setIsLoading(false);
  };

  const saveOvertimeMember = async () => {
    overtimeMemberForm.validate();

    if (!overtimeMemberForm.isValid()) return;

    if (
      form.values.overtimeMembers.some(
        (x) => x.userId === overtimeMemberForm.values.userId,
      )
    ) {
      return toast.error(Dictionary.Expense.OVERTIME_MEMBER_VALID);
    }

    if (form.values.userId === overtimeMemberForm.values.userId) {
      return toast.error(
        Dictionary.Expense.YOU_CAN_NOT_ADD_YOURSELF_AS_OVERTIME_MEMBER,
      );
    }

    const overtimeMemberFullName = activeUserSelectData.find(
      (x) => x.value === overtimeMemberForm.values.userId,
    )?.label;

    const overtimeMember: OvertimeMember = {
      ...overtimeMemberForm.values,
      userFullName: overtimeMemberFullName ?? "",
      createUserFullName: auth.currentUser
        ? `${auth.currentUser.name} ${auth.currentUser.surname}`
        : "",
    };

    form.setFieldValue("overtimeMembers", [
      ...form.values.overtimeMembers,
      overtimeMember,
    ]);

    overtimeMemberForm.setFieldValue("id", crypto.randomUUID());
    overtimeMemberForm.setFieldValue("createDate", new Date());
    overtimeMemberForm.setFieldValue("userId", null);
    overtimeMemberForm.setFieldValue("price", 0);
  };

  const deleteOvertimeMember = (id: string) => {
    const overtimeMembers = form.values.overtimeMembers.filter(
      (x) => x.id !== id,
    );

    form.setFieldValue("overtimeMembers", overtimeMembers);
  };

  const memoizedExpenses = useMemo(
    () =>
      expenses
        .filter((x) => (showUnapprovedExpenses === true ? !x.isApproved : x))
        .filter((x) =>
          x.searchText.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .filter((x) => (selectedReport ? x.reportId === selectedReport : true))
        .filter((x) => (selectedUser ? x.userId === selectedUser : true))
        .filter(
          (x) => activeUserSelectData.find((y) => y.value === x.userId)?.label,
        )
        .filter(
          (x) =>
            activeProjectSelectData.find((y) => y.value === x.projectId)?.label,
        )
        .map((x: Expense) => (
          <Table.Tr key={x.id}>
            <Table.Td>{x.userFullName}</Table.Td>
            <Table.Td>{x.projectName}</Table.Td>
            <Table.Td>{expenseTypes[Number(x.expenseType)].label}</Table.Td>
            <Table.Td>{format(x.expenseDate, "dd/MM/yyyy")}</Table.Td>
            <Table.Td> {x.totalPrice} </Table.Td>
            <Table.Td>{currencyTypes[Number(x.currency)].label}</Table.Td>
            <Table.Td>
              {x.expenseType === ExpenseType.Transportation
                ? x.tripDescription
                : "-"}
            </Table.Td>
            <Table.Td>
              {x.outOfOffice ? (
                <TiTick size={BOOLEAN_ICON_SIZE} color="green" />
              ) : (
                <TiTimes size={BOOLEAN_ICON_SIZE} color="#BA1A1A" />
              )}
            </Table.Td>
            <Table.Td>{x.reportId !== null ? x.reportName : "-"}</Table.Td>
            <Table.Td> {x.createUserFullName} </Table.Td>
            <Table.Td>{format(x.createDate, "dd/MM/yyyy - HH.mm")}</Table.Td>
            <Table.Td>
              <Flex justify="center" gap={5}>
                <Tooltip label={t(Dictionary.Expense.EDIT)} withArrow>
                  <ActionIcon
                    disabled={x.isApproved}
                    onClick={() => openEditExpense(x)}
                    variant="light"
                    color="blue"
                  >
                    <IconEdit />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={t(Dictionary.Expense.DELETE)} withArrow>
                  <ActionIcon
                    disabled={x.isApproved}
                    onClick={() => openDeleteExpenseModal(x.id)}
                    variant="light"
                    color="red"
                  >
                    <IconTrash />
                  </ActionIcon>
                </Tooltip>
              </Flex>
            </Table.Td>
          </Table.Tr>
        )),
    [
      expenses,
      searchQuery,
      selectedUser,
      selectedReport,
      showUnapprovedExpenses,
    ],
  );

  const memoizedOvertimeMembers = useMemo(
    () =>
      form.values.overtimeMembers.map((x: OvertimeMember) => (
        <Table.Tr key={x.id}>
          <Table.Td>{x.userFullName}</Table.Td>
          <Table.Td>{x.price}</Table.Td>
          <Table.Td>{x.createUserFullName}</Table.Td>
          <Table.Td>{format(x.createDate, "dd/MM/yyyy - HH.mm")}</Table.Td>
          <Table.Td>
            <Flex justify="center" gap={5}>
              <ActionIcon variant="light" color="red">
                <IconTrash
                  onClick={() => deleteOvertimeMember(x.id)}
                  color="red"
                />
              </ActionIcon>
            </Flex>
          </Table.Td>
        </Table.Tr>
      )),
    [form.values.overtimeMembers],
  );

  useEffect(() => {
    getActiveUsers();
    getActiveProjects();
    getReports();
    getExpenses();
  }, []);

  return (
    <Flex direction="column" h={PAGE_FLEX_HEIGHT}>
      <Title order={3}>{t(Dictionary.Expense.EXPENSES)}</Title>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card shadow="xs" radius="xs" withBorder padding={10}>
        <Flex gap="md" justify="center">
          <Flex direction="column" w="60%" justify="center">
            <Flex gap="sm" style={{ flexGrow: 1, minHeight: MIN_FLEX_HEIGHT }}>
              <Select
                w="20%"
                {...form.getInputProps("userId")}
                withAsterisk
                data={activeUserSelectData}
                searchable
                label={t(Dictionary.Expense.USER_NAME)}
                style={{ flexGrow: 1 }}
              />

              <Select
                w="20%"
                {...form.getInputProps("projectId")}
                withAsterisk
                data={activeProjectSelectData}
                label={t(Dictionary.Expense.PROJECT_NAME)}
                style={{ flexGrow: 1 }}
              />

              <Select
                w="20%"
                {...form.getInputProps("reportId")}
                data={unapprovedReportSelectData}
                searchable
                label={t(Dictionary.Expense.REPORT_NAME)}
                clearable
                style={{ flexGrow: 1 }}
              />
            </Flex>
            <Flex gap="sm" style={{ flexGrow: 1, minHeight: MIN_FLEX_HEIGHT }}>
              <DateInput
                w="20%"
                {...form.getInputProps("expenseDate")}
                withAsterisk
                valueFormat="DD MMMM YYYY"
                label={t(Dictionary.Expense.EXPENSE_DATE)}
                style={{ flexGrow: 1 }}
              />

              <NumberInput
                w="20%"
                {...form.getInputProps("totalPrice")}
                withAsterisk
                label={t(Dictionary.Expense.TOTAL_PRICE)}
                hideControls
                style={{ flexGrow: 1 }}
              />

              <Radio.Group
                w="20%"
                label={t(Dictionary.Expense.EXPENSE_TYPE)}
                withAsterisk
                {...form.getInputProps("expenseType")}
                display="center"
                style={{ flexGrow: 1 }}
              >
                <Group mt="xs">
                  {expenseTypes.map((x) => (
                    <Radio value={x.value} label={x.label}></Radio>
                  ))}
                </Group>
              </Radio.Group>
            </Flex>
            <Flex gap="sm" style={{ flexGrow: 1, minHeight: MIN_FLEX_HEIGHT }}>
              <TextInput
                w="20%"
                {...form.getInputProps("tripDescription")}
                label={t(Dictionary.Expense.TRIP_DESCRIPTION)}
                withAsterisk={
                  form.values.expenseType === ExpenseType.Transportation
                }
                disabled={form.values.expenseType === ExpenseType.Food}
                style={{ flexGrow: 1 }}
              />
              <Select
                w="20%"
                {...form.getInputProps("currency")}
                withAsterisk
                data={currencyTypes}
                label={t(Dictionary.Expense.CURRENCY)}
                style={{ flexGrow: 1 }}
              />

              <Checkbox
                w="20%"
                mt={30}
                label={t(Dictionary.Expense.OUT_OF_OFFICE)}
                {...form.getInputProps("outOfOffice", { type: "checkbox" })}
                style={{ flexGrow: 1 }}
              />
            </Flex>
          </Flex>
          <Flex w="40%" justify="center" h="320px">
            <Card shadow="xs" radius="md" withBorder padding={10} w="100%">
              <Flex gap="sm" style={{ minHeight: 90 }}>
                <Select
                  {...overtimeMemberForm.getInputProps("userId")}
                  withAsterisk
                  data={activeUserSelectData}
                  searchable
                  label={t(Dictionary.Expense.USER_NAME)}
                  style={{ flexGrow: 1 }}
                />

                <NumberInput
                  {...overtimeMemberForm.getInputProps("price")}
                  withAsterisk
                  label={t(Dictionary.Expense.PRICE)}
                  hideControls
                  style={{ flexGrow: 1 }}
                />

                <Button onClick={saveOvertimeMember} variant="light" mt={25}>
                  {t(Dictionary.Expense.ADD_OVERTIME_MEMBER)}
                </Button>
              </Flex>
              <ScrollArea style={{ flex: 1 }}>
                <Table
                  striped
                  stickyHeader
                  highlightOnHover
                  withTableBorder
                  withColumnBorders
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t(Dictionary.Expense.USER_NAME)}</Table.Th>
                      <Table.Th>{t(Dictionary.Expense.PRICE)}</Table.Th>
                      <Table.Th>{t(Dictionary.Expense.CREATE_USER)}</Table.Th>
                      <Table.Th>{t(Dictionary.Expense.CREATE_DATE)}</Table.Th>
                      <Table.Th></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{memoizedOvertimeMembers}</Table.Tbody>
                </Table>
              </ScrollArea>
            </Card>
          </Flex>
        </Flex>
        <Button
          onClick={handleSave}
          variant="light"
          mt={10}
          loading={isLoading}
        >
          {t(Dictionary.Expense.ADD_NEW_EXPENSE)}
        </Button>
      </Card>
      <Card
        mt="sm"
        withBorder
        padding="sm"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Flex gap="xs" align="center" mb="md">
          <TextInput
            size="xs"
            radius="xl"
            rightSection={<IconSearch size={SEARCH_ICON_SIZE}></IconSearch>}
            style={{ flexGrow: 120 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Select
            data={activeUserSelectData}
            searchable
            placeholder={t(Dictionary.Expense.SELECT_USER)}
            style={{ flexGrow: 1 }}
            clearable
            onChange={(e) => setSelectedUser(e)}
          />
          <Select
            data={reportSelectData}
            searchable
            placeholder={t(Dictionary.Expense.SELECT_REPORT)}
            style={{ flexGrow: 1 }}
            clearable
            onChange={(e) => setSelectedReport(e)}
          />
          <Checkbox
            labelPosition="left"
            label={t(Dictionary.Expense.SHOW_UNAPPROVED_EXPENSES)}
            style={{ marginLeft: "10px" }}
            checked={showUnapprovedExpenses}
            onChange={() => setShowUnapprovedExpenses(!showUnapprovedExpenses)}
            type="checkbox"
          />
        </Flex>
        <ScrollArea style={{ flex: 1 }}>
          <Table
            striped
            stickyHeader
            highlightOnHover
            withTableBorder
            withColumnBorders
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t(Dictionary.Expense.USER_NAME)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.PROJECT_NAME)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.EXPENSE_TYPE)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.EXPENSE_DATE)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.TOTAL_PRICE)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.CURRENCY)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.TRIP_DESCRIPTION)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.OUT_OF_OFFICE)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.REPORT_NAME)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.CREATE_USER)}</Table.Th>
                <Table.Th>{t(Dictionary.Expense.CREATE_DATE)}</Table.Th>
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
