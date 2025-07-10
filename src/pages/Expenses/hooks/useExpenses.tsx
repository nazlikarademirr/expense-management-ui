import { useEffect, useState } from "react";
import {
  Expense,
  ExpenseRequest,
  ExpenseResponse,
} from "../../../types/expense";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request-type";
import toast from "react-hot-toast";

function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const { handleDataRequest } = useRequestHandler();

  const addExpense = async (expense: Expense) => {
    const expenseRequest: ExpenseRequest = {
      ...expense,
      expenseType: Number(expense.expenseType),
      currency: Number(expense.currency),
    };

    const response = await handleDataRequest<ExpenseRequest, ExpenseResponse>(
      urls.expense,
      RequestType.Post,
      expenseRequest
    );

    if (response.isSuccess) {
      const newExpense: Expense = {
        ...response.value,
        expenseType: String(response.value.expenseType),
        currency: String(response.value.currency),
      };
      setExpenses([newExpense, ...expenses]);
      return true;
    }

    return false;
  };

  const deleteExpense = async (id: string) => {
    const response = await handleDataRequest<string, never>(
      urls.expense,
      RequestType.Delete,
      undefined,
      { id }
    );

    if (response.isSuccess) {
      setExpenses(expenses.filter((x) => x.id !== id));
      toast.success("Expense has been deleted successfully!");
      return true;
    }

    return false;
  };

  const updateExpense = (updatedExpense: Expense) => {
    const replacedExpense = expenses.map((x) => {
      if (x.id === updatedExpense.id) {
        return updatedExpense;
      }
      return x;
    });
    setExpenses(replacedExpense);
  };

  const replaceExpense = (list: Expense[]) => {
    setExpenses(list);
  };

  const fetchExpenses = async () => {
    const response = await handleDataRequest<never, ExpenseResponse[]>(
      urls.expense,
      RequestType.Get
    );
    if (response.isSuccess) {
      const expenses: Expense[] = response.value.map((x) => ({
        ...x,
        expenseType: String(x.expenseType),
        currency: String(x.currency),
      }));
      setExpenses(expenses);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return {
    expenses,
    addExpense,
    deleteExpense,
    updateExpense,
    replaceExpense,
  };
}

export default useExpenses;
