import { Anchor, Avatar, Divider, Menu, Select, Title } from "@mantine/core";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider";
import { useNavigate } from "react-router";
import routes from "../../constants/routes";
import { modals } from "@mantine/modals";
import ChangePasswordModal from "../../pages/Users/components/ChangePasswordModal";
import i18n from "../../helpers/translation/i18n";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Dictionary from "../../helpers/translation/dictionary";

function UserMenu() {
  const auth = useAuthentication();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [language, setLanguage] = useState<string | null>("");

  const currentUserName = auth.currentUser
    ? auth.currentUser.name.toUpperCase()
    : "";
  const currentUserSurname = auth.currentUser
    ? auth.currentUser.surname.toUpperCase()
    : "";

  const openChangePasswordModal = () => {
    modals.open({
      title: <Title order={5}>{t(Dictionary.User.CHANGE_PASSWORD)}</Title>,
      size: "md",
      children: <ChangePasswordModal currentUserId={auth.currentUser?.id} />,
    });
  };

  const handleChangeLanguage = (value: string | null) => {
    if (!value) return;
    i18n.changeLanguage(value);
    localStorage.setItem("lang", value);
    setLanguage(value);
  };

  useEffect(() => {
    setLanguage(localStorage.getItem("lang"));
  }, []);

  return (
    <Menu shadow="md" withinPortal={false}>
      <Menu.Target>
        <Avatar ml={3} radius="xl" color="#1b3d7a">
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
          {t(Dictionary.UserMenu.CHANGE_PASSWORD)}
        </Anchor>
        <Select
          mx={5}
          my={10}
          value={language}
          onChange={handleChangeLanguage}
          placeholder={t(Dictionary.UserMenu.SELECT_LANGUAGE)}
          data={[
            { value: "en", label: t(Dictionary.UserMenu.ENGLISH) },
            { value: "tr", label: t(Dictionary.UserMenu.TURKISH) },
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
          {t(Dictionary.UserMenu.LOGOUT)}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default UserMenu;
