import { useReducer } from "react";
import { Expense } from "../../../types/expense";
import ReducerActions from "../../../enums/reducer-action";
import expenseReducer from "../expense-reducer";

function useExpenses() {
  const [expenses, dispatch] = useReducer(expenseReducer, []);

  const addExpense = (expense: Expense) => {
    dispatch({
      type: ReducerActions.Add,
      payload: expense,
    });
  };

  const deleteExpense = (id: string) => {
    dispatch({
      type: ReducerActions.Delete,
      payload: id,
    });
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

  return {
    expenses,
    addExpense,
    deleteExpense,
    updateExpense,
    replaceExpenses,
  };
}

export default useExpenses;
