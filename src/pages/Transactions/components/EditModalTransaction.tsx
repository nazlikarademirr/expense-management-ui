import { Button, Flex, NumberInput, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { useEffect, useRef, useState } from "react";
import { Transaction } from "../../../types/transaction.ts";

interface EditModalTransaction {
  editedTransaction: Transaction;
  updateTransaction: (trans: Transaction) => void;
}

function EditModalTransaction({
  editedTransaction,
  updateTransaction,
}: EditModalTransaction) {
  const [transaction, setTransaction] = useState<Transaction>({
    id: editedTransaction.id,
    user: editedTransaction.user,
    date: editedTransaction.date,
    amount: editedTransaction.amount,
    description: editedTransaction.description,
  });

  const userInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();

    updateTransaction(transaction);

    modals.closeAll();
  };

  useEffect(() => {
    if (userInputRef.current) {
      userInputRef.current.focus();
    }
  }, []);

  return (
    <Flex direction={"column"} gap={10}>
      <TextInput
        ref={userInputRef}
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
      <Button onClick={(e) => handleSave(e)}>Edit</Button>
    </Flex>
  );
}

export default EditModalTransaction;