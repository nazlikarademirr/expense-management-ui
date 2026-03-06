import { Button, Flex, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request-type";
import { modals } from "@mantine/modals";
import toast from "react-hot-toast";
import z from "zod/v4";
import { zod4Resolver } from "mantine-form-zod-resolver";

interface ResetPasswordModalProps {
  email: string;
}

function ResetPasswordModal({ email }: ResetPasswordModalProps) {
  const { handleDataRequest } = useRequestHandler();

  const form = useForm({
    initialValues: { email: email },
    validate: zod4Resolver(
      z.object({
        email: z
          .email()
          .trim()
          .min(1, "Email cannot be empty.")
          .refine((v) => v.includes("@acibadem.com"), {
            message: "Please enter your Acıbadem email address.",
          }),
      }),
    ),
  });

  const resetPassword = async () => {
    form.validate();

    if (!form.isValid()) return;

    const response = await handleDataRequest<string, never>(
      urls.temporaryPassword,
      RequestType.Post,
      undefined,
      { email: form.values.email },
    );

    if (!response.isSuccess) return;

    modals.closeAll();
    form.reset();
    toast.success(
      "Your password has been successfully reset. Please contact your administrator.",
    );
  };

  return (
    <Flex direction="column" align="flex-start" gap={20}>
      Your password will be reset. Do you approve?
      <TextInput
        label="Email"
        withAsterisk
        w={410}
        style={{ minHeight: 80 }}
        {...form.getInputProps("email")}
      />
      <Flex direction="row" gap={10}>
        <Button
          onClick={() => resetPassword()}
          variant="light"
          color="blue"
          w={200}
        >
          Approve
        </Button>
        <Button
          onClick={() => {
            modals.closeAll();
          }}
          variant="light"
          color="red"
          w={200}
        >
          Cancel
        </Button>
      </Flex>
    </Flex>
  );
}

export default ResetPasswordModal;
