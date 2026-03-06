import ReducerActions from "../../enums/reducer-action";
import { Project } from "../../types/project.types";

type Action =
  | { type: ReducerActions.Add; payload: Project }
  | { type: ReducerActions.Update; payload: Project }
  | { type: ReducerActions.Delete; payload: string }
  | { type: ReducerActions.Replace; payload: Project[] };

function projectReducer(state: Project[], action: Action) {
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
      return action.payload.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
}

export default projectReducer;
