import ReducerActions from "../../enums/reducer-action";
import { Expense } from "../../types/expense.types";

type Action =
  | { type: ReducerActions.Add; payload: Expense }
  | { type: ReducerActions.Update; payload: Expense }
  | { type: ReducerActions.Delete; payload: string }
  | { type: ReducerActions.Replace; payload: Expense[] };

const sortExpenses = (expenses: Expense[]) => {
  return [...expenses].sort((a, b) => {
    const aInitial =
      a.declarantFullName?.charAt(0).toLocaleLowerCase("tr-TR") || "";
    const bInitial =
      b.declarantFullName?.charAt(0).toLocaleLowerCase("tr-TR") || "";

    const initialCompare = aInitial.localeCompare(bInitial, "tr-TR");
    if (initialCompare !== 0) {
      return initialCompare;
    }

    const aDate = a.expenseDate ? new Date(a.expenseDate).getTime() : 0;
    const bDate = b.expenseDate ? new Date(b.expenseDate).getTime() : 0;
    if (aDate !== bDate) {
      return aDate - bDate;
    }

    return (a.totalPrice || 0) - (b.totalPrice || 0);
  });
};

function expenseReducer(state: Expense[], action: Action) {
  switch (action.type) {
    case ReducerActions.Add: {
      return sortExpenses([...state, action.payload]);
    }

    case ReducerActions.Update: {
      return state.map((x) => {
        if (x.id === action.payload.id) {
          return action.payload;
        }
        return x;
      });
    }

    case ReducerActions.Delete: {
      return state.filter((x) => x.id !== action.payload);
    }

    case ReducerActions.Replace: {
      return sortExpenses(action.payload);
    }
  }
}

export default expenseReducer;
