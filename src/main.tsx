import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import AppRouter from "./AppRouter.tsx";
import { Toaster } from "react-hot-toast";
import { AuthenticationProvider } from "./contexts/AuthenticationContext/AuthenticationProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <MantineProvider>
    <Notifications />
    <ModalsProvider>
      <AuthenticationProvider>
        <AppRouter />
        <Toaster />
      </AuthenticationProvider>
    </ModalsProvider>
  </MantineProvider>,
);
