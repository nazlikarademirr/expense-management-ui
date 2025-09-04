import { useEffect, useReducer, useState } from "react";
import { User, UserRequest, UserResponse } from "../types/user";
import useRequestHandler from "./useRequestHandler";
import urls from "../constants/urls";
import RequestType from "../request-handler/request-type";
import toast from "react-hot-toast";
import { SelectItem } from "../types/select-item";
import ReducerActions from "../enums/reducer-action";
import userReducer from "../pages/Users/user-reducer";

interface UseUsersProps {
  hasValueLabel: boolean;
}

function useUsers({ hasValueLabel }: UseUsersProps) {
  const [users, dispatch] = useReducer(userReducer, []);

  const [userSelectData, setUserSelectData] = useState<SelectItem[]>([]);

  const { handleDataRequest } = useRequestHandler();

  const addUser = async (user: User) => {
    const userRequest: UserRequest = {
      ...user,
      teamId: user.teamId ?? "",
      gender: Number(user.gender),
      role: Number(user.role),
    };

    const response = await handleDataRequest<UserRequest, UserResponse>(
      urls.user,
      RequestType.Post,
      userRequest
    );

    if (response.isSuccess) {
      const newUser: User = {
        ...response.value,
      };
      dispatch({
        type: ReducerActions.Add,
        payload: newUser,
      });
      return true;
    }

    return false;
  };

  const deleteUser = async (id: string) => {
    const response = await handleDataRequest<string, never>(
      urls.user,
      RequestType.Delete,
      undefined,
      { id }
    );

    if (response.isSuccess) {
      dispatch({
        type: ReducerActions.Delete,
        payload: id,
      });
      toast.success("User has been deleted successfully!");
      return true;
    }

    return false;
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

  const fetchUsers = async () => {
    const response = await handleDataRequest<never, UserResponse[]>(
      urls.user,
      RequestType.Get
    );
    if (response.isSuccess) {
      const users: User[] = response.value.map((x) => ({
        ...x,
      }));
      dispatch({
        type: ReducerActions.Replace,
        payload: users,
      });

      if (hasValueLabel) {
        setUserSelectData(
          response.value.map((x) => ({
            value: x.id,
            label: `${x.name} ${x.surname}`,
          }))
        );
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    userSelectData,
    fetchUsers,
    addUser,
    deleteUser,
    replaceUsers,
    updateUser,
  };
}

export default useUsers;
