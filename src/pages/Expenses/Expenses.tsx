import { useForm } from "@mantine/form";
import useRequestHandler from "../../hooks/useRequestHandler";
import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  NumberInput,
  ScrollArea,
  Select,
  SimpleGrid,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { modals } from "@mantine/modals";
import { Expense } from "../../types/expense";
import ExpenseType from "../../enums/expense-type";
import ExpenseCurrencyType from "../../enums/expense-currency-type";
import useExpenses from "./hooks/useExpenses";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import urls from "../../constants/urls";
import RequestType from "../../request-handler/request.type";
import { SelectItem } from "../../types/select-item";
import { UserResponse } from "../../types/user";
import { ProjectResponse } from "../../types/project";
import { ReportResponse } from "../../types/report";
import EditExpense from "./components/EditExpense";
import { DateInput } from "@mantine/dates";
import { OvertimeMember } from "../../types/overtime-member";

function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();

  const [userSelectData, setUserSelectData] = useState<SelectItem[]>([]);
  const [projectSelectData, setProjectSelectData] = useState<SelectItem[]>([]);
  const [reportSelectData, setReportSelectData] = useState<SelectItem[]>([]);

  const { handleDataRequest } = useRequestHandler();

  const form = useForm<Expense>({
    initialValues: {
      id: crypto.randomUUID(),
      userId: "",
      projectId: "",
      expenseType: "",
      expenseDate: new Date(),
      totalPrice: 0,
      currency: "",
      tripDescription: "",
      outOfOffice: false,
      reportId: "",
      overtimeMembers: [],
      isActive: false,
      createUser: crypto.randomUUID(),
      createDate: new Date(),
    },
    validate: {
      userId: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  const overtimeMemberForm = useForm<OvertimeMember>({
    initialValues: {
      id: crypto.randomUUID(),
      userId: "",
      expenseId: "",
      price: 0,
      createUser: crypto.randomUUID(),
      createDate: new Date(),
    },
    validate: {
      userId: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  const openEditExpense = (expense: Expense) => {
    modals.open({
      title: "Edit Expense",
      size: "xl",
      children: <EditExpense expense={expense} updateExpense={updateExpense} />,
    });
  };

  const expenseTypesData = useMemo(
    () => [
      {
        value: ExpenseType.Food,
        label: "Food",
      },
      {
        value: ExpenseType.Transportation,
        label: "Transportation",
      },
    ],
    []
  );

  const expenseCurrencyTypesData = useMemo(
    () => [
      {
        value: ExpenseCurrencyType.TL,
        label: "TL",
      },
      {
        value: ExpenseCurrencyType.Euro,
        label: "Euro",
      },
      {
        value: ExpenseCurrencyType.Dollar,
        label: "Dollar",
      },
      {
        value: ExpenseCurrencyType.MalaysianRinggit,
        label: "Malaysian Ringgit",
      },
    ],
    []
  );

  const deleteOvertimeMember = (id: string) => {
    const overtimeMembers = form.values.overtimeMembers.filter(
      (x) => x.userId !== id
    );

    form.setFieldValue("overtimeMembers", overtimeMembers);
  };

  const memoizedExpenses = useMemo(
    () =>
      expenses.map((x: Expense) => (
        <Table.Tr key={x.id}>
          <Table.Td>
            {userSelectData.find((y) => y.value === x.userId)?.label}
          </Table.Td>
          <Table.Td>
            {projectSelectData.find((y) => y.value === x.projectId)?.label}
          </Table.Td>
          <Table.Td>
            {expenseTypesData.find((y) => y.value === x.expenseType)?.label}
          </Table.Td>
          <Table.Td>{format(x.expenseDate, "dd/MM/yyyy HH:mm")}</Table.Td>
          <Table.Td> {x.totalPrice} </Table.Td>
          <Table.Td>
            {
              expenseCurrencyTypesData.find((y) => y.value === x.currency)
                ?.label
            }
          </Table.Td>
          <Table.Td> {x.tripDescription} </Table.Td>
          <Table.Td> {String(x.outOfOffice)} </Table.Td>
          <Table.Td>
            {reportSelectData.find((y) => y.value === x.reportId)?.label}
          </Table.Td>
          <Table.Td>{String(x.overtimeMembers)}</Table.Td>
          <Table.Td> {"true"} </Table.Td>
          <Table.Td> {x.createUser} </Table.Td>
          <Table.Td>{format(x.createDate, "dd/MM/yyyy HH:mm")}</Table.Td>
          <Table.Td>
            <Flex justify={"center"} gap={5}>
              <ActionIcon
                onClick={(_) => openEditExpense(x)}
                variant={"light"}
                color={"blue"}
              >
                <IconEdit />
              </ActionIcon>
              <ActionIcon
                onClick={(_) => deleteExpense(x.id)}
                variant={"light"}
                color={"red"}
              >
                <IconTrash />
              </ActionIcon>
            </Flex>
          </Table.Td>
        </Table.Tr>
      )),
    [expenses]
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
          <Table.Td>{format(x.createDate, "dd/MM/yyyy HH:mm")}</Table.Td>
          <Table.Td>
            <Flex justify={"center"} gap={5}>
              <ActionIcon variant={"light"} color={"red"}>
                <IconTrash
                  onClick={(_) => deleteOvertimeMember(x.userId)}
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
    if (!overtimeMemberForm.isValid()) return;

    form.setFieldValue("overtimeMembers", [
      ...form.values.overtimeMembers,
      overtimeMemberForm.values,
    ]);

    overtimeMemberForm;
  };

  const handleSave = async () => {
    if (!form.isValid()) return;

    // form.setFieldValue("overtimeMembers", [
    //   ...form.values.overtimeMembers,
    //   overtimeMemberForm.values,
    // ]);

    overtimeMemberSave();

    const retVal = await addExpense(form.values);

    if (retVal) {
      form.reset();
      toast.success("Expense has been added successfully!");
    }
  };

  const fetchUsers = async () => {
    var users = await handleDataRequest<unknown, UserResponse[]>(
      urls.user,
      RequestType.Get
    );
    if (users.isSuccess) {
      var usersData: SelectItem[] = users.value.map((x) => ({
        value: x.id,
        label: x.name + " " + x.surname,
      }));

      setUserSelectData(usersData);
    }
  };

  const fetchProjects = async () => {
    var projects = await handleDataRequest<unknown, ProjectResponse[]>(
      urls.project,
      RequestType.Get
    );
    if (projects.isSuccess) {
      var projectsData: SelectItem[] = projects.value.map((x) => ({
        value: x.id,
        label: x.name,
      }));

      setProjectSelectData(projectsData);
    }
  };

  const fetchReports = async () => {
    var reports = await handleDataRequest<unknown, ReportResponse[]>(
      urls.report,
      RequestType.Get
    );
    if (reports.isSuccess) {
      var reportsData: SelectItem[] = reports.value.map((x) => ({
        value: x.id,
        label: x.name,
      }));

      setReportSelectData(reportsData);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProjects();
    fetchReports();
  }, []);

  return (
    <div>
      <Title order={3}>Expenses</Title>
      <Divider my={15} />
      <Card shadow={"md"} radius={"md"} withBorder>
        <Flex gap={10} direction={"column"}>
          <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <Group grow>
              <SimpleGrid cols={2}>
                <SimpleGrid cols={3}>
                  <Select
                    key={form.key("userId")}
                    {...form.getInputProps("userId")}
                    withAsterisk
                    data={userSelectData}
                    searchable
                    label={"User Name"}
                  />

                  <Select
                    {...form.getInputProps("projectId")}
                    withAsterisk
                    data={projectSelectData}
                    label={"Project Name"}
                  />

                  <Select
                    {...form.getInputProps("expenseType")}
                    withAsterisk
                    data={expenseTypesData}
                    searchable
                    label={"Expense Type"}
                  />

                  <DateInput
                    {...form.getInputProps("expenseDate")}
                    withAsterisk
                    label={"Expense Date"}
                  />

                  <NumberInput
                    {...form.getInputProps("totalPrice")}
                    withAsterisk
                    label={"Total Price"}
                    hideControls
                  />

                  <Select
                    {...form.getInputProps("currency")}
                    withAsterisk
                    data={expenseCurrencyTypesData}
                    searchable
                    label={"Currency"}
                  />

                  <TextInput
                    {...form.getInputProps("tripDescription")}
                    label={"Trip Description"}
                  />

                  <Select
                    {...form.getInputProps("outOfOffice")}
                    withAsterisk
                    data={["true", "false"]}
                    label={"Out Of Office"}
                  />

                  <Select
                    {...form.getInputProps("reportId")}
                    withAsterisk
                    data={reportSelectData}
                    searchable
                    label={"Report Name"}
                  />
                </SimpleGrid>
                <Card shadow={"md"} radius={"md"} withBorder>
                  <form
                    onSubmit={overtimeMemberForm.onSubmit((values) =>
                      console.log(values)
                    )}
                  ></form>
                  <Group grow>
                    <Select
                      key={overtimeMemberForm.key("id")}
                      {...overtimeMemberForm.getInputProps("userId")}
                      withAsterisk
                      data={userSelectData}
                      searchable
                      label={"User Name"}
                    />

                    <NumberInput
                      {...overtimeMemberForm.getInputProps("price")}
                      withAsterisk
                      label="Price"
                      hideControls
                    />

                    <Button
                      onClick={overtimeMemberSave}
                      variant={"light"}
                      style={{ marginTop: "25px" }}
                    >
                      Add Overtime Member
                    </Button>
                  </Group>

                  <Table
                    stickyHeader
                    highlightOnHover
                    withTableBorder
                    withColumnBorders
                    mt={16}
                  >
                    <ScrollArea h={150} scrollbarSize={8}>
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
              </SimpleGrid>
            </Group>
          </form>
          <Button onClick={handleSave} variant={"light"}>
            Add New Expense
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
            <Table.Th>User Name</Table.Th>
            <Table.Th>Project Name</Table.Th>
            <Table.Th>Expense Type</Table.Th>
            <Table.Th>Expense Date</Table.Th>
            <Table.Th>Total Price</Table.Th>
            <Table.Th>Currency</Table.Th>
            <Table.Th>Trip Description</Table.Th>
            <Table.Th>Out Of Office</Table.Th>
            <Table.Th>Report Name</Table.Th>
            <Table.Th>Overtime Members</Table.Th>
            <Table.Th>Is Active</Table.Th>
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
