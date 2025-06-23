import { useEffect, useMemo, useRef, useState } from "react";
import { modals } from "@mantine/modals";
import { Button, Flex, PasswordInput, Select, TextInput } from "@mantine/core";
import { User } from "../../../types/user";
import Gender from "../../../enums/gender";
import Role from "../../../enums/role";

interface EditUser {
  user: User;
  updateUser: (editedUser: User) => void;
}

function EditUser({ user, updateUser }: EditUser) {
  const [editedUser, setEditedUser] = useState<User>({
    id: user.id,
    name: user.name,
    surname: user.surname,
    teamId: user.teamId,
    gender: user.gender,
    cardNumber: user.cardNumber,
    email: user.email,
    password: user.password,
    role: user.role,
    searchText: user.searchText,
    isActive: user.isActive,
    createUser: user.createUser,
    createDate: user.createDate,
  });

  const gendersData = useMemo(
    () => [
      {
        value: Gender.Male,
        label: "Male",
      },
      {
        value: Gender.Female,
        label: "Female",
      },
    ],
    []
  );

  const rolesData = useMemo(
    () => [
      {
        value: Role.Admin,
        label: "Admin",
      },
      {
        value: Role.Manager,
        label: "Manager",
      },
      {
        value: Role.User,
        label: "User",
      },
    ],
    []
  );

  const userInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();

    updateUser(editedUser);

    modals.closeAll();
  };

  useEffect(() => {
    if (userInputRef.current) {
      userInputRef.current.focus();
    }
  }, []);

  return (
    <Flex direction={"column"} gap={10}>
      <TextInput
        ref={userInputRef}
        value={editedUser.name}
        onChange={(e) =>
          setEditedUser({ ...editedUser, name: e.currentTarget.value })
        }
        label={"Name"}
      />

      <TextInput
        value={editedUser.surname}
        onChange={(e) =>
          setEditedUser({ ...editedUser, surname: e.currentTarget.value })
        }
        label={"Surname"}
      />

      <Select
        value={editedUser.teamId}
        onChange={(e) => setEditedUser({ ...editedUser, teamId: e })}
        withAsterisk
        data={["astore", "deneme"]}
        searchable
        label={"Team Name"}
      />

      <Select
        value={editedUser.gender}
        onChange={(e) => setEditedUser({ ...editedUser, gender: e })}
        withAsterisk
        data={gendersData}
        label={"Gender"}
      />

      <TextInput
        value={editedUser.cardNumber}
        onChange={(e) =>
          setEditedUser({ ...editedUser, cardNumber: e.currentTarget.value })
        }
        label={"Card Number"}
      />

      <PasswordInput
        value={editedUser.password}
        onChange={(e) =>
          setEditedUser({ ...editedUser, password: e.currentTarget.value })
        }
        label={"Password"}
      />

      <Select
        value={editedUser.role}
        onChange={(e) => setEditedUser({ ...editedUser, role: e })}
        withAsterisk
        data={rolesData}
        label={"Role"}
      />

      <Button onClick={(e) => handleSave(e)}>Edit</Button>
    </Flex>
  );
}

export default EditUser;
