import { useEffect, useReducer } from "react";
import {
  Expense,
  ExpenseRequest,
  ExpenseResponse,
} from "../../../types/expense";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request-type";
import toast from "react-hot-toast";
import ReducerActions from "../../../enums/reducer-action";
import expenseReducer from "../expense-reducer";

function useExpenses() {
  const [expenses, dispatch] = useReducer(expenseReducer, []);

  const { handleDataRequest } = useRequestHandler();

  const addExpense = async (expense: Expense) => {
    const expenseRequest: ExpenseRequest = {
      ...expense,
      userId: expense.userId !== null ? expense.userId : "",
      projectId: expense.projectId !== null ? expense.projectId : "",
      reportId: expense.reportId !== null ? expense.reportId : "",
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
      dispatch({
        type: ReducerActions.Add,
        payload: newExpense,
      });
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
      dispatch({
        type: ReducerActions.Delete,
        payload: id,
      });
      toast.success("Expense has been deleted successfully!");
      return true;
    }

    return false;
  };

  const updateExpense = (updatedExpense: Expense) => {
    dispatch({
      type: ReducerActions.Update,
      payload: updatedExpense,
    });
  };

  const replaceExpenses = (list: Expense[]) => {
    dispatch({
      type: ReducerActions.Replace,
      payload: list,
    });
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
      dispatch({
        type: ReducerActions.Replace,
        payload: expenses,
      });
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
    replaceExpenses,
  };
}

export default useExpenses;
