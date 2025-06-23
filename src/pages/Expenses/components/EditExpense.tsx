import { useEffect, useMemo, useRef, useState } from "react";
import { Expense } from "../../../types/expense";
import ExpenseCurrencyType from "../../../enums/expense-currency-type";
import ExpenseType from "../../../enums/expense-type";
import { modals } from "@mantine/modals";
import { Button, Flex, Select, TextInput } from "@mantine/core";
import { ReportResponse } from "../../../types/report";
import RequestType from "../../../request-handler/request.type";
import { SelectItem } from "../../../types/select-item";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import { UserResponse } from "../../../types/user";
import { ProjectResponse } from "../../../types/project";

interface EditExpense {
  expense: Expense;
  updateExpense: (editedExpense: Expense) => void;
}

function EditExpense({ expense, updateExpense }: EditExpense) {
  const [userSelectData, setUserSelectData] = useState<SelectItem[]>([]);
  const [projectSelectData, setProjectSelectData] = useState<SelectItem[]>([]);
  const [reportSelectData, setReportSelectData] = useState<SelectItem[]>([]);

  const { handleDataRequest } = useRequestHandler();

  const [editedExpense, setEditedExpense] = useState<Expense>({
    id: expense.id,
    userId: expense.userId,
    projectId: expense.projectId,
    expenseType: expense.expenseType,
    expenseDate: expense.expenseDate,
    totalPrice: expense.totalPrice,
    currency: expense.currency,
    tripDescription: expense.tripDescription,
    outOfOffice: expense.outOfOffice,
    reportId: expense.reportId,
    overtimeMembers: expense.overtimeMembers,
    isActive: expense.isActive,
    createUser: expense.createUser,
    createDate: expense.createDate,
  });

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

  const expenseInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();

    updateExpense(editedExpense);

    modals.closeAll();
  };

  useEffect(() => {
    if (expenseInputRef.current) {
      expenseInputRef.current.focus();
    }
    fetchUsers();
    fetchProjects();
    fetchReports();
  }, []);

  return (
    <Flex direction={"column"} gap={10}>
      <TextInput
        ref={expenseInputRef}
        value={editedExpense.userId}
        onChange={(e) =>
          setEditedExpense({ ...editedExpense, userId: e.currentTarget.value })
        }
        label={"User Name"}
      />

      <TextInput
        value={editedExpense.projectId}
        onChange={(e) =>
          setEditedExpense({
            ...editedExpense,
            projectId: e.currentTarget.value,
          })
        }
        label={"Project Name"}
      />

      <Select
        value={editedExpense.expenseType}
        onChange={(e) => setEditedExpense({ ...editedExpense, expenseType: e })}
        withAsterisk
        data={expenseTypesData}
        searchable
        label={"Expense Type"}
      />

      {/* <DateInput
        value={editedExpense.expenseDate}
        onChange={(e) =>
          setEditedExpense({
            ...editedExpense,
            
          })
        }
        withAsterisk
        label={"Expense Date"}
      /> */}

      <TextInput
        value={editedExpense.totalPrice}
        onChange={(e) =>
          setEditedExpense({
            ...editedExpense,
            totalPrice: Number(e.currentTarget.value),
          })
        }
        label={"Total Price"}
      />

      <Select
        value={editedExpense.currency}
        onChange={(e) =>
          setEditedExpense({
            ...editedExpense,
            currency: e,
          })
        }
        withAsterisk
        data={expenseCurrencyTypesData}
        label={"Currency"}
      />

      <TextInput
        value={editedExpense.tripDescription}
        onChange={(e) =>
          setEditedExpense({
            ...editedExpense,
            tripDescription: e.currentTarget.value,
          })
        }
        withAsterisk
        label={"Trip Description"}
      />

      <Select
        value={String(editedExpense.outOfOffice)}
        onChange={(e) =>
          setEditedExpense({
            ...editedExpense,
            outOfOffice: Boolean(e),
          })
        }
        withAsterisk
        data={["true", "false"]}
        label={"Out Of Office"}
      />

      <Select
        value={editedExpense.reportId}
        onChange={(e) =>
          setEditedExpense({
            ...editedExpense,
            reportId: String(e),
          })
        }
        withAsterisk
        data={reportSelectData}
        label={"Report Name"}
      />
      <Button onClick={(e) => handleSave(e)}>Edit</Button>
    </Flex>
  );
}

export default EditExpense;
