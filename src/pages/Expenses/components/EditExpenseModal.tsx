import { useEffect, useRef } from "react";
import { Expense, ExpenseResponse } from "../../../types/expense";
import { modals } from "@mantine/modals";
import { Button, Flex, Select, TextInput } from "@mantine/core";
import RequestType from "../../../request-handler/request-type";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import { useForm } from "@mantine/form";
import {
  createJsonPatchDocumentFromDirtyForm,
  JsonPatchKeyValuePair,
} from "../../../types/json-patch-document";
import toast from "react-hot-toast";
import { DateInput } from "@mantine/dates";
import {
  expenseCurrencyTypes,
  expenseTypes,
} from "../../../constants/static-data";
import useUsers from "../../../hooks/useUsers";
import useProjects from "../../../hooks/useProjects";
import useReports from "../../../hooks/useReports";

interface EditExpenseProps {
  expense: Expense;
  updateExpense: (expenseForm: Expense) => void;
}

function EditExpenseModal({ expense, updateExpense }: EditExpenseProps) {
  const { handleDataRequest } = useRequestHandler();

  const { userSelectData } = useUsers({
    hasValueLabel: true,
  });
  const { projectSelectData } = useProjects({
    hasValueLabel: true,
  });
  const { reportSelectData } = useReports({
    hasValueLabel: true,
  });

  const expenseForm = useForm({
    initialValues: {
      id: expense.id,
      userId: expense.userId,
      projectId: expense.projectId,
      expenseType: expense.expenseType,
      expenseDate: new Date(expense.expenseDate),
      totalPrice: expense.totalPrice,
      currency: expense.currency,
      tripDescription: expense.tripDescription,
      outOfOffice: expense.outOfOffice,
      reportId: expense.reportId,
      overtimeMembers: expense.overtimeMembers,
      isActive: expense.isActive,
      createUser: expense.createUser,
      createDate: expense.createDate,
    },
  });

  const initialValues = useRef<Expense>(expenseForm.values);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    expenseForm.validate();

    if (!expenseForm.isValid()) return;

    const patchDocument = createJsonPatchDocumentFromDirtyForm(
      expenseForm,
      expenseForm.values
    );

    const response = await handleDataRequest<
      JsonPatchKeyValuePair[],
      ExpenseResponse
    >(`${urls.expense}/${expense.id}`, RequestType.Patch, patchDocument);

    if (response.isSuccess) {
      initialValues.current = expenseForm.values;

      updateExpense(expenseForm.values);

      toast.success("Expense edited successfully.");

      modals.closeAll();
    }
  };

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  return (
    <Flex direction={"column"} gap={10}>
      <Select
        ref={nameInputRef}
        {...expenseForm.getInputProps("userId")}
        withAsterisk
        data={userSelectData}
        searchable
        label={"User Name"}
      />

      <Select
        {...expenseForm.getInputProps("projectId")}
        withAsterisk
        data={projectSelectData}
        searchable
        label={"Project Name"}
      />

      <Select
        {...expenseForm.getInputProps("expenseType")}
        withAsterisk
        data={expenseTypes}
        searchable
        label={"Expense Type"}
      />

      <DateInput
        {...expenseForm.getInputProps("expenseDate")}
        withAsterisk
        label={"Expense Date"}
      />

      <TextInput
        {...expenseForm.getInputProps("totalPrice")}
        withAsterisk
        label={"Total Price"}
      />

      <Select
        {...expenseForm.getInputProps("currency")}
        withAsterisk
        data={expenseCurrencyTypes}
        label={"Currency"}
      />

      <TextInput
        {...expenseForm.getInputProps("tripDescription")}
        withAsterisk
        label={"Trip Description"}
      />

      <Select
        {...expenseForm.getInputProps("outOfOffice")}
        withAsterisk
        data={["true", "false"]}
        label={"Out Of Office"}
      />

      <Select
        {...expenseForm.getInputProps("reportId")}
        withAsterisk
        data={reportSelectData}
        label={"Report Name"}
      />
      {expenseForm.isDirty() ? (
        <Button onClick={(e) => handleSave(e)}>Edit</Button>
      ) : (
        <Button disabled>Edit</Button>
      )}
    </Flex>
  );
}

export default EditExpenseModal;
