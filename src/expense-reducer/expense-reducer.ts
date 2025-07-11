import ReducerActions from "../enums/reducer-action";

interface MinEntity {
  id: string;
}

type Action<T> =
  | { type: ReducerActions.Fetch; payload: T[] }
  | { type: ReducerActions.Add; payload: T }
  | { type: ReducerActions.Delete; payload: string }
  | { type: ReducerActions.Update; payload: T }
  | { type: ReducerActions.Replace; payload: T[] };

const expenseReducer = <T extends MinEntity>(state: T[], action: Action<T>) => {
  switch (action.type) {
    case ReducerActions.Fetch: {
      return action.payload as T[];
    }

    case ReducerActions.Add: {
      return [action.payload, ...state];
    }

    case ReducerActions.Update: {
      return state.map((entity: T) => {
        if (entity.id === action.payload.id) {
          return action.payload;
        }
        return entity;
      });
    }

    case ReducerActions.Replace: {
      return action.payload as T[];
    }

    case ReducerActions.Delete: {
      return state.filter((entity: T) => entity.id !== action.payload);
    }

    default: {
      return state;
    }
  }
};

export default expenseReducer;
