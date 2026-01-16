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
import { currencyTypes, expenseTypes } from "../../../constants/static-data";

function useExpenses() {
  const [expenses, dispatch] = useReducer(expenseReducer, []);

  const { handleDataRequest } = useRequestHandler();

  const addExpense = async (expense: Expense) => {
    const expenseRequest: ExpenseRequest = {
      ...expense,
      userId: expense.userId ? expense.userId : "",
      projectId: expense.projectId ? expense.projectId : "",
      reportId: expense.reportId ? expense.reportId : "",
      expenseType: Number(expense.expenseType),
      currency: Number(expense.currency),
    };

    const response = await handleDataRequest<ExpenseRequest, ExpenseResponse>(
      urls.expense,
      RequestType.Post,
      expenseRequest
    );

    if (!response.isSuccess) return false;

    const newExpense: Expense = {
      ...response.value,
      expenseType: expenseTypes[response.value.expenseType].value,
      currency: currencyTypes[response.value.currency].value,
    };

    dispatch({
      type: ReducerActions.Add,
      payload: newExpense,
    });

    return true;
  };

  const deleteExpense = async (id: string) => {
    const response = await handleDataRequest<string, never>(
      urls.expense,
      RequestType.Delete,
      undefined,
      { id }
    );

    if (!response.isSuccess) return false;

    dispatch({
      type: ReducerActions.Delete,
      payload: id,
    });

    toast.success("Expense has been deleted successfully!");

    return true;
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

    if (!response.isSuccess) return;

    const expenses: Expense[] = response.value.map((x) => ({
      ...x,
      expenseType: x.expenseType.toString(),
      currency: x.currency.toString(),
    }));

    dispatch({
      type: ReducerActions.Replace,
      payload: expenses,
    });
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
