import { Avatar, Divider, Menu } from "@mantine/core";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider";
import { useNavigate } from "react-router";
import routes from "../../constants/routes";

function UserMenu() {
  const auth = useAuthentication();
  const navigate = useNavigate();

  if (!auth.currentUser) return null;

  const currentUserName = auth.currentUser.name.toUpperCase();
  const currentUserSurname = auth.currentUser.surname.toUpperCase();

  return (
    <Menu shadow="md">
      <Menu.Target>
        <Avatar ml={3} radius={"xl"} color="cyan">
          {currentUserName[0]}
          {currentUserSurname[0]}
        </Avatar>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label style={{ fontSize: 15, color: "black" }}>
          {currentUserName} {currentUserSurname}
        </Menu.Label>
        <Menu.Label style={{ fontSize: 13 }}>
          {auth.currentUser.email}
        </Menu.Label>
        <Divider mt={5} />
        <Menu.Item
          onClick={() => {
            auth.logout();
            navigate(routes.login);
          }}
          color="red"
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default UserMenu;
