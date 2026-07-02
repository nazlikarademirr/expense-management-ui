import { Button, Flex, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request-type";
import { modals } from "@mantine/modals";
import toast from "react-hot-toast";
import z from "zod/v4";
import { zod4Resolver } from "mantine-form-zod-resolver";
import Dictionary from "../../../helpers/translation/dictionary";
import { useTranslation } from "react-i18next";

interface ResetPasswordModalProps {
  email: string;
}

function ResetPasswordModal({ email }: ResetPasswordModalProps) {
  const { handleDataRequest } = useRequestHandler();
  const { t } = useTranslation();

  const form = useForm({
    initialValues: { email: email },
    validate: zod4Resolver(
      z.object({
        email: z
          .email()
          .trim()
          .min(1, t(Dictionary.Login.EMAIL_CANNOT_BE_EMPTY))
          .refine((v) => v.includes("@acibadem.com"), {
            message: t(Dictionary.Login.EMAIL_VALID),
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

    toast.success(t(Dictionary.Login.PASSWORD_RESETED));
  };

  return (
    <Flex direction="column" align="flex-start" gap={20}>
      {t(Dictionary.Login.PASSWORD_RESET_MESSAGE)}
      <TextInput
        label={t(Dictionary.Login.EMAIL)}
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
          {t(Dictionary.Common.APPROVE)}
        </Button>
        <Button
          onClick={() => {
            modals.closeAll();
          }}
          variant="light"
          color="red"
          w={200}
        >
          {t(Dictionary.Common.CANCEL)}
        </Button>
      </Flex>
    </Flex>
  );
}

export default ResetPasswordModal;
