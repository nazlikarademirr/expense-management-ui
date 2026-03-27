import { Anchor, Avatar, Divider, Menu, Title } from "@mantine/core";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider";
import { useNavigate } from "react-router";
import routes from "../../constants/routes";
import { modals } from "@mantine/modals";
import ChangePasswordModal from "../../pages/Users/components/ChangePasswordModal";

function UserMenu() {
  const auth = useAuthentication();
  const navigate = useNavigate();

  const currentUserName = auth.currentUser
    ? auth.currentUser.name.toUpperCase()
    : "";
  const currentUserSurname = auth.currentUser
    ? auth.currentUser.surname.toUpperCase()
    : "";

  const openChangePasswordModal = () => {
    modals.open({
      title: <Title order={5}>Change Password</Title>,
      size: "md",
      children: <ChangePasswordModal currentUserId={auth.currentUser?.id} />,
    });
  };

  return (
    <Menu shadow="md">
      <Menu.Target>
        <Avatar ml={3} radius="xl" color="#3f38c8">
          {currentUserName[0]}
          {currentUserSurname[0]}
        </Avatar>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label style={{ fontSize: 15, color: "black" }}>
          {currentUserName} {currentUserSurname}
        </Menu.Label>
        <Menu.Label style={{ fontSize: 13 }}>
          {auth.currentUser?.email}
        </Menu.Label>
        <Anchor
          px={12}
          style={{ fontSize: 13 }}
          onClick={() => openChangePasswordModal()}
        >
          Change Password
        </Anchor>
        <Divider my={4} />
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
