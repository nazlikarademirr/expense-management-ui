import { useEffect, useMemo, useRef, useState } from "react";
import expenseSchema, {
  Expense,
  ExpenseRequest,
  ExpenseResponse,
} from "../../../types/expense.types";
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
  ScrollArea,
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
import overtimeMemberSchema, {
  OvertimeMember,
} from "../../../types/overtime-member.types";
import { format } from "date-fns";
import { IconTrash } from "@tabler/icons-react";
import ExpenseType from "../../../enums/expense-type";
import { SelectItem } from "../../../types/select-item.types";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { CurrentUser } from "../../../types/authentication.types";
import { useTranslation } from "react-i18next";
import Dictionary from "../../../helpers/translation/dictionary";
import Role from "../../../enums/role";

interface EditExpenseProps {
  currentUser: CurrentUser | null;
  expense: Expense;
  updateExpense: (expenseForm: Expense) => void;
  activeUserSelectData: SelectItem[];
  activeProjectSelectData: SelectItem[];
  reportSelectData: SelectItem[];
  unapprovedReportSelectData: SelectItem[];
  checkIfExpenseIsValid: (expense: Expense) => boolean;
}

const MIN_FLEX_HEIGHT = 90;

function EditExpenseModal({
  currentUser,
  expense,
  updateExpense,
  activeUserSelectData,
  activeProjectSelectData,
  reportSelectData,
  unapprovedReportSelectData,
  checkIfExpenseIsValid,
}: EditExpenseProps) {
  const { handleDataRequest } = useRequestHandler();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);

  const expenseForm = useForm<Expense>({
    initialValues: {
      ...expense,
      expenseDate: new Date(expense.expenseDate),
    },
    validate: zod4Resolver(expenseSchema),
  });

  const overtimeMemberForm = useForm<OvertimeMember>({
    initialValues: {
      id: crypto.randomUUID(),
      userId: null,
      userFullName: "",
      expenseId: expense.id,
      price: 0,
      createUserId: "",
      createUserFullName: "",
      createDate: new Date(),
    },
    validate: zod4Resolver(overtimeMemberSchema),
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

    if (
      expenseForm.values.overtimeMembers.find(
        (x) => x.userId === expenseForm.values.userId,
      )
    ) {
      setIsLoading(false);
      toast.error(
        t(Dictionary.Expense.YOU_CAN_NOT_ADD_YOURSELF_AS_OVERTIME_MEMBER),
      );
      return;
    }

    const expenseRequest: ExpenseRequest = {
      userId: expenseForm.values.userId ?? "",
      projectId: expenseForm.values.projectId ?? "",
      expenseType: Number(expenseForm.values.expenseType),
      expenseDate: expenseForm.values.expenseDate,
      totalPrice: expenseForm.values.totalPrice,
      currency: Number(expenseForm.values.currency),
      description: expenseForm.values.description,
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
      createUserFullName: currentUser
        ? `${currentUser.name} ${currentUser.surname}`
        : "",
    });

    expenseForm.reset();
    overtimeMemberForm.reset();

    toast.success(t(Dictionary.Expense.UPDATED));

    modals.closeAll();

    setIsLoading(false);
  };

  const saveOvertimeMember = async () => {
    if (!currentUser) return;

    overtimeMemberForm.validate();

    if (!overtimeMemberForm.isValid()) return;

    if (
      expenseForm.values.overtimeMembers.some(
        (x) => x.userId === overtimeMemberForm.values.userId,
      )
    ) {
      return toast.error(t(Dictionary.Expense.OVERTIME_MEMBER_VALID));
    }

    if (expenseForm.values.userId === overtimeMemberForm.values.userId) {
      return toast.error(
        t(Dictionary.Expense.YOU_CAN_NOT_ADD_YOURSELF_AS_OVERTIME_MEMBER),
      );
    }

    expenseForm.setFieldValue("overtimeMembers", [
      ...expenseForm.values.overtimeMembers,
      {
        ...overtimeMemberForm.values,
        createUserFullName: `${currentUser.name} ${currentUser.surname}`,
      },
    ]);

    overtimeMemberForm.setFieldValue("id", crypto.randomUUID());
    overtimeMemberForm.setFieldValue("createDate", new Date());
    overtimeMemberForm.setFieldValue("userId", null);
    overtimeMemberForm.setFieldValue("price", 0);
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
          <Table.Td>{x.createUserFullName}</Table.Td>
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
          <Flex gap={"sm"} style={{ flexGrow: 1, minHeight: MIN_FLEX_HEIGHT }}>
            <Select
              w={"20%"}
              {...expenseForm.getInputProps("userId")}
              onChange={(_, option) => changeUser(option)}
              withAsterisk
              data={activeUserSelectData}
              searchable
              label={t(Dictionary.Expense.USER_NAME)}
              style={{ flexGrow: 1 }}
            />

            <Select
              w={"20%"}
              {...expenseForm.getInputProps("projectId")}
              onChange={(_, option) => changeProject(option)}
              withAsterisk
              data={activeProjectSelectData}
              label={t(Dictionary.Expense.PROJECT_NAME)}
              style={{ flexGrow: 1 }}
            />

            <Select
              w={"20%"}
              {...expenseForm.getInputProps("reportId")}
              onChange={(_, option) => changeReport(option)}
              data={
                currentUser?.role === Role.User
                  ? unapprovedReportSelectData
                  : reportSelectData
              }
              placeholder={t(Dictionary.Expense.SELECT_REPORT)}
              searchable
              label={t(Dictionary.Expense.REPORT_NAME)}
              style={{ flexGrow: 1 }}
              clearable
            />
          </Flex>
          <Flex gap={"sm"} style={{ flexGrow: 1, minHeight: MIN_FLEX_HEIGHT }}>
            <DateInput
              w={"20%"}
              {...expenseForm.getInputProps("expenseDate")}
              withAsterisk
              valueFormat="DD MMMM YYYY"
              label={t(Dictionary.Expense.DATE)}
              style={{ flexGrow: 1 }}
            />

            <NumberInput
              w={"20%"}
              {...expenseForm.getInputProps("totalPrice")}
              withAsterisk
              label={t(Dictionary.Expense.TOTAL_PRICE)}
              hideControls
              style={{ flexGrow: 1 }}
            />

            <Radio.Group
              w={"20%"}
              label={t(Dictionary.Expense.TYPE)}
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
          <Flex gap={"sm"} style={{ flexGrow: 1, minHeight: MIN_FLEX_HEIGHT }}>
            <TextInput
              w={"20%"}
              {...expenseForm.getInputProps("description")}
              label={t(Dictionary.Expense.DESCRIPTION)}
              withAsterisk={
                expenseForm.values.expenseType === ExpenseType.Transportation ||
                expenseForm.values.expenseType === ExpenseType.Other
              }
              disabled={expenseForm.values.expenseType === ExpenseType.Food}
              style={{ flexGrow: 1 }}
            />

            <Select
              w={"20%"}
              {...expenseForm.getInputProps("currency")}
              withAsterisk
              data={currencyTypes}
              label={t(Dictionary.Expense.CURRENCY)}
              style={{ flexGrow: 1 }}
            />

            <Checkbox
              mt={33}
              w={"20%"}
              label={t(Dictionary.Expense.OUT_OF_OFFICE)}
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

              <Button onClick={saveOvertimeMember} variant={"light"} mt={25}>
                {t(Dictionary.Expense.ADD_OVERTIME_MEMBER)}
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
              <ScrollArea h={250}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t(Dictionary.Expense.USER_NAME)}</Table.Th>
                    <Table.Th>{t(Dictionary.Expense.PRICE)}</Table.Th>
                    <Table.Th>{t(Dictionary.Common.CREATE_USER)}</Table.Th>
                    <Table.Th>{t(Dictionary.Common.CREATE_DATE)}</Table.Th>
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
        disabled={!expenseForm.isDirty()}
        variant={"light"}
        loading={isLoading}
        mt={10}
      >
        {t(Dictionary.Common.EDIT)}
      </Button>
    </Card>
  );
}

export default EditExpenseModal;
