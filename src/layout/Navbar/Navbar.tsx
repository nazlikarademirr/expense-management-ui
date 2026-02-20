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
import {
  Avatar,
  Divider,
  Flex,
  Menu,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import classes from "./Navbar.module.css";
import { useNavigate } from "react-router";
import routes from "../../constants/routes";
import { RiFileTextLine } from "react-icons/ri";
import { useAuth } from "../../AuthProvider";

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

  const auth = useAuth();

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
          <div className={classes.logo}>
            <RiFileTextLine size={30} color="green" />
          </div>
          <Flex justify={"center"} direction={"column"}>
            {mainLinks}
            <Flex style={{ bottom: 15, position: "absolute" }}>
              <Menu shadow="md">
                <Menu.Target>
                  <Avatar ml={3} radius={"xl"} color="cyan">
                    {auth.currentUser?.name.toUpperCase()[0]}
                    {auth.currentUser?.surname.toUpperCase()[0]}
                  </Avatar>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label style={{ fontSize: 15, color: "black" }}>
                    {auth.currentUser?.name.toUpperCase()}{" "}
                    {auth.currentUser?.surname.toUpperCase()}
                  </Menu.Label>
                  <Menu.Label style={{ fontSize: 13 }}>
                    {auth.currentUser?.email}
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
            </Flex>
          </Flex>
        </div>
      </div>
    </nav>
  );
}
