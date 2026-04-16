import { Anchor, Avatar, Divider, Menu, Select, Title } from "@mantine/core";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider";
import { useNavigate } from "react-router";
import routes from "../../constants/routes";
import { modals } from "@mantine/modals";
import ChangePasswordModal from "../../pages/Users/components/ChangePasswordModal";
import i18n from "../../helpers/translation/i18n";
import { useEffect, useState } from "react";

function UserMenu() {
  const auth = useAuthentication();
  const navigate = useNavigate();

  const [language, setLanguage] = useState<string | null>("");

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

  const handleChangeLanguage = (value: string | null) => {
    // eslint-disable-next-line no-debugger
    debugger;
    if (!value) return;
    i18n.changeLanguage(value);
    localStorage.setItem("lang", value);
    setLanguage(value);
  };

  useEffect(() => {
    setLanguage(localStorage.getItem("lang"));
  }, []);

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
        <Select
          mx={5}
          my={10}
          value={language}
          onChange={handleChangeLanguage}
          placeholder="Select Language"
          data={[
            { value: "en", label: "English" },
            { value: "tr", label: "Turkish" },
          ]}
        />
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
