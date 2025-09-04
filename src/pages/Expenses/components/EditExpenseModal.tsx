import { useEffect, useRef } from "react";
import { Expense, ExpenseResponse } from "../../../types/expense";
import { modals } from "@mantine/modals";
import { Button, Flex, Group, Radio, Select, TextInput } from "@mantine/core";
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
import { currencyTypes, expenseTypes } from "../../../constants/static-data";
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
      ...expense,
      expenseDate: new Date(expense.expenseDate),
    },
    validate: {
      userId: (value) =>
        value === null || value.length === 0 ? "User must be selected." : null,
      projectId: (value) =>
        value === null || value.length === 0
          ? "Project must be selected."
          : null,
      expenseType: (value) =>
        value === null ? "Expense type must be selected." : undefined,
      expenseDate: (value) =>
        value === null ? "Expense date must be selected." : undefined,
      totalPrice: (value) =>
        value === null ? "Total price cannot be empty." : undefined,
      currency: (value) =>
        value === null ? "Currency must be selected." : undefined,
      tripDescription: (value) =>
        value.length > 256
          ? "Trip description cannot exceed 256 characters."
          : null,
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
        data={userSelectData}
        searchable
        label={"User Name"}
      />

      <Select
        {...expenseForm.getInputProps("projectId")}
        data={projectSelectData}
        searchable
        label={"Project Name"}
      />

      <Radio.Group
        label="Expense Type"
        withAsterisk
        style={{ flexGrow: 1 }}
        {...expenseForm.getInputProps("expenseType")}
      >
        <Group mt="xs">
          {expenseTypes.map((x) => (
            <Radio value={x.value.toString()} label={x.label}></Radio>
          ))}
        </Group>
      </Radio.Group>

      <DateInput
        {...expenseForm.getInputProps("expenseDate")}
        withAsterisk
        valueFormat="DD MMMM YYYY"
        label={"Expense Date"}
      />

      <TextInput
        {...expenseForm.getInputProps("totalPrice")}
        label={"Total Price"}
      />

      <Select
        {...expenseForm.getInputProps("currency")}
        data={currencyTypes}
        label={"Currency"}
      />

      <TextInput
        {...expenseForm.getInputProps("tripDescription")}
        label={"Trip Description"}
      />

      <Select
        {...expenseForm.getInputProps("reportId")}
        data={reportSelectData}
        label={"Report Name"}
      />

      <Radio.Group
        label="Out Of Office"
        style={{ flexGrow: 1 }}
        {...expenseForm.getInputProps("outOfOffice")}
      >
        <Group mt="xs">
          <Radio value="True" label="True" />
          <Radio value="False" label="False" />
        </Group>
      </Radio.Group>

      <Button disabled={!expenseForm.isDirty()} onClick={(e) => handleSave(e)}>
        Edit
      </Button>
    </Flex>
  );
}

export default EditExpenseModal;
