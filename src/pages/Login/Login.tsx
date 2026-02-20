import {
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
  AuthenticationResponse,
} from "../../types/authentication.types";
import { useState } from "react";
import { useAuth } from "../../AuthProvider";

function Login() {
  const auth = useAuth();

  const { handleDataRequest } = useRequestHandler();

  const navigation = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AuthenticationRequest>({
    initialValues: { email: "", password: "" },
  });

  const handleLogin = async () => {
    setIsLoading(true);

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

    auth.login(response.value.accessToken);

    navigation(routes.expenses);

    setIsLoading(false);
  };

  return (
    <Flex direction={"column"} align={"center"} p={300}>
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
        <Flex direction="column" gap={20}>
          <TextInput
            w={500}
            label="Email"
            withAsterisk
            {...form.getInputProps("email")}
          ></TextInput>
          <PasswordInput
            w={500}
            label="Password"
            withAsterisk
            {...form.getInputProps("password")}
          ></PasswordInput>
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
