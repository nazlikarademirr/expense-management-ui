import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  NumberInput,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { getTransactions } from "../../server.ts";
import { Transaction } from "../../types/transaction.ts";
import EditModalTransaction from "./components/EditModalTransaction.tsx";
import useTransactions from "./hooks/useTransactions.tsx";

function Transactions() {
  const [transaction, setTransaction] = useState<Transaction>({
    id: crypto.randomUUID(),
    user: "",
    date: new Date(),
    amount: 0,
    description: "",
  });

  const {
    transactions,
    addTransaction,
    replaceTransactions,
    updateTransaction,
    deleteTransaction,
  } = useTransactions({ setTransaction });

  const openEditModal = (transaction: Transaction) => {
    modals.open({
      title: "Edit Transaction",
      size: "xl",
      children: (
        <EditModalTransaction
          editedTransaction={transaction}
          updateTransaction={updateTransaction}
        />
      ),
    });
  };

  const fetchTransactions = () => {
    const transactions = getTransactions();

    replaceTransactions(transactions);
  };

  const memoizedTransactions = useMemo(
    () =>
      transactions.map((x) => (
        <Table.Tr key={x.id}>
          <Table.Td>{x.user}</Table.Td>
          <Table.Td>{x.amount}</Table.Td>
          <Table.Td>{x.description}</Table.Td>
          <Table.Td>{x.date.toLocaleString()}</Table.Td>
          <Table.Td>
            <Flex justify={"center"} gap={5}>
              <ActionIcon
                onClick={(_) => deleteTransaction(x.id)}
                variant={"light"}
                color={"red"}
              >
                <IconTrash />
              </ActionIcon>
              <ActionIcon
                onClick={(_) => openEditModal(x)}
                variant={"light"}
                color={"blue"}
              >
                <IconEdit />
              </ActionIcon>
            </Flex>
          </Table.Td>
        </Table.Tr>
      )),
    [transactions],
  );

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div>
      <Title order={3}>Transactions</Title>
      <Divider my={15} />
      <Card shadow={"md"} radius={"md"} withBorder>
        <Flex gap={10} direction={"column"}>
          <Group grow>
            <TextInput
              value={transaction.user}
              onChange={(e) =>
                setTransaction({ ...transaction, user: e.currentTarget.value })
              }
              label={"User"}
            />
            <NumberInput
              value={transaction.amount}
              onChange={(e) =>
                setTransaction({
                  ...transaction,
                  amount: typeof e === "string" ? 0 : e,
                })
              }
              label={"Amount"}
            />
            <TextInput
              value={transaction.description}
              onChange={(e) =>
                setTransaction({
                  ...transaction,
                  description: e.currentTarget.value,
                })
              }
              label={"Description"}
            />
            <DatePickerInput
              value={transaction.date}
              onChange={(e) =>
                setTransaction({ ...transaction, date: e ? e : new Date() })
              }
              label={"Date"}
            />
          </Group>
          <Button
            onClick={(e) => addTransaction(transaction)}
            variant={"light"}
          >
            Add New Transaction
          </Button>
        </Flex>
      </Card>
      <Table
        stickyHeader
        highlightOnHover
        withTableBorder
        withColumnBorders
        mt={16}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>User</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{memoizedTransactions}</Table.Tbody>
      </Table>
    </div>
  );
}

export default Transactions;