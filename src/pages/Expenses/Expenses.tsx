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

function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();

  const { userSelectData } = useUsers({
    hasValueLabel: true,
  });
  const { projectSelectData } = useProjects({
    hasValueLabel: true,
  });
  const { reports, reportSelectData } = useReports({
    hasValueLabel: true,
  });

  const [showApprovedExpenses, setShowApprovedExpenses] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<Expense>({
    initialValues: {
      id: crypto.randomUUID(),
      userId: null,
      projectId: null,
      expenseType: 0,
      expenseDate: new Date(),
      totalPrice: 0,
      currency: 0,
      tripDescription: "",
      outOfOffice: null,
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
          : value < 0
            ? "Total price cannot be less than 0."
            : undefined,
      currency: (value) => (!value ? "Currency must be selected." : undefined),
      tripDescription: (value, values) =>
        Number(values.expenseType) === ExpenseType.Transportation && !value
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
      expenseId: null,
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
      title: "Edit Expense",
      size: "xl",
      children: (
        <EditExpenseModal expense={expense} updateExpense={updateExpense} />
      ),
    });
  };

  const deleteOvertimeMember = (id: string) => {
    const overtimeMembers = form.values.overtimeMembers.filter(
      (x) => x.id !== id
    );

    form.setFieldValue("overtimeMembers", overtimeMembers);
  };

  const memoizedApprovedReportSelectData = useMemo(
    () =>
      reports
        .filter((x) => x.isApproved === false)
        .map((x) => ({ value: x.id, label: x.name })),
    [reports]
  );

  const memoizedExpenses = useMemo(
    () =>
      expenses
        .filter((x) => (showApprovedExpenses === true ? x.isApproved : x))
        .filter((x) =>
          x.searchText.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((x: Expense) => (
          <Table.Tr key={x.id}>
            <Table.Td>
              {userSelectData.find((y) => y.value === x.userId)?.label}
            </Table.Td>
            <Table.Td>
              {projectSelectData.find((y) => y.value === x.projectId)?.label}
            </Table.Td>
            <Table.Td>
              {x.expenseType ? expenseTypes[x.expenseType].label : ""}
            </Table.Td>
            <Table.Td>{format(x.expenseDate, "dd/MM/yyyy")}</Table.Td>
            <Table.Td> {x.totalPrice} </Table.Td>
            <Table.Td>
              {x.currency ? currencyTypes[x.currency].label : ""}
            </Table.Td>
            <Table.Td> {x.tripDescription} </Table.Td>
            <Table.Td>
              {x.outOfOffice ? (
                <TiTick size={20} color="green" />
              ) : (
                <TiTimes size={20} color="#BA1A1A" />
              )}
            </Table.Td>
            <Table.Td>
              {reportSelectData.find((y) => y.value === x.reportId)?.label}
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
                  onClick={() => deleteExpense(x.id)}
                  variant={"light"}
                  color={"red"}
                >
                  <IconTrash />
                </ActionIcon>
              </Flex>
            </Table.Td>
          </Table.Tr>
        )),
    [expenses, showApprovedExpenses, searchQuery]
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

  const overtimeMemberSave = async () => {
    overtimeMemberForm.validate();

    if (!overtimeMemberForm.isValid()) return;

    overtimeMemberForm.values.id = crypto.randomUUID();

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

    const retVal = await addExpense(form.values);

    if (retVal) {
      form.reset();
      toast.success("Expense has been added successfully!");
    }
  };

  return (
    <div>
      <Title order={3}>Expenses</Title>
      <Divider my={10} />
      <Card shadow={"xs"} radius={"xs"} withBorder padding={10}>
        <Flex gap={"sm"} direction={"row"}>
          <Flex gap={"sm"} direction={"column"} style={{ flexGrow: 1 }}>
            <Select
              {...form.getInputProps("userId")}
              withAsterisk
              data={userSelectData}
              searchable
              label={"User Name"}
              styles={() => ({
                error: {
                  fontSize: "13px",
                  position: "fixed",
                  maxWidth: "fit-content",
                },
                root: {
                  flexGrow: 1,
                },
              })}
            />

            <DateInput
              {...form.getInputProps("expenseDate")}
              withAsterisk
              valueFormat="DD MMMM YYYY"
              label={"Expense Date"}
              styles={() => ({
                error: {
                  fontSize: "13px",
                  position: "fixed",
                  maxWidth: "fit-content",
                },
                root: {
                  flexGrow: 1,
                },
              })}
            />

            <TextInput
              {...form.getInputProps("tripDescription")}
              label={"Trip Description"}
              withAsterisk={
                Number(form.values.expenseType) === ExpenseType.Transportation
              }
              styles={() => ({
                error: {
                  fontSize: "13px",
                  position: "fixed",
                  maxWidth: "fit-content",
                },
                root: {
                  flexGrow: 1,
                },
              })}
            />
          </Flex>
          <Flex gap={"sm"} direction={"column"} style={{ flexGrow: 1 }}>
            <Select
              {...form.getInputProps("projectId")}
              withAsterisk
              data={projectSelectData}
              label={"Project Name"}
              styles={() => ({
                error: {
                  fontSize: "13px",
                  position: "fixed",
                  maxWidth: "fit-content",
                },
                root: {
                  flexGrow: 1,
                },
              })}
            />

            <NumberInput
              {...form.getInputProps("totalPrice")}
              withAsterisk
              label={"Total Price"}
              hideControls
              styles={() => ({
                error: {
                  fontSize: "13px",
                  position: "fixed",
                  maxWidth: "fit-content",
                },
                root: {
                  flexGrow: 1,
                },
              })}
            />

            <Select
              {...form.getInputProps("currency")}
              withAsterisk
              data={currencyTypes}
              searchable
              label={"Currency"}
              styles={() => ({
                error: {
                  fontSize: "13px",
                  position: "fixed",
                  maxWidth: "fit-content",
                },
                root: {
                  flexGrow: 1,
                },
              })}
            />
          </Flex>
          <Flex gap={"sm"} direction={"column"} style={{ flexGrow: 1 }}>
            <Select
              {...form.getInputProps("reportId")}
              data={memoizedApprovedReportSelectData}
              searchable
              label={"Report Name"}
              styles={() => ({
                error: {
                  fontSize: "13px",
                  position: "fixed",
                  maxWidth: "fit-content",
                },
                root: {
                  flexGrow: 1,
                },
              })}
            />
            <Radio.Group
              label="Expense Type"
              withAsterisk
              {...form.getInputProps("expenseType")}
              styles={() => ({
                error: {
                  fontSize: "13px",
                  position: "fixed",
                  maxWidth: "fit-content",
                },
                root: {
                  flexGrow: 1,
                  marginTop: -8,
                },
              })}
              display={"center"}
            >
              <Group mt="xs">
                {expenseTypes.map((x) => (
                  <Radio value={x.value.toString()} label={x.label}></Radio>
                ))}
              </Group>
            </Radio.Group>

            <Radio.Group
              label="Out Of Office"
              withAsterisk
              {...form.getInputProps("outOfOffice")}
              styles={() => ({
                error: {
                  fontSize: "13px",
                  position: "fixed",
                  maxWidth: "fit-content",
                },
                root: {
                  flexGrow: 1,
                  paddingTop: 5,
                },
              })}
            >
              <Group mt="xs">
                <Radio value="True" label="True" />
                <Radio value="False" label="False" />
              </Group>
            </Radio.Group>
          </Flex>
          <Flex gap={"sm"} direction={"column"} style={{ flexGrow: 1 }}>
            <Card shadow={"md"} radius={"md"} withBorder padding={10}>
              <Flex gap="sm" direction="row">
                <Select
                  {...overtimeMemberForm.getInputProps("userId")}
                  withAsterisk
                  data={userSelectData}
                  searchable
                  label={"User Name"}
                  styles={() => ({
                    error: {
                      fontSize: "13px",
                      position: "fixed",
                      maxWidth: "fit-content",
                    },
                    root: {
                      flexGrow: 1,
                    },
                  })}
                />

                <NumberInput
                  {...overtimeMemberForm.getInputProps("price")}
                  withAsterisk
                  label="Price"
                  hideControls
                  styles={() => ({
                    error: {
                      fontSize: "13px",
                      position: "fixed",
                      maxWidth: "fit-content",
                    },
                    root: {
                      flexGrow: 1,
                    },
                  })}
                />

                <Button
                  onClick={overtimeMemberSave}
                  variant={"light"}
                  style={{ marginTop: "25px", flexGrow: 1 }}
                >
                  Add Overtime Member
                </Button>
              </Flex>
              <Table
                stickyHeader
                highlightOnHover
                withTableBorder
                withColumnBorders
                mt={16}
              >
                <ScrollArea h={140} scrollbarSize={8}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>User Name</Table.Th>
                      <Table.Th>Price</Table.Th>
                      <Table.Th>Create User</Table.Th>
                      <Table.Th>Create Date</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>{memoizedOvertimeMembers}</Table.Tbody>
                </ScrollArea>
              </Table>
            </Card>
          </Flex>
        </Flex>
        <Button onClick={handleSave} variant={"light"} mt={7}>
          Add New Expense
        </Button>
      </Card>
      <Card mt={7} withBorder padding={8}>
        <Flex gap={3}>
          <TextInput
            size="xs"
            radius="xl"
            rightSection={<IconSearch size={16}></IconSearch>}
            style={{ flexGrow: 120 }}
            {...form.getInputProps("searchText")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Checkbox
            labelPosition="left"
            label={"Show Approved Expenses"}
            style={{ marginTop: "5px", marginLeft: "10px" }}
            checked={showApprovedExpenses}
            onChange={() => setShowApprovedExpenses(!showApprovedExpenses)}
            type="checkbox"
          />
        </Flex>
      </Card>
      <Table
        stickyHeader
        highlightOnHover
        withTableBorder
        withColumnBorders
        mt={6}
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
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{memoizedExpenses}</Table.Tbody>
      </Table>
    </div>
  );
}

export default Expenses;
