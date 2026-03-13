import React, { useState } from "react";
import {
  IconUser,
  Icon,
  IconProps,
  IconUsersGroup,
  IconMenuDeep,
  IconReportAnalytics,
  IconApps,
} from "@tabler/icons-react";
import { Flex, Tooltip, UnstyledButton } from "@mantine/core";
import classes from "./Navbar.module.css";
import { useNavigate } from "react-router";
import routes from "../../constants/routes";
import { RiFileTextLine } from "react-icons/ri";
import UserMenu from "./UserMenu";
import toast from "react-hot-toast";
import Role from "../../enums/role";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider";

interface Link {
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  label: string;
  route: string;
}

const mainLinksMockdata: Link[] = [
  { icon: IconUser, label: "Users", route: routes.users },
  { icon: IconUsersGroup, label: "Teams", route: routes.teams },
  { icon: IconApps, label: "Projects", route: routes.projects },
  { icon: IconMenuDeep, label: "Expenses", route: routes.expenses },
  { icon: IconReportAnalytics, label: "Reports", route: routes.reports },
];

export function Navbar() {
  const [active, setActive] = useState("Releases");
  const auth = useAuthentication();

  const navigate = useNavigate();

  const handleLinkClick = (e: React.MouseEvent, link: Link) => {
    e.preventDefault();

    setActive(link.label);

    navigate(link.route);
  };

  if (!auth.currentUser) {
    toast.error("A problem occurred with the user.");
    auth.logout();
    navigate(routes.login);
    return;
  }

  const mainLinks = mainLinksMockdata
    .filter((x) =>
      auth.currentUser?.role === Role.User
        ? x.route === routes.expenses || x.route === routes.reports
        : true,
    )
    .map((link) => (
      <Tooltip
        label={link.label}
        position="right"
        withArrow
        transitionProps={{ duration: 0 }}
        key={link.label}
      >
        <UnstyledButton
          onClick={(e) => handleLinkClick(e, link)}
          className={classes.mainLink}
          data-active={link.label === active || undefined}
        >
          <link.icon size={25} stroke={1.7} />
        </UnstyledButton>
      </Tooltip>
    ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.wrapper}>
        <div className={classes.aside}>
          <div className={classes.logo}>
            <RiFileTextLine size={30} color="green" />
          </div>
          <Flex justify={"center"} direction={"column"}>
            {mainLinks}
            <Flex style={{ bottom: 15, position: "absolute" }}>
              <UserMenu />
            </Flex>
          </Flex>
        </div>
      </div>
    </nav>
  );
}
