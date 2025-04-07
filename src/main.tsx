import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import Main from "./layout/Main.tsx";
import Transactions from "./pages/Transactions/Transactions.tsx";

createRoot(document.getElementById("root")!).render(
    <MantineProvider>
      <Notifications />
      <ModalsProvider>
        <Main>
          <Transactions />
        </Main>
      </ModalsProvider>
    </MantineProvider>
);