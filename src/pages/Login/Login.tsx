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

function Login() {
  const auth = useAuthentication();

  const { handleDataRequest } = useRequestHandler();

  const navigation = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AuthenticationRequest>({
    initialValues: { email: "", password: "" },
    validate: zod4Resolver(authenticationRequestSchema),
  });

  const openPasswordResetModal = () => {
    modals.open({
      title: <Title order={5}>Change Password</Title>,
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
      email: form.values.email,
      password: form.values.password,
    };

    const response = await handleDataRequest<
      AuthenticationRequest,
      AuthenticationResponse
    >(urls.login, RequestType.Post, request);

    if (!response.isSuccess) {
      toast.error("Email or password is wrong!");
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
      title: <Title order={5}>Reset Password</Title>,
      size: "md",
      children: <ChangePasswordModal currentUserId={currentUserId} />,
      closeOnClickOutside: false,
      closeOnEscape: false,
      withCloseButton: false,
    });
  };

  return (
    <Flex direction="column" align="center" p={300}>
      <Title order={1} mb={10}>
        Expense Management
      </Title>
      <Card
        withBorder
        shadow="xs"
        radius="md"
        w={600}
        style={{ alignItems: "center", padding: 50 }}
      >
        <Flex direction="column" gap={20} style={{ alignItems: "flex-end" }}>
          <TextInput
            w={500}
            label="Email"
            withAsterisk
            {...form.getInputProps("email")}
            style={{ minHeight: 80 }}
          />
          <PasswordInput
            w={500}
            label="Password"
            withAsterisk
            {...form.getInputProps("password")}
            style={{ minHeight: 80 }}
          />
          <Anchor
            style={{ fontSize: 15 }}
            onClick={() => openPasswordResetModal()}
          >
            Forgot My Password
          </Anchor>
          <Button
            w={500}
            variant="light"
            loading={isLoading}
            onClick={() => handleLogin()}
          >
            Login
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
}

export default Login;
