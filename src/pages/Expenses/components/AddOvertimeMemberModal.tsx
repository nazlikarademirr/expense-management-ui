import { useForm, UseFormReturnType } from "@mantine/form";
import {
  ActionIcon,
  Button,
  Card,
  Flex,
  NumberInput,
  ScrollArea,
  Select,
  Table,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import overtimeMemberSchema, {
  OvertimeMember,
} from "../../../types/overtime-member.types";
import { useState, useMemo } from "react";
import { SelectItem } from "../../../types/select-item.types";
import { Expense } from "../../../types/expense.types";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useTranslation } from "react-i18next";
import Dictionary from "../../../helpers/translation/dictionary";
import { PiPlusCircle } from "react-icons/pi";
import { CurrentUser } from "../../../types/authentication.types";

interface AddOvertimeMemberModalProps {
  expenseForm: UseFormReturnType<Expense>;
  activeUserSelectData: SelectItem[];
  currentUser: CurrentUser | null;
}

const AddOvertimeMemberModal = ({
  expenseForm,
  activeUserSelectData,
  currentUser,
}: AddOvertimeMemberModalProps) => {
  const { t } = useTranslation();

  const overtimeMemberForm = useForm<OvertimeMember>({
    initialValues: {
      id: crypto.randomUUID(),
      userId: null,
      userFullName: "",
      expenseId: expenseForm.values.id,
      price: 0,
      createUserId: "",
      createUserFullName: "",
      createDate: new Date(),
    },
    validate: zod4Resolver(overtimeMemberSchema),
  });

  const [overtimeMembers, setOvertimeMembers] = useState<OvertimeMember[]>(
    expenseForm.values.overtimeMembers,
  );

  const saveOvertimeMember = async () => {
    overtimeMemberForm.validate();

    if (!overtimeMemberForm.isValid()) return;

    if (
      overtimeMembers.some((x) => x.userId === overtimeMemberForm.values.userId)
    ) {
      return toast.error(t(Dictionary.Expense.OVERTIME_MEMBER_VALID));
    }

    if (expenseForm.values.userId === overtimeMemberForm.values.userId) {
      return toast.error(
        t(Dictionary.Expense.YOU_CAN_NOT_ADD_YOURSELF_AS_OVERTIME_MEMBER),
      );
    }

    const overtimeMemberFullName = activeUserSelectData.find(
      (x) => x.value === overtimeMemberForm.values.userId,
    )?.label;

    const overtimeMember: OvertimeMember = {
      ...overtimeMemberForm.values,
      id: crypto.randomUUID(),
      userFullName: overtimeMemberFullName ?? "",
      createUserFullName: currentUser
        ? `${currentUser.name} ${currentUser.surname}`
        : "",
    };

    const newMembers = [...overtimeMembers, overtimeMember];
    setOvertimeMembers(newMembers);
    expenseForm.setFieldValue("overtimeMembers", newMembers);
    overtimeMemberForm.reset();
  };

  const deleteOvertimeMember = (id: string) => {
    const newMembers = overtimeMembers.filter((x) => x.id !== id);
    setOvertimeMembers(newMembers);
    expenseForm.setFieldValue("overtimeMembers", newMembers);
  };

  const memoizedOvertimeMembers = useMemo(
    () =>
      overtimeMembers.map((x: OvertimeMember) => (
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
    [overtimeMembers],
  );

  return (
    <Flex justify="center">
      <Card
        h="500px"
        w="1000px"
        shadow="xs"
        radius="md"
        withBorder
        padding={10}
      >
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

          <Button
            onClick={saveOvertimeMember}
            variant="light"
            mt={25}
            leftSection={<PiPlusCircle size={22} />}
          >
            {t(Dictionary.Common.ADD)}
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
                <Table.Th>{t(Dictionary.Common.CREATE_USER)}</Table.Th>
                <Table.Th>{t(Dictionary.Common.CREATE_DATE)}</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{memoizedOvertimeMembers}</Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>
    </Flex>
  );
};

export default AddOvertimeMemberModal;
