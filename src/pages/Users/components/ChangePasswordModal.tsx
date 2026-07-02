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
import { useTranslation } from "react-i18next";
import Dictionary from "../../../helpers/translation/dictionary";
import { t } from "i18next";

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
    .min(1, t(Dictionary.User.CURRENT_PASSWORD_CANNOT_BE_EMPTY)),
  newPassword: z
    .string()
    .trim()
    .min(1, t(Dictionary.User.NEW_PASSWORD_CANNOT_BE_EMPTY)),
  newPasswordAgain: z
    .string()
    .trim()
    .min(1, t(Dictionary.User.NEW_PASSWORD_AGAIN_CANNOT_BE_EMPTY)),
});

function ChangePasswordModal({ currentUserId }: ChangePasswordModalProps) {
  const { handleDataRequest } = useRequestHandler();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

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
      toast.error(t(Dictionary.User.PROBLEM_OCCURRED_WITH_USER));
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
      toast.error(t(Dictionary.User.PASSWORDS_NOT_MATCH));
      setIsLoading(false);
      return;
    }

    const response = await handleDataRequest<object, never>(
      urls.userPassword,
      RequestType.Post,
      request,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    modals.closeAll();

    toast.success(t(Dictionary.User.PASSWORD_SUCCESSFULLY_UPDATED));

    setIsLoading(false);
  };

  return (
    <Flex direction="column" gap={20}>
      <PasswordInput
        {...form.getInputProps("currentPassword")}
        label={t(Dictionary.User.CURRENT_PASSWORD)}
        withAsterisk
        style={{ minHeight: 80 }}
      />
      <PasswordInput
        {...form.getInputProps("newPassword")}
        label={t(Dictionary.User.NEW_PASSWORD)}
        withAsterisk
        style={{ minHeight: 80 }}
      />
      <PasswordInput
        {...form.getInputProps("newPasswordAgain")}
        label={t(Dictionary.User.NEW_PASSWORD_AGAIN)}
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
          {t(Dictionary.Common.SAVE)}
        </Button>
      </Flex>
    </Flex>
  );
}

export default ChangePasswordModal;
