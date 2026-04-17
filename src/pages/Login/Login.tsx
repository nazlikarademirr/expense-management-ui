import {
  Anchor,
  Button,
  Card,
  Flex,
  PasswordInput,
  TextInput,
  Title,
} from "@mantine/core";
import useRequestHandler from "../../hooks/useRequestHandler";
import urls from "../../constants/urls";
import RequestType from "../../request-handler/request-type";
import toast from "react-hot-toast";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router";
import routes from "../../constants/routes";
import {
  AuthenticationRequest,
  authenticationRequestSchema,
  AuthenticationResponse,
} from "../../types/authentication.types";
import { useState } from "react";
import { useAuthentication } from "../../contexts/AuthenticationContext/AuthenticationProvider";
import { modals } from "@mantine/modals";
import { zod4Resolver } from "mantine-form-zod-resolver";
import ResetPasswordModal from "./components/ResetPasswordModal";
import ChangePasswordModal from "../Users/components/ChangePasswordModal";
import Dictionary from "../../helpers/translation/dictionary";
import { useTranslation } from "react-i18next";

function Login() {
  const auth = useAuthentication();
  const { t } = useTranslation();

  const { handleDataRequest } = useRequestHandler();

  const navigation = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AuthenticationRequest>({
    initialValues: { email: "", password: "" },
    validate: zod4Resolver(authenticationRequestSchema),
  });

  const openPasswordResetModal = () => {
    modals.open({
      title: <Title order={5}>{t(Dictionary.Login.RESET_PASSWORD)}</Title>,
      size: "md",
      children: <ResetPasswordModal email={form.values.email} />,
    });
  };

  const handleLogin = async () => {
    setIsLoading(true);

    form.validate();

    if (!form.isValid()) {
      setIsLoading(false);
      return;
    }

    const request = {
      email: form.values.email.trim(),
      password: form.values.password.trim(),
    };

    const response = await handleDataRequest<
      AuthenticationRequest,
      AuthenticationResponse
    >(urls.login, RequestType.Post, request);

    if (!response.isSuccess) {
      toast.error(t(Dictionary.Login.EMAIL_OR_PASSWORD_WRONG));
      setIsLoading(false);
      return;
    }

    const currentUser = auth.login(response.value.accessToken);

    navigation(routes.expenses);

    const hasTemporaryPassword =
      currentUser.hasTemporaryPassword === "true" ? true : false;

    if (hasTemporaryPassword) {
      changePasswordModal(currentUser.id);
      return;
    }

    setIsLoading(false);
  };

  const changePasswordModal = async (currentUserId: string) => {
    modals.open({
      title: <Title order={5}>{t(Dictionary.Login.RESET_PASSWORD)}</Title>,
      size: "md",
      children: <ChangePasswordModal currentUserId={currentUserId} />,
      closeOnClickOutside: false,
      closeOnEscape: false,
      withCloseButton: false,
    });
  };

  return (
    <Flex direction="column" align="center" px="md" mt={220}>
      <Title order={1} mb={30} ta="center">
        {t(Dictionary.Common.EXPENSE_MANAGEMENT)}
      </Title>
      <Card
        withBorder
        shadow="xs"
        radius="md"
        w="100%"
        maw={500}
        style={{ padding: 40 }}
      >
        <Flex direction="column" gap={20} w="100%">
          <TextInput
            w="100%"
            label={t(Dictionary.Login.EMAIL)}
            withAsterisk
            {...form.getInputProps("email")}
            style={{ minHeight: 80 }}
          />
          <PasswordInput
            w="100%"
            label={t(Dictionary.Login.PASSWORD)}
            withAsterisk
            {...form.getInputProps("password")}
            style={{ minHeight: 80 }}
          />
          <Anchor
            style={{ fontSize: 15, alignSelf: "flex-end" }}
            onClick={() => openPasswordResetModal()}
          >
            {t(Dictionary.Login.FORGOT_MY_PASSWORD)}
          </Anchor>
          <Button
            w="100%"
            variant="light"
            loading={isLoading}
            onClick={() => handleLogin()}
          >
            {t(Dictionary.Login.LOGIN)}
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
}

export default Login;
