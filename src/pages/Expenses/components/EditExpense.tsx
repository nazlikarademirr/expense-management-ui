import { useEffect, useMemo, useRef, useState } from "react";
import { Expense, ExpenseResponse } from "../../../types/expense";
import ExpenseCurrencyType from "../../../enums/expense-currency-type";
import ExpenseType from "../../../enums/expense-type";
import { modals } from "@mantine/modals";
import { Button, Flex, Select, TextInput } from "@mantine/core";
import { ReportResponse } from "../../../types/report";
import RequestType from "../../../request-handler/request-type";
import { SelectItem } from "../../../types/select-item";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import { UserResponse } from "../../../types/user";
import { ProjectResponse } from "../../../types/project";
import { useForm } from "@mantine/form";
import {
  createJsonPatchDocumentFromDirtyForm,
  JsonPatchKeyValuePair,
} from "../../../types/json-patch-document";
import toast from "react-hot-toast";
import { DateInput } from "@mantine/dates";

interface EditExpense {
  expense: Expense;
  partiallyUpdateExpense: (formEditedExpense: Expense) => void;
}

function EditExpense({ expense, partiallyUpdateExpense }: EditExpense) {
  const [userSelectData, setUserSelectData] = useState<SelectItem[]>([]);
  const [projectSelectData, setProjectSelectData] = useState<SelectItem[]>([]);
  const [reportSelectData, setReportSelectData] = useState<SelectItem[]>([]);

  const { handleDataRequest } = useRequestHandler();

  const formEditedExpense = useForm({
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

  const initialValues = useRef<Expense>(formEditedExpense.values);

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
        label: "MalaysianRinggit",
      },
    ],
    []
  );

  const fetchUsers = async () => {
    var users = await handleDataRequest<never, UserResponse[]>(
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
    var projects = await handleDataRequest<never, ProjectResponse[]>(
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
    var reports = await handleDataRequest<never, ReportResponse[]>(
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

  const userInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (formEditedExpense.isDirty()) {
      const patchDocument = createJsonPatchDocumentFromDirtyForm(
        formEditedExpense,
        formEditedExpense.values
      );

      const response = await handleDataRequest<
        JsonPatchKeyValuePair[],
        ExpenseResponse
      >(urls.expense + "/" + expense.id, RequestType.Patch, patchDocument);

      if (response.isSuccess) {
        initialValues.current = formEditedExpense.values;

        partiallyUpdateExpense(formEditedExpense.values);

        toast.success("Expense edited successfully.");

        modals.closeAll();
      }
    }
  };

  useEffect(() => {
    if (userInputRef.current) {
      userInputRef.current.focus();
    }
    fetchUsers();
    fetchProjects();
    fetchReports();
  }, []);

  return (
    <Flex direction={"column"} gap={10}>
      <Select
        ref={userInputRef}
        key={formEditedExpense.key("id")}
        {...formEditedExpense.getInputProps("userId")}
        withAsterisk
        data={userSelectData}
        searchable
        label={"User Name"}
      />

      <Select
        {...formEditedExpense.getInputProps("projectId")}
        withAsterisk
        data={projectSelectData}
        searchable
        label={"Project Name"}
      />

      <Select
        {...formEditedExpense.getInputProps("expenseType")}
        withAsterisk
        data={expenseTypesData}
        searchable
        label={"Expense Type"}
      />

      <DateInput
        {...formEditedExpense.getInputProps("expenseDate")}
        withAsterisk
        label={"Expense Date"}
      />

      <TextInput
        {...formEditedExpense.getInputProps("totalPrice")}
        withAsterisk
        label={"Total Price"}
      />

      <Select
        {...formEditedExpense.getInputProps("currency")}
        withAsterisk
        data={expenseCurrencyTypesData}
        label={"Currency"}
      />

      <TextInput
        {...formEditedExpense.getInputProps("tripDescription")}
        withAsterisk
        label={"Trip Description"}
      />

      <Select
        {...formEditedExpense.getInputProps("outOfOffice")}
        withAsterisk
        data={["true", "false"]}
        label={"Out Of Office"}
      />

      <Select
        {...formEditedExpense.getInputProps("reportId")}
        withAsterisk
        data={reportSelectData}
        label={"Report Name"}
      />
      <Button onClick={(e) => handleSave(e)}>Edit</Button>
    </Flex>
  );
}

export default EditExpense;
