import ReducerActions from "../../enums/reducer-action";
import { User } from "../../types/user";

type Action =
  | { type: ReducerActions.Add; payload: User }
  | { type: ReducerActions.Update; payload: User }
  | { type: ReducerActions.Delete; payload: string }
  | { type: ReducerActions.Replace; payload: User[] };

function userReducer(state: User[], action: Action) {
  switch (action.type) {
    case ReducerActions.Add: {
      return [action.payload, ...state].sort(
        (a: User, b: User) =>
          a.name.localeCompare(b.name) || a.surname.localeCompare(b.surname)
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
        .sort(
          (a: User, b: User) =>
            a.name.localeCompare(b.name) || a.surname.localeCompare(b.surname)
        );
    }

    case ReducerActions.Delete: {
      return state.filter((x) => x.id !== action.payload);
    }

    case ReducerActions.Replace: {
      return action.payload.sort(
        (a, b) =>
          a.name.localeCompare(b.name) || a.surname.localeCompare(b.surname)
      );
    }
  }
}

export default userReducer;
