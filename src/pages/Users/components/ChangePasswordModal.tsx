import { Button, Flex, PasswordInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { useState } from "react";
import toast from "react-hot-toast";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request-type";
import z from "zod/v4";
import { zod4Resolver } from "mantine-form-zod-resolver";

interface ChangePasswordModalProps {
  currentUserId: string | undefined;
}

type ChangeUserPassword = {
  currentPassword: string;
  newPassword: string;
  newPasswordAgain: string;
};

const changeUserPasswordSchema = z.object({
  currentPassword: z
    .string()
    .trim()
    .min(1, "Current password cannot be empty."),
  newPassword: z.string().trim().min(1, "New password cannot be empty."),
  newPasswordAgain: z
    .string()
    .trim()
    .min(1, "New password again cannot be empty."),
});

function ChangePasswordModal({ currentUserId }: ChangePasswordModalProps) {
  const { handleDataRequest } = useRequestHandler();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChangeUserPassword>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordAgain: "",
    },
    validate: zod4Resolver(changeUserPasswordSchema),
  });

  const handleSave = async () => {
    if (!currentUserId) {
      toast.error("A problem occurred with the user.");
      return;
    }

    setIsLoading(true);

    form.validate();

    if (!form.isValid()) {
      setIsLoading(false);
      return;
    }

    const request = {
      userId: currentUserId,
      currentPassword: form.values.currentPassword,
      newPassword: form.values.newPassword,
      newPasswordAgain: form.values.newPasswordAgain,
    };

    if (form.values.newPassword !== form.values.newPasswordAgain) {
      toast.error(
        "The new password and the password confirmation do not match.",
      );
      setIsLoading(false);
      return;
    }

    const response = await handleDataRequest<object, never>(
      urls.userPassword,
      RequestType.Post,
      request,
    );

    if (!response.isSuccess) {
      toast.error("The password could not be updated.");
      return;
    }

    modals.closeAll();
    toast.success("Your password has been successfully updated.");

    setIsLoading(false);
  };

  return (
    <Flex direction="column" gap={20}>
      <PasswordInput
        {...form.getInputProps("currentPassword")}
        label="Current Password"
        withAsterisk
        style={{ minHeight: 80 }}
      />
      <PasswordInput
        {...form.getInputProps("newPassword")}
        label="New Password"
        withAsterisk
        style={{ minHeight: 80 }}
      />
      <PasswordInput
        {...form.getInputProps("newPasswordAgain")}
        label="New Password Again"
        withAsterisk
        style={{ minHeight: 80 }}
      />
      <Flex direction="row">
        <Button
          onClick={() => handleSave()}
          loading={isLoading}
          variant="light"
          color="blue"
          fullWidth
        >
          Save
        </Button>
      </Flex>
    </Flex>
  );
}

export default ChangePasswordModal;
