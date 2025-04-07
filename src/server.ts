import { Transaction } from "./types/transaction.ts";

export const getTransactions = () => {
  const transactions: Transaction[] = [
    {
      id: crypto.randomUUID(),
      user: "John Doe",
      amount: 100,
      date: new Date(),
      description: "Payment for services",
    },
    {
      id: crypto.randomUUID(),
      user: "Jane Smith",
      amount: 200,
      date: new Date(),
      description: "Refund",
    },
    {
      id: crypto.randomUUID(),
      user: "Alice Johnson",
      amount: 150,
      date: new Date(),
      description: "Payment for goods",
    },
  ];

  return transactions;
};