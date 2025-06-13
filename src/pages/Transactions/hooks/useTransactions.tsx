import { SetStateAction, useState } from "react";
import { Transaction } from "../../../types/transaction.ts";

interface UseTransactionProps {
  setTransaction: React.Dispatch<SetStateAction<Transaction>>;
}

function useTransactions({ setTransaction }: UseTransactionProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (transaction: Transaction) => {
    const newTransaction = {
      id: crypto.randomUUID(),
      user: transaction.user,
      amount: transaction.amount,
      date: transaction.date,
      description: transaction.description,
    };

    setTransactions([newTransaction, ...transactions]);

    setTransaction({
      id: crypto.randomUUID(),
      user: "",
      date: new Date(),
      amount: 0,
      description: "",
    });
  };

  const deleteTransaction = (id: string) => {
    const transactionsAfterDelete = transactions.filter((x) => x.id !== id);

    setTransactions(transactionsAfterDelete);
  };

  const updateTransaction = (transaction: Transaction) => {
    const updatedTransactions = transactions.map((x) => {
      if (x.id === transaction.id) {
        return transaction;
      }

      return x;
    });

    setTransactions(updatedTransactions);
  };

  const replaceTransactions = (list: Transaction[]) => {
    setTransactions(list);
  };

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    replaceTransactions,
  };
}

export default useTransactions;
