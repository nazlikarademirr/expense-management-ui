import { User } from "../types/user";
import ReducerActions from "../enums/reducer-action";
import userReducer from "../pages/Users/user-reducer";
import { useReducer } from "react";

function useUsers() {
  const [users, dispatch] = useReducer(userReducer, []);

  const addUser = (user: User) => {
    dispatch({
      type: ReducerActions.Add,
      payload: user,
    });
  };

  const deleteUser = (id: string) => {
    dispatch({
      type: ReducerActions.Delete,
      payload: id,
    });
  };

  const updateUser = (updatedUser: User) => {
    dispatch({
      type: ReducerActions.Update,
      payload: updatedUser,
    });
  };

  const replaceUsers = (list: User[]) => {
    dispatch({
      type: ReducerActions.Replace,
      payload: list,
    });
  };

  return {
    users,
    addUser,
    deleteUser,
    replaceUsers,
    updateUser,
  };
}

export default useUsers;
