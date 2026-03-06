import ReducerActions from "../../enums/reducer-action";
import { Expense } from "../../types/expense.types";

type Action =
  | { type: ReducerActions.Add; payload: Expense }
  | { type: ReducerActions.Update; payload: Expense }
  | { type: ReducerActions.Delete; payload: string }
  | { type: ReducerActions.Replace; payload: Expense[] };

function expenseReducer(state: Expense[], action: Action) {
  switch (action.type) {
    case ReducerActions.Add: {
      return [...state, action.payload];
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
      return action.payload;
    }
  }
}

export default expenseReducer;
