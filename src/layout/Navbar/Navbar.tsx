import React from "react";
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
import { useNavigate, useLocation } from "react-router";
import routes from "../../constants/routes";
import { RiFileTextLine } from "react-icons/ri";
import UserMenu from "./UserMenu";
import Role from "../../enums/role";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider";
import { t } from "i18next";
import Dictionary from "../../helpers/translation/dictionary";

interface Link {
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  label: string;
  route: string;
}

const mainLinksMockdata: Link[] = [
  { icon: IconUser, label: t(Dictionary.Common.USERS), route: routes.users },
  {
    icon: IconUsersGroup,
    label: t(Dictionary.Common.TEAMS),
    route: routes.teams,
  },
  {
    icon: IconApps,
    label: t(Dictionary.Common.PROJECTS),
    route: routes.projects,
  },
  {
    icon: IconMenuDeep,
    label: t(Dictionary.Common.EXPENSES),
    route: routes.expenses,
  },
  {
    icon: IconReportAnalytics,
    label: t(Dictionary.Common.REPORTS),
    route: routes.reports,
  },
];

export function Navbar() {
  const auth = useAuthentication();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLinkClick = (e: React.MouseEvent, link: Link) => {
    e.preventDefault();
    navigate(link.route);
  };

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
        withinPortal={false}
        transitionProps={{ duration: 0 }}
        key={link.label}
      >
        <UnstyledButton
          onClick={(e) => handleLinkClick(e, link)}
          className={classes.mainLink}
          data-active={location.pathname === link.route || undefined}
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
            <RiFileTextLine size={30} color="#1b3d7a" />
          </div>
          <Flex justify="center" direction="column">
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
