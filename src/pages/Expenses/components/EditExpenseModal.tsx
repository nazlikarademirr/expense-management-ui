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
import { DateInput, DatesProvider } from "@mantine/dates";
import { currencyTypes, expenseTypes } from "../../../constants/static-data";
import overtimeMemberSchema, {
  OvertimeMember,
} from "../../../types/overtime-member.types";
import { format } from "date-fns";
import { IconTrash } from "@tabler/icons-react";
import ExpenseType from "../../../enums/expense-type";
import { SelectItem } from "../../../types/select-item.types";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useTranslation } from "react-i18next";
import Dictionary from "../../../helpers/translation/dictionary";
import i18n from "../../../helpers/translation/i18n";
import { dateParse } from "../../../helpers/DateParser";

const INPUT_WIDTH = "20%";

interface EditExpenseProps {
  expense: Expense;
  updateExpense: (expenseForm: Expense) => void;
  activeUserSelectData: SelectItem[];
  activeProjectSelectData: SelectItem[];
  reportSelectData: SelectItem[];
  checkIfExpenseIsValid: (expense: Expense) => boolean;
  currentUserFullName: string;
}

const MIN_FLEX_HEIGHT = 90;

function EditExpenseModal({
  expense,
  updateExpense,
  activeUserSelectData,
  activeProjectSelectData,
  reportSelectData,
  checkIfExpenseIsValid,
  currentUserFullName,
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
        (x) => x.userId === expenseForm.values.declarantId,
      )
    ) {
      setIsLoading(false);
      toast.error(
        t(
          Dictionary.OvertimeMember.YOU_CAN_NOT_ADD_YOURSELF_AS_OVERTIME_MEMBER,
        ),
      );
      return;
    }

    const expenseRequest: ExpenseRequest = {
      declarantId: expenseForm.values.declarantId ?? "",
      projectId: expenseForm.values.projectId ?? "",
      expenseType: Number(expenseForm.values.expenseType),
      expenseDate: expenseForm.values.expenseDate,
      totalPrice: expenseForm.values.totalPrice,
      currency: Number(expenseForm.values.currency),
      description: expenseForm.values.description,
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
      createUserFullName: currentUserFullName,
    });

    expenseForm.reset();
    overtimeMemberForm.reset();

    toast.success(t(Dictionary.Expense.UPDATED));

    modals.closeAll();

    setIsLoading(false);
  };

  const saveOvertimeMember = async () => {
    overtimeMemberForm.validate();

    if (!overtimeMemberForm.isValid()) return;

    if (
      expenseForm.values.overtimeMembers.some(
        (x) => x.userId === overtimeMemberForm.values.userId,
      )
    ) {
      return toast.error(t(Dictionary.OvertimeMember.VALID));
    }

    if (expenseForm.values.declarantId === overtimeMemberForm.values.userId) {
      return toast.error(
        t(
          Dictionary.OvertimeMember.YOU_CAN_NOT_ADD_YOURSELF_AS_OVERTIME_MEMBER,
        ),
      );
    }

    expenseForm.setFieldValue("overtimeMembers", [
      ...expenseForm.values.overtimeMembers,
      {
        ...overtimeMemberForm.values,
        createUserFullName: currentUserFullName,
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
    expenseForm.setFieldValue("declarantId", user.value);
    expenseForm.setFieldValue("declarantFullName", user.label);
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
    [expenseForm.values.overtimeMembers, overtimeMemberForm],
  );

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  return (
    <Card
      shadow="xs"
      radius="xs"
      withBorder
      padding={10}
      style={{ overflow: "visible" }}
    >
      <Flex gap="md">
        <Flex direction="column" w="50%">
          <Flex gap="sm" flex={1} mih={MIN_FLEX_HEIGHT}>
            <Select
              w={INPUT_WIDTH}
              {...expenseForm.getInputProps("declarantId")}
              onChange={(_, option) => changeUser(option)}
              withAsterisk
              data={activeUserSelectData}
              searchable
              label={t(Dictionary.Expense.DECLARANT)}
              flex={1}
            />
            <DatesProvider
              settings={{ locale: i18n.language === "en" ? "en" : "tr" }}
            >
              <DateInput
                w={INPUT_WIDTH}
                {...expenseForm.getInputProps("expenseDate")}
                withAsterisk
                valueFormat="DD.MM.YYYY"
                dateParser={dateParse}
                maxLength={10}
                label={t(Dictionary.Expense.DATE)}
                flex={1}
                popoverProps={{ withinPortal: false, position: "bottom" }}
              />
            </DatesProvider>
          </Flex>
          <Flex gap="sm" flex={1} mih={MIN_FLEX_HEIGHT}>
            <Select
              w={INPUT_WIDTH}
              {...expenseForm.getInputProps("projectId")}
              onChange={(_, option) => changeProject(option)}
              withAsterisk
              data={activeProjectSelectData}
              label={t(Dictionary.Expense.PROJECT_NAME)}
              flex={1}
            />

            <Select
              w={INPUT_WIDTH}
              {...expenseForm.getInputProps("reportId")}
              onChange={(_, option) => changeReport(option)}
              data={reportSelectData}
              placeholder={t(Dictionary.Expense.SELECT_REPORT)}
              withAsterisk
              searchable
              label={t(Dictionary.Expense.REPORT_NAME)}
              flex={1}
              allowDeselect={false}
            />
          </Flex>
          <Flex gap="sm" flex={1} mih={MIN_FLEX_HEIGHT}>
            <NumberInput
              w={INPUT_WIDTH}
              {...expenseForm.getInputProps("totalPrice")}
              withAsterisk
              label={t(Dictionary.Expense.TOTAL_PRICE)}
              hideControls
              flex={1}
              allowLeadingZeros={false}
            />

            <Radio.Group
              w={INPUT_WIDTH}
              flex={1}
              label={t(Dictionary.Expense.CURRENCY)}
              withAsterisk
              {...expenseForm.getInputProps("currency")}
              display="center"
            >
              <Group mt="xs" gap={10}>
                {currencyTypes.map((x) => (
                  <Radio value={x.value} label={x.label}></Radio>
                ))}
              </Group>
            </Radio.Group>
          </Flex>
          <Flex gap="sm" flex={1} mih={MIN_FLEX_HEIGHT}>
            <Radio.Group
              w={INPUT_WIDTH}
              label={t(Dictionary.Expense.TYPE)}
              withAsterisk
              {...expenseForm.getInputProps("expenseType")}
              flex={1}
              display="center"
            >
              <Group mt="xs">
                {expenseTypes.map((x) => (
                  <Radio value={x.value} label={x.label}></Radio>
                ))}
              </Group>
            </Radio.Group>
            <TextInput
              w={INPUT_WIDTH}
              {...expenseForm.getInputProps("description")}
              label={t(Dictionary.Expense.DESCRIPTION)}
              withAsterisk={
                expenseForm.values.expenseType === ExpenseType.Transportation ||
                expenseForm.values.expenseType === ExpenseType.Other
              }
              maxLength={128}
              flex={1}
            />
          </Flex>
          <Flex gap="sm" flex={1} mih={MIN_FLEX_HEIGHT}>
            <TextInput
              w={INPUT_WIDTH}
              label={t(Dictionary.Common.CREATE_USER)}
              value={expense.createUserFullName}
              disabled
              flex={1}
            />
            <TextInput
              w={INPUT_WIDTH}
              label={t(Dictionary.Common.CREATE_DATE)}
              value={format(expense.createDate, "dd/MM/yyyy - HH.mm")}
              disabled
              flex={1}
            />
          </Flex>
        </Flex>
        <Flex w="50%">
          <Card shadow="xs" radius="md" withBorder padding={10} w="100%">
            <Flex gap="sm" mih={80}>
              <Select
                {...overtimeMemberForm.getInputProps("userId")}
                onChange={(_, option) => changeOvertimeMember(option)}
                withAsterisk
                data={activeUserSelectData}
                searchable
                label={t(Dictionary.OvertimeMember.USER_NAME)}
                flex={1}
                allowDeselect={false}
              />
              <NumberInput
                {...overtimeMemberForm.getInputProps("price")}
                withAsterisk
                label={t(Dictionary.OvertimeMember.PRICE)}
                hideControls
                flex={1}
                allowLeadingZeros={false}
              />
              <Button onClick={saveOvertimeMember} variant="light" mt={25}>
                {t(Dictionary.OvertimeMember.ADD_NEW)}
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
              <ScrollArea h={350}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>
                      {t(Dictionary.OvertimeMember.USER_NAME)}
                    </Table.Th>
                    <Table.Th>{t(Dictionary.OvertimeMember.PRICE)}</Table.Th>
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
        variant="light"
        loading={isLoading}
        mt={10}
      >
        {t(Dictionary.Common.EDIT)}
      </Button>
    </Card>
  );
}

export default EditExpenseModal;
