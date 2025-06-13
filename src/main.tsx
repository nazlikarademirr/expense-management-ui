import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import AppRouter from "./AppRouter.tsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <MantineProvider>
    <Notifications />
    <ModalsProvider>
      <AppRouter />
      <Toaster />
    </ModalsProvider>
  </MantineProvider>
);
