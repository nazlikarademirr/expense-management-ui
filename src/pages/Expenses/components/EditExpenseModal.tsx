import { useEffect, useMemo, useRef, useState } from "react";
import {
  Expense,
  ExpenseRequest,
  ExpenseResponse,
} from "../../../types/expense";
import { modals } from "@mantine/modals";
import {
  ActionIcon,
  Button,
  Card,
  Checkbox,
  ComboboxItem,
  Flex,
  Group,
  NumberInput,
  Radio,
  Select,
  Table,
  TextInput,
} from "@mantine/core";
import RequestType from "../../../request-handler/request-type";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import { useForm } from "@mantine/form";
import toast from "react-hot-toast";
import { DateInput } from "@mantine/dates";
import { currencyTypes, expenseTypes } from "../../../constants/static-data";
import { OvertimeMember } from "../../../types/overtime-member";
import { format } from "date-fns";
import { IconTrash } from "@tabler/icons-react";
import ExpenseType from "../../../enums/expense-type";
import { SelectItem } from "../../../types/select-item";

interface EditExpenseProps {
  expense: Expense;
  updateExpense: (expenseForm: Expense) => void;
  activeUserSelectData: SelectItem[];
  activeProjectSelectData: SelectItem[];
  unapprovedReportSelectData: SelectItem[];
  checkIfExpenseIsValid: (expense: Expense) => boolean;
}

