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
      return [action.payload, ...state];
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

export default userReducer;
