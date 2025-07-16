import { useForm } from "@mantine/form";
import {
  ActionIcon,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  NumberInput,
  ScrollArea,
  Select,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { Expense } from "../../types/expense";
import useExpenses from "./hooks/useExpenses";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { DateInput } from "@mantine/dates";
import { OvertimeMember } from "../../types/overtime-member";
import EditExpenseModal from "./components/EditExpenseModal";
import { useMemo } from "react";
import useProjects from "../../hooks/useProjects";
import { currencyTypes, expenseTypes } from "../../constants/static-data";
import useUsers from "../../hooks/useUsers";
import useReports from "../../hooks/useReports";

function Expenses() {
  const { expenses, addExpense, deleteExpense, updateExpense } = useExpenses();

  const { userSelectData } = useUsers({
    hasValueLabel: true,
  });
  const { projectSelectData } = useProjects({
    hasValueLabel: true,
  });
  const { reportSelectData } = useReports({
    hasValueLabel: true,
  });
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
      userId: (value) => (value.length === 0 ? "User must be selected." : null),
      projectId: (value) =>
        value.length === 0 ? "Project must be selected." : null,
      expenseType: (value) =>
        value?.length === 0 ? "Expense type must be selected." : undefined,
      expenseDate: (value) =>
        value === null ? "Expense date must be selected." : undefined,
      totalPrice: (value) =>
        value === null ? "Total price cannot be empty." : undefined,
      currency: (value) =>
        value?.length === 0 ? "Currency must be selected." : undefined,
      tripDescription: (value) =>
        value.length > 256
          ? "Trip description cannot exceed 256 characters."
          : null,
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
      children: (
        <EditExpenseModal expense={expense} updateExpense={updateExpense} />
      ),
    });
  };

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
            {expenseTypes.find((y) => y.value === x.expenseType)?.label}
          </Table.Td>
          <Table.Td>{format(x.expenseDate, "dd/MM/yyyy")}</Table.Td>
          <Table.Td> {x.totalPrice} </Table.Td>
          <Table.Td>
            {currencyTypes.find((y) => y.value === x.currency)?.label}
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
                onClick={() => openEditExpense(x)}
                variant={"light"}
                color={"blue"}
              >
                <IconEdit />
              </ActionIcon>
              <ActionIcon
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
                  onClick={() => deleteOvertimeMember(x.userId)}
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

    form.setFieldValue("overtimeMembers", [
      ...form.values.overtimeMembers,
      overtimeMemberForm.values,
    ]);
  };

  const handleSave = async () => {
    form.validate();

    if (!form.isValid()) return;

    overtimeMemberSave();

    const retVal = await addExpense(form.values);

    if (retVal) {
      form.reset();
      toast.success("Expense has been added successfully!");
    }
  };

  return (
    <div>
      <Title order={3}>Expenses</Title>
      <Divider my={15} />
      <Card shadow={"md"} radius={"md"} withBorder>
        <Flex gap={"xl"} direction={"row"}>
          <Flex gap={"xl"} direction={"column"} style={{ flexGrow: 1 }}>
            <Select
              {...form.getInputProps("userId")}
              withAsterisk
              style={{ flexGrow: 1 }}
              data={userSelectData}
              searchable
              label={"User Name"}
            />

            <DateInput
              {...form.getInputProps("expenseDate")}
              withAsterisk
              style={{ flexGrow: 1 }}
              label={"Expense Date"}
            />

            <TextInput
              {...form.getInputProps("tripDescription")}
              label={"Trip Description"}
              style={{ flexGrow: 1 }}
            />
          </Flex>
          <Flex gap={"xl"} direction={"column"} style={{ flexGrow: 1 }}>
            <Select
              {...form.getInputProps("projectId")}
              withAsterisk
              style={{ flexGrow: 1 }}
              data={projectSelectData}
              label={"Project Name"}
            />

            <NumberInput
              {...form.getInputProps("totalPrice")}
              withAsterisk
              style={{ flexGrow: 1 }}
              label={"Total Price"}
              hideControls
            />

            <Select
              {...form.getInputProps("reportId")}
              withAsterisk
              style={{ flexGrow: 1 }}
              data={reportSelectData}
              searchable
              label={"Report Name"}
            />
          </Flex>
          <Flex gap={"xl"} direction={"column"} style={{ flexGrow: 1 }}>
            <Select
              {...form.getInputProps("expenseType")}
              withAsterisk
              style={{ flexGrow: 1 }}
              data={expenseTypes}
              searchable
              label={"Expense Type"}
            />

            <Select
              {...form.getInputProps("currency")}
              withAsterisk
              style={{ flexGrow: 1, marginBottom: "30px" }}
              data={currencyTypes}
              searchable
              label={"Currency"}
            />

            <Checkbox
              {...form.getInputProps("outOfOffice", { type: "checkbox" })}
              label={"Out Of Office"}
              style={{ flexGrow: 1, marginBottom: "10px" }}
            />
          </Flex>
          <Flex gap={"xl"} direction={"column"} style={{ flexGrow: 1 }}>
            <Card shadow={"md"} radius={"md"} withBorder>
              <Flex gap="xl" direction="row">
                <Select
                  {...overtimeMemberForm.getInputProps("userId")}
                  withAsterisk
                  style={{ flexGrow: 1 }}
                  data={userSelectData}
                  searchable
                  label={"User Name"}
                />

                <NumberInput
                  {...overtimeMemberForm.getInputProps("price")}
                  withAsterisk
                  style={{ flexGrow: 1 }}
                  label="Price"
                  hideControls
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
          </Flex>
        </Flex>
        <Button
          onClick={handleSave}
          variant={"light"}
          style={{ marginTop: "10px" }}
        >
          Add New Expense
        </Button>
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
