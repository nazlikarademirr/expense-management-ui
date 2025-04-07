import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Navbar } from "./Navbar/Navbar.tsx";

interface MainProps {
  children: React.ReactNode;
}

function Main({ children }: MainProps) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      layout="default"
      navbar={{
        width: 50,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
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