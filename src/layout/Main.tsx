import { AppShell } from "@mantine/core";
import { Navbar } from "./Navbar/Navbar.tsx";

interface MainProps {
  children: React.ReactNode;
}

function Main({ children }: MainProps) {
  return (
    <AppShell
      layout="default"
      navbar={{
        width: 60,
        breakpoint: "sm",
      }}
      padding="md"
    >
      <AppShell.Navbar>
        <Navbar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

export default Main;
