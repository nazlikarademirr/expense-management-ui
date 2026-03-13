import { Anchor, Avatar, Divider, Menu, Title } from "@mantine/core";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider";
import { useNavigate } from "react-router";
import routes from "../../constants/routes";
import { modals } from "@mantine/modals";
import ChangePasswordModal from "../../pages/Users/components/ChangePasswordModal";
import toast from "react-hot-toast";

function UserMenu() {
  const auth = useAuthentication();
  const navigate = useNavigate();

  if (!auth.currentUser) {
    auth.logout();
    navigate(routes.login);
    toast.error("A problem occurred with the user.");
    return null;
  }

  const currentUserName = auth.currentUser.name.toUpperCase();
  const currentUserSurname = auth.currentUser.surname.toUpperCase();

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
        <Avatar ml={3} radius="xl" color="cyan">
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
        <Anchor
          px={12}
          py={5}
          style={{ fontSize: 13 }}
          onClick={() => openChangePasswordModal()}
        >
          Change Password
        </Anchor>
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
