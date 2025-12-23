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

  const [selectedUser, setSelectedUser] = useState("");

  const [selectedReport, setSelectedReport] = useState("");

  const [showUnapprovedExpenses, setShowUnapprovedExpenses] = useState(false);

  const form = useForm<Expense>({
    initialValues: {
      id: crypto.randomUUID(),
      userId: null,
      projectId: null,
      expenseType: "",
      expenseDate: new Date(),
      totalPrice: 0,
      currency: null,
      tripDescription: "",
      outOfOffice: false,
      reportId: null,
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
        values.expenseType === ExpenseType.Transportation.toString() &&
        value.trim().length === 0
          ? "Trip description cannot be empty."
          : value.length > 256
            ? "Trip description cannot exceed 256 characters."
            : undefined,
      outOfOffice: (value) =>
        !value ? "Out of office cannot be empty." : undefined,
    },
  });

  const overtimeMemberForm = useForm<OvertimeMember>({
    initialValues: {
      id: "",
      userId: null,
      expenseId: form.values.id,
      price: 0,
      createUser: crypto.randomUUID(),
      createDate: new Date(),
    },
    validate: {
      userId: (value) => (!value ? "User must be selected." : undefined),
      price: (value) => (!value ? "Total price cannot be empty." : undefined),
    },
  });

  const openEditExpense = (expense: Expense) => {
    modals.open({
      title: <Title order={4}>Edit Expense</Title>,
      size: 1500,
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

  const overtimeMemberSave = async () => {
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
      overtimeMemberForm.values,
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

    const retVal = await addExpense(form.values);

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
        .filter((x) =>
          selectedReport.length > 0 ? x.reportId === selectedReport : true
        )
        .filter((x) =>
          selectedUser.length > 0 ? x.userId === selectedUser : true
        )
        .filter(
          (x) => activeUserSelectData.find((y) => y.value === x.userId)?.label
        )
        .filter(
          (x) =>
            activeProjectSelectData.find((y) => y.value === x.projectId)?.label
        )
        .map((x: Expense) => (
          <Table.Tr key={x.id}>
            <Table.Td>
              {userSelectData.find((y) => y.value === x.userId)?.label}
            </Table.Td>
            <Table.Td>
              {projectSelectData.find((y) => y.value === x.projectId)?.label}
            </Table.Td>
            <Table.Td>{expenseTypes[Number(x.expenseType)].label}</Table.Td>
            <Table.Td>{format(x.expenseDate, "dd/MM/yyyy")}</Table.Td>
            <Table.Td> {x.totalPrice} </Table.Td>
            <Table.Td>{currencyTypes[Number(x.currency)].label}</Table.Td>
            <Table.Td>
              {x.expenseType === ExpenseType.Transportation.toString()
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
            <Table.Td>
              {x.reportId
                ? reportSelectData.find((y) => y.value === x.reportId)?.label
                : "-"}
            </Table.Td>
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
          <Table.Td>
            {userSelectData.find((y) => y.value === x.userId)?.label}
          </Table.Td>
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
        <Flex gap={"md"} direction={"row"}>
          <Flex gap={"sm"} direction={"column"} style={{ flexGrow: 1 }}>
            <Select
              {...form.getInputProps("userId")}
              withAsterisk
              data={activeUserSelectData}
              searchable
              label={"User Name"}
              style={{ flexGrow: 1 }}
            />

            <DateInput
              {...form.getInputProps("expenseDate")}
              withAsterisk
              valueFormat="DD MMMM YYYY"
              label={"Expense Date"}
              style={{ flexGrow: 1 }}
            />

            <TextInput
              {...form.getInputProps("tripDescription")}
              label={"Trip Description"}
              withAsterisk={
                form.values.expenseType ===
                ExpenseType.Transportation.toString()
              }
              disabled={form.values.expenseType === ExpenseType.Food.toString()}
              style={{ flexGrow: 1 }}
            />
          </Flex>
          <Flex gap={"sm"} direction={"column"} style={{ flexGrow: 1 }}>
            <Select
              {...form.getInputProps("projectId")}
              withAsterisk
              data={activeProjectSelectData}
              label={"Project Name"}
              style={{ flexGrow: 1 }}
            />

            <NumberInput
              {...form.getInputProps("totalPrice")}
              withAsterisk
              label={"Total Price"}
              hideControls
              style={{ flexGrow: 1 }}
            />

            <Select
              {...form.getInputProps("currency")}
              withAsterisk
              data={currencyTypes}
              label={"Currency"}
              style={{ flexGrow: 1 }}
            />
          </Flex>
          <Flex gap={"sm"} direction={"column"} style={{ flexGrow: 1 }}>
            <Select
              {...form.getInputProps("reportId")}
              data={approvedReportSelectData}
              searchable
              label={"Report Name"}
              style={{ flexGrow: 1 }}
              clearable
            />
            <Radio.Group
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

            <Radio.Group
              label="Out Of Office"
              withAsterisk
              {...form.getInputProps("outOfOffice")}
              style={{ flexGrow: 1 }}
            >
              <Group mt="xs">
                <Radio value="true" label="True" />
                <Radio value="false" label="False" />
              </Group>
            </Radio.Group>
          </Flex>
          <Card
            shadow={"xs"}
            radius={"md"}
            withBorder
            padding={10}
            style={{ width: "50%" }}
          >
            <Flex gap="sm" direction="row">
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

              <Button
                onClick={overtimeMemberSave}
                variant={"light"}
                style={{ marginTop: "25px", flexGrow: 1 }}
              >
                Add Overtime Member
              </Button>
            </Flex>
            <ScrollArea h={200}>
              <Table
                striped
                stickyHeader
                highlightOnHover
                withTableBorder
                withColumnBorders
                mt={15}
              >
                <Table.Thead>
                  <Table.Tr style={{ tableLayout: "fixed" }}>
                    <Table.Th>User Name</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th>Create User</Table.Th>
                    <Table.Th>Create Date</Table.Th>
                    <Table.Th></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{memoizedOvertimeMembers}</Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select
            data={userSelectData}
            searchable
            placeholder="Select User"
            style={{ flexGrow: 1 }}
            clearable
            onChange={(e) => setSelectedUser(e ? e : "")}
          />
          <Select
            data={reportSelectData}
            searchable
            placeholder="Select Report"
            style={{ flexGrow: 1 }}
            clearable
            onChange={(e) => setSelectedReport(e ? e : "")}
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
