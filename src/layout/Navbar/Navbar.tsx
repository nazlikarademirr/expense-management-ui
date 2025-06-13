import React, { useState } from "react";
import {
  IconUser,
  IconHome2,
  Icon,
  IconProps,
  IconUsersGroup,
  IconMenuDeep,
  IconReportAnalytics,
  IconFileExcel,
  IconApps,
} from "@tabler/icons-react";
import { Tooltip, UnstyledButton } from "@mantine/core";
import classes from "./Navbar.module.css";
import { useLocation, useNavigate } from "react-router";
import routes from "../../constants/routes";

interface Link {
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  label: string;
  route: string;
}

const mainLinksMockdata: Link[] = [
  { icon: IconHome2, label: "Transactions", route: routes.home },
  { icon: IconUser, label: "Users", route: routes.users },
  { icon: IconUsersGroup, label: "Teams", route: routes.teams },
  { icon: IconApps, label: "Projects", route: routes.projects },
  { icon: IconMenuDeep, label: "Expenses", route: routes.expenses },
  { icon: IconReportAnalytics, label: "Reports", route: routes.reports },
  {
    icon: IconFileExcel,
    label: "Download Expense Excel",
    route: routes.expenseExcel,
  },
];

export function Navbar() {
  const location = useLocation();

  const [active, setActive] = useState("Releases");

  const navigate = useNavigate();

  const handleLinkClick = (e: React.MouseEvent, link: Link) => {
    e.preventDefault();

    setActive(link.label);

    navigate(link.route);
  };

  const mainLinks = mainLinksMockdata.map((link) => (
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
          <div className={classes.logo}>Expense</div>
          {mainLinks}
        </div>
      </div>
    </nav>
  );
}