function EditExpenseModal({
  expense,
  updateExpense,
  activeUserSelectData,
  activeProjectSelectData,
  unapprovedReportSelectData,
  checkIfExpenseIsValid,
}: EditExpenseProps) {
  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const expenseForm = useForm<Expense>({
    initialValues: {
      ...expense,
      expenseDate: new Date(expense.expenseDate),
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
          : value.trim().length > 256
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
      expenseId: expense.id,
      price: 0,
      createUser: crypto.randomUUID(),
      createDate: new Date(),
    },
    validate: {
      userId: (value) => (!value ? "User must be selected." : undefined),
      price: (value) => (!value ? "Total price cannot be empty." : undefined),
    },
  });

  const initialValues = useRef<Expense>({
    ...expenseForm.values,
  });

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    setIsLoading(true);

    e.preventDefault();

    expenseForm.validate();

    if (!expenseForm.isValid()) {
      setIsLoading(false);
      return;
    }

    if (!checkIfExpenseIsValid(expenseForm.values)) {
      setIsLoading(false);
      return;
    }

    const expenseRequest: ExpenseRequest = {
      userId: expenseForm.values.userId ?? "",
      projectId: expenseForm.values.projectId ?? "",
      expenseType: Number(expenseForm.values.expenseType),
      expenseDate: expenseForm.values.expenseDate,
      totalPrice: expenseForm.values.totalPrice,
      currency: Number(expenseForm.values.currency),
      tripDescription: expenseForm.values.tripDescription,
      outOfOffice: expenseForm.values.outOfOffice,
      reportId: expenseForm.values.reportId ?? "",
      overtimeMembers: expenseForm.values.overtimeMembers,
    };

    const response = await handleDataRequest<ExpenseRequest, ExpenseResponse>(
      `${urls.expense}/${expense.id}`,
      RequestType.Put,
      expenseRequest,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    initialValues.current = {
      ...expenseForm.values,
    };

    updateExpense({
      ...expenseForm.values,
    });

    expenseForm.reset();
    overtimeMemberForm.reset();

    toast.success("Expense edited successfully.");

    modals.closeAll();

    setIsLoading(false);
  };

  const saveOvertimeMember = async () => {
    overtimeMemberForm.validate();

    if (!overtimeMemberForm.isValid()) return;

    overtimeMemberForm.values.id = crypto.randomUUID();
    overtimeMemberForm.values.createDate = new Date();

    if (
      expenseForm.values.overtimeMembers.some(
        (x) => x.userId === overtimeMemberForm.values.userId,
      )
    ) {
      return toast.error("There is a entry for this user.");
    }

    expenseForm.setFieldValue("overtimeMembers", [
      ...expenseForm.values.overtimeMembers,
      overtimeMemberForm.values,
    ]);

    overtimeMemberForm.reset();
  };

  const deleteOvertimeMember = (id: string) => {
    const overtimeMembers = expenseForm.values.overtimeMembers.filter(
      (x) => x.id !== id,
    );

    expenseForm.setFieldValue("overtimeMembers", overtimeMembers);
  };

  const changeUser = (user: ComboboxItem) => {
    expenseForm.setFieldValue("userId", user.value);
    expenseForm.setFieldValue("userFullName", user.label);
  };

  const changeProject = (project: ComboboxItem) => {
    expenseForm.setFieldValue("projectId", project.value);
    expenseForm.setFieldValue("projectName", project.label);
  };

  const changeReport = (report?: ComboboxItem) => {
    expenseForm.setFieldValue("reportId", report?.value ?? "");
    expenseForm.setFieldValue("reportName", report?.label ?? "");
  };

  const changeOvertimeMember = (overtimeMember: ComboboxItem) => {
    overtimeMemberForm.setFieldValue("userId", overtimeMember.value);
    overtimeMemberForm.setFieldValue("userFullName", overtimeMember.label);
  };

  const memoizedOvertimeMembers = useMemo(
    () =>
      expenseForm.values.overtimeMembers.map((x: OvertimeMember) => (
        <Table.Tr key={x.id}>
          <Table.Td>{x.userFullName}</Table.Td>
          <Table.Td>{x.price}</Table.Td>
          <Table.Td>{x.userFullName}</Table.Td>
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
    [expenseForm.values.overtimeMembers, overtimeMemberForm],
  );

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  return (
    <Card shadow={"xs"} radius={"xs"} withBorder padding={10}>
      <Flex gap={"md"}>
        <Flex direction={"column"} w={"60%"}>
          <Flex gap={"sm"} style={{ flexGrow: 1, minHeight: 90 }}>
            <Select
              w={"20%"}
              {...expenseForm.getInputProps("userId")}
              onChange={(_, option) => changeUser(option)}
              withAsterisk
              data={activeUserSelectData}
              searchable
              label={"User Name"}
              style={{ flexGrow: 1 }}
            />

            <Select
              w={"20%"}
              {...expenseForm.getInputProps("projectId")}
              onChange={(_, option) => changeProject(option)}
              withAsterisk
              data={activeProjectSelectData}
              label={"Project Name"}
              style={{ flexGrow: 1 }}
            />

            <Select
              w={"20%"}
              {...expenseForm.getInputProps("reportId")}
              onChange={(_, option) => changeReport(option)}
              data={unapprovedReportSelectData}
              placeholder="Select a report."
              searchable
              label={"Report Name"}
              style={{ flexGrow: 1 }}
              clearable
            />
          </Flex>
          <Flex gap={"sm"} style={{ flexGrow: 1, minHeight: 90 }}>
            <DateInput
              w={"20%"}
              {...expenseForm.getInputProps("expenseDate")}
              withAsterisk
              valueFormat="DD MMMM YYYY"
              label={"Expense Date"}
              style={{ flexGrow: 1 }}
            />

            <NumberInput
              w={"20%"}
              {...expenseForm.getInputProps("totalPrice")}
              withAsterisk
              label={"Total Price"}
              hideControls
              style={{ flexGrow: 1 }}
            />

            <Radio.Group
              w={"20%"}
              label="Expense Type"
              withAsterisk
              {...expenseForm.getInputProps("expenseType")}
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
          <Flex gap={"sm"} style={{ flexGrow: 1, minHeight: 90 }}>
            <TextInput
              w={"20%"}
              {...expenseForm.getInputProps("tripDescription")}
              label={"Trip Description"}
              withAsterisk={
                expenseForm.values.expenseType === ExpenseType.Transportation
              }
              disabled={expenseForm.values.expenseType === ExpenseType.Food}
              style={{ flexGrow: 1 }}
            />

            <Select
              w={"20%"}
              {...expenseForm.getInputProps("currency")}
              withAsterisk
              data={currencyTypes}
              label={"Currency"}
              style={{ flexGrow: 1 }}
            />

            <Checkbox
              mt={33}
              w={"20%"}
              label="Out Of Office"
              {...expenseForm.getInputProps("outOfOffice", {
                type: "checkbox",
              })}
              style={{ flexGrow: 1 }}
            />
          </Flex>
        </Flex>
        <Flex w={"40%"}>
          <Card shadow={"xs"} radius={"md"} withBorder padding={10} w={"100%"}>
            <Flex gap="sm" style={{ minHeight: 80 }}>
              <Select
                {...overtimeMemberForm.getInputProps("userId")}
                onChange={(_, option) => changeOvertimeMember(option)}
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

              <Button onClick={saveOvertimeMember} variant={"light"} mt={25}>
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
            >
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
            </Table>
          </Card>
        </Flex>
      </Flex>
      <Button
        onClick={handleSave}
        disabled={!expenseForm.isDirty()}
        variant={"light"}
        loading={isLoading}
        mt={10}
      >
        Edit Expense
      </Button>
    </Card>
  );
}

export default EditExpenseModal;
