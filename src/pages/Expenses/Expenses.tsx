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
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { Expense } from "../../types/expense";
import useExpenses from "./hooks/useExpenses";
import { IconEdit, IconSearch, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { DateInput } from "@mantine/dates";
import { OvertimeMember } from "../../types/overtime-member";
import EditExpenseModal from "./components/EditExpenseModal";
import { useMemo, useState } from "react";
import useProjects from "../../hooks/useProjects";
import { currencyTypes, expenseTypes } from "../../constants/static-data";
import useUsers from "../../hooks/useUsers";
import useReports from "../../hooks/useReports";
import ExpenseType from "../../enums/expense-type";
import { TiTick, TiTimes } from "react-icons/ti";
import {
  BOOLEAN_ICON_SIZE,
  SEARCH_ICON_SIZE,
  TITLE_DIVIDER_MY,
} from "../../constants/constants";

function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();

  const { userSelectData, activeUserSelectData } = useUsers({
    hasValueLabel: true,
    hasActiveUserValueLabel: true,
  });
  const { projectSelectData, activeProjectSelectData } = useProjects({
    hasValueLabel: true,
    hasActiveProjectValueLabel: true,
  });
  const { reportSelectData, approvedReportSelectData } = useReports({
    hasValueLabel: true,
    hasApprovedReportValueLabel: true,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const [showUnapprovedExpenses, setShowUnapprovedExpenses] = useState(false);

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
      createUser: crypto.randomUUID(),
      createDate: new Date(),
    },
    validate: {
      userId: (value) => (!value ? "User must be selected." : undefined),
      projectId: (value) => (!value ? "Project must be selected." : undefined),
      expenseType: (value) =>
        !value ? "Expense type must be selected." : undefined,
      expenseDate: (value) =>
        !value ? "Expense date must be selected." : undefined,
      totalPrice: (value) =>
        !value
          ? "Total price cannot be empty."
          : value < 0 || value === 0
            ? "Total price cannot be 0 or less."
            : undefined,
      currency: (value) => (!value ? "Currency must be selected." : undefined),
      tripDescription: (value, values) =>
        values.expenseType === ExpenseType.Transportation &&
        value.trim().length === 0
          ? "Trip description cannot be empty."
          : value.length > 256
            ? "Trip description cannot exceed 256 characters."
            : undefined,
      outOfOffice: (value) =>
        value === null ? "Out of office cannot be empty." : undefined,
    },
  });

  const overtimeMemberForm = useForm<OvertimeMember>({
    initialValues: {
      id: crypto.randomUUID(),
      userId: null,
      userFullName: "",
      expenseId: form.values.id,
      price: 0,
      createUser: crypto.randomUUID(),
      createDate: new Date(),
    },
    validate: {
      userId: (value) => (!value ? "User must be selected." : undefined),
      price: (value) =>
        !value
          ? "Price cannot be empty."
          : value < 0 || value === 0
            ? "Price cannot be 0 or less."
            : undefined,
    },
  });

  const openEditExpense = (expense: Expense) => {
    modals.open({
      title: <Title order={4}>Edit Expense</Title>,
      size: 2000,
      children: (
        <EditExpenseModal expense={expense} updateExpense={updateExpense} />
      ),
    });
  };

  const openDeleteExpenseModal = (id: string) => {
    modals.open({
      title: <Title order={5}>Delete Expense</Title>,
      size: "md",
      children: (
        <Flex direction={"column"} gap={20}>
          <Text>Are you sure you want to delete the expense?</Text>
          <Flex direction={"row"} gap={10}>
            <Button
              style={{ flexGrow: 1 }}
              onClick={() => {
                deleteExpense(id);
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

  const deleteOvertimeMember = (id: string) => {
    const overtimeMembers = form.values.overtimeMembers.filter(
      (x) => x.id !== id
    );

    form.setFieldValue("overtimeMembers", overtimeMembers);
  };

  const saveOvertimeMember = async () => {
    overtimeMemberForm.validate();

    if (!overtimeMemberForm.isValid()) return;

    overtimeMemberForm.values.id = crypto.randomUUID();
    overtimeMemberForm.values.createDate = new Date();

    if (
      form.values.overtimeMembers.some(
        (x) => x.userId === overtimeMemberForm.values.userId
      )
    ) {
      return toast.error("There is a entry for this user.");
    }

    form.setFieldValue("overtimeMembers", [
      ...form.values.overtimeMembers,
      {
        ...overtimeMemberForm.values,
        userFullName: overtimeMemberForm.values.userId
          ? userSelectData.find(
              (y) => y.value === overtimeMemberForm.values.userId
            )!.label
          : "",
      },
    ]);

    overtimeMemberForm.reset();
  };

  const handleSave = async () => {
    form.validate();

    if (!form.isValid()) return;

    if (form.values.expenseDate > new Date()) {
      toast.error("Expenses cannot be entered for future dates.");
      return;
    }

    const retVal = await addExpense({
      ...form.values,
      userFullName: form.values.userId
        ? userSelectData.find((y) => y.value === form.values.userId)!.label
        : "",
      projectName: form.values.projectId
        ? projectSelectData.find((y) => y.value === form.values.projectId)!
            .label
        : "",
      reportName: form.values.reportId
        ? reportSelectData.find((y) => y.value === form.values.reportId)!.label
        : "-",
    });

    if (retVal) {
      form.reset();
      overtimeMemberForm.reset();
      toast.success("Expense has been added successfully!");
    }
  };

  const memoizedExpenses = useMemo(
    () =>
      expenses
        .filter((x) => (showUnapprovedExpenses === true ? !x.isApproved : x))
        .filter((x) =>
          x.searchText.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter((x) => (selectedReport ? x.reportId === selectedReport : true))
        .filter((x) => (selectedUser ? x.userId === selectedUser : true))
        .filter(
          (x) => activeUserSelectData.find((y) => y.value === x.userId)?.label
        )
        .filter(
          (x) =>
            activeProjectSelectData.find((y) => y.value === x.projectId)?.label
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
            <Table.Td>{x.reportName ? x.reportName : "-"}</Table.Td>
            <Table.Td> {x.createUser} </Table.Td>
            <Table.Td>{format(x.createDate, "dd/MM/yyyy - HH.mm")}</Table.Td>
            <Table.Td>
              <Flex justify={"center"} gap={5}>
                <ActionIcon
                  disabled={x.isApproved}
                  onClick={() => openEditExpense(x)}
                  variant={"light"}
                  color={"blue"}
                >
                  <IconEdit />
                </ActionIcon>
                <ActionIcon
                  disabled={x.isApproved}
                  onClick={() => openDeleteExpenseModal(x.id)}
                  variant={"light"}
                  color={"red"}
                >
                  <IconTrash />
                </ActionIcon>
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
    ]
  );

  const memoizedOvertimeMembers = useMemo(
    () =>
      form.values.overtimeMembers.map((x: OvertimeMember) => (
        <Table.Tr key={x.id}>
          <Table.Td>{x.userFullName}</Table.Td>
          <Table.Td>{x.price}</Table.Td>
          <Table.Td>{x.createUser}</Table.Td>
          <Table.Td>{format(x.createDate, "dd/MM/yyyy - HH.mm")}</Table.Td>
          <Table.Td>
            <Flex justify={"center"} gap={5}>
              <ActionIcon variant={"light"} color={"red"}>
                <IconTrash
                  onClick={() => deleteOvertimeMember(x.id)}
                  color={"red"}
                />
              </ActionIcon>
            </Flex>
          </Table.Td>
        </Table.Tr>
      )),
    [form.values.overtimeMembers]
  );

  return (
    <div>
      <Title order={3}>Expenses</Title>
      <Divider my={TITLE_DIVIDER_MY} />
      <Card shadow={"xs"} radius={"xs"} withBorder padding={10}>
        <Flex gap={"md"}>
          <Flex direction={"column"} w={"60%"}>
            <Flex gap={"sm"} style={{ flexGrow: 1 }} align={"center"}>
              <Select
                w={"20%"}
                {...form.getInputProps("userId")}
                withAsterisk
                data={activeUserSelectData}
                searchable
                label={"User Name"}
                style={{ flexGrow: 1 }}
              />

              <Select
                w={"20%"}
                {...form.getInputProps("projectId")}
                withAsterisk
                data={activeProjectSelectData}
                label={"Project Name"}
                style={{ flexGrow: 1 }}
              />

              <Select
                w={"20%"}
                {...form.getInputProps("reportId")}
                data={approvedReportSelectData}
                searchable
                label={"Report Name"}
                style={{ flexGrow: 1 }}
                clearable
              />
            </Flex>
            <Flex gap={"sm"} style={{ flexGrow: 1 }} align={"center"}>
              <DateInput
                w={"20%"}
                {...form.getInputProps("expenseDate")}
                withAsterisk
                valueFormat="DD MMMM YYYY"
                label={"Expense Date"}
                style={{ flexGrow: 1 }}
              />

              <NumberInput
                w={"20%"}
                {...form.getInputProps("totalPrice")}
                withAsterisk
                label={"Total Price"}
                hideControls
                style={{ flexGrow: 1 }}
              />

              <Radio.Group
                w={"20%"}
                label="Expense Type"
                withAsterisk
                {...form.getInputProps("expenseType")}
                style={{ flexGrow: 1 }}
                display={"center"}
              >
                <Group mt="xs">
                  {expenseTypes.map((x) => (
                    <Radio value={x.value} label={x.label}></Radio>
                  ))}
                </Group>
              </Radio.Group>
            </Flex>
            <Flex gap={"sm"} style={{ flexGrow: 1 }} align={"center"}>
              <TextInput
                w={"20%"}
                {...form.getInputProps("tripDescription")}
                label={"Trip Description"}
                withAsterisk={
                  form.values.expenseType === ExpenseType.Transportation
                }
                disabled={form.values.expenseType === ExpenseType.Food}
                style={{ flexGrow: 1 }}
              />

              <Select
                w={"20%"}
                {...form.getInputProps("currency")}
                withAsterisk
                data={currencyTypes}
                label={"Currency"}
                style={{ flexGrow: 1 }}
              />

              <Checkbox
                mt={25}
                w={"20%"}
                label="Out Of Office"
                {...form.getInputProps("outOfOffice", { type: "checkbox" })}
                style={{ flexGrow: 1 }}
              />
            </Flex>
          </Flex>
          <Flex w={"40%"}>
            <Card
              shadow={"xs"}
              radius={"md"}
              withBorder
              padding={10}
              w={"100%"}
            >
              <Flex gap="sm" align={"flex-end"}>
                <Select
                  {...overtimeMemberForm.getInputProps("userId")}
                  withAsterisk
                  data={activeUserSelectData}
                  searchable
                  label={"User Name"}
                  style={{ flexGrow: 1 }}
                />

                <NumberInput
                  {...overtimeMemberForm.getInputProps("price")}
                  withAsterisk
                  label="Price"
                  hideControls
                  style={{ flexGrow: 1 }}
                />

                <Button onClick={saveOvertimeMember} variant={"light"}>
                  Add Overtime Member
                </Button>
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
                <ScrollArea h={200}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>User Name</Table.Th>
                      <Table.Th>Price</Table.Th>
                      <Table.Th>Create User</Table.Th>
                      <Table.Th>Create Date</Table.Th>
                      <Table.Th></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{memoizedOvertimeMembers}</Table.Tbody>
                </ScrollArea>
              </Table>
            </Card>
          </Flex>
        </Flex>
        <Button onClick={handleSave} variant={"light"} mt={10}>
          Add New Expense
        </Button>
      </Card>
      <Card mt={"sm"} withBorder padding={"sm"}>
        <Flex gap={"xs"} align={"center"}>
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
            placeholder="Select User"
            style={{ flexGrow: 1 }}
            clearable
            onChange={(e) => setSelectedUser(e)}
          />
          <Select
            data={reportSelectData}
            searchable
            placeholder="Select Report"
            style={{ flexGrow: 1 }}
            clearable
            onChange={(e) => setSelectedReport(e)}
          />
          <Checkbox
            labelPosition="left"
            label={"Show Unapproved Expenses"}
            style={{ marginLeft: "10px" }}
            checked={showUnapprovedExpenses}
            onChange={() => setShowUnapprovedExpenses(!showUnapprovedExpenses)}
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
              <Table.Th>User Name</Table.Th>
              <Table.Th>Project Name</Table.Th>
              <Table.Th>Expense Type</Table.Th>
              <Table.Th>Expense Date</Table.Th>
              <Table.Th>Total Price</Table.Th>
              <Table.Th>Currency</Table.Th>
              <Table.Th>Trip Description</Table.Th>
              <Table.Th>Out Of Office</Table.Th>
              <Table.Th>Report Name</Table.Th>
              <Table.Th>Create User</Table.Th>
              <Table.Th>Create Date</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{memoizedExpenses}</Table.Tbody>
        </Table>
      </Card>
    </div>
  );
}

export default Expenses;
