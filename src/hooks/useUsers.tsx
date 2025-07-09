import { useEffect, useState } from "react";
import { User, UserRequest, UserResponse } from "../types/user";
import useRequestHandler from "./useRequestHandler";
import urls from "../constants/urls";
import RequestType from "../request-handler/request-type";
import toast from "react-hot-toast";
import { SelectItem } from "../types/select-item";

function useUsers() {
  const [users, setUsers] = useState<User[]>([]);

  const [userSelectData, setUserSelectData] = useState<SelectItem[]>([]);

  const { handleDataRequest } = useRequestHandler();

  const addUser = async (user: User) => {
    const userRequest: UserRequest = {
      name: user.name,
      surname: user.surname,
      teamId: user.teamId ?? "",
      gender: Number(user.gender),
      cardNumber: user.cardNumber,
      email: user.email,
      password: user.password,
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
        gender: String(response.value.gender),
        role: String(response.value.role),
      };
      setUsers([newUser, ...users]);
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
      setUsers(users.filter((x) => x.id !== id));
      toast.success("User has been deleted successfully!");
      return true;
    }

    return false;
  };

  const updateUser = (updatedUser: User) => {
    const replacedUsers = users.map((x) => {
      if (x.id === updatedUser.id) {
        return updatedUser;
      }
      return x;
    });
    setUsers(replacedUsers);
  };

  const replaceUser = (list: User[]) => {
    setUsers(list);
  };

  const fetchUsers = async () => {
    const response = await handleDataRequest<never, UserResponse[]>(
      urls.user,
      RequestType.Get
    );
    if (response.isSuccess) {
      const users: User[] = response.value.map((x) => ({
        id: x.id,
        name: x.name,
        surname: x.surname,
        teamId: x.teamId,
        gender: String(x.gender),
        cardNumber: x.cardNumber,
        email: x.email,
        password: x.password,
        role: String(x.role),
        searchText: x.searchText,
        isActive: x.isActive,
        createUser: x.createUser,
        createDate: x.createDate,
      }));
      setUsers(users);
      setUserSelectData(
        response.value.map((x) => ({
          value: x.id,
          label: `${x.name} ${x.surname}`,
        }))
      );
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
    replaceUser,
    updateUser,
  };
}

export default useUsers;
