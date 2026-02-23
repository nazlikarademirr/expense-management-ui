import ReducerActions from "../../enums/reducer-action";
import { Report } from "../../types/report";

type Action =
  | { type: ReducerActions.Add; payload: Report }
  | { type: ReducerActions.Update; payload: Report }
  | { type: ReducerActions.Delete; payload: string }
  | { type: ReducerActions.Replace; payload: Report[] };

function reportReducer(state: Report[], action: Action) {
  switch (action.type) {
    case ReducerActions.Add: {
      return [action.payload, ...state].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    }

    case ReducerActions.Update: {
      return state
        .map((x) => {
          if (x.id === action.payload.id) {
            return action.payload;
          }
          return x;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    case ReducerActions.Delete: {
      return state.filter((x) => x.id !== action.payload);
    }

    case ReducerActions.Replace: {
      return [...action.payload].sort((a, b) => a.name.localeCompare(b.name));
    }
  }
}

export default reportReducer;
