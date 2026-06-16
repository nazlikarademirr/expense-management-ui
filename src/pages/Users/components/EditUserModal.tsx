import { useEffect, useRef, useState } from "react";
import { modals } from "@mantine/modals";
import {
  Button,
  ComboboxItem,
  Flex,
  Group,
  Radio,
  Select,
  TextInput,
} from "@mantine/core";
import userSchema, {
  User,
  UserRequest,
  UserResponse,
} from "../../../types/user.types";
import { useForm } from "@mantine/form";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request-type";
import toast from "react-hot-toast";
import { genders, roles } from "../../../constants/static-data";
import { SelectItem } from "../../../types/select-item.types";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useTranslation } from "react-i18next";
import Dictionary from "../../../helpers/translation/dictionary";

interface EditUserProps {
  user: User;
  activeTeamSelectData: SelectItem[];
  updateUser: (userForm: User) => void;
  checkIfUserIsValid: (user: User) => boolean;
}

const MIN_INPUT_HEIGHT = 80;

function EditUserModal({
  user,
  activeTeamSelectData,
  updateUser,
  checkIfUserIsValid,
}: EditUserProps) {
  const { handleDataRequest } = useRequestHandler();

  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);

  const userForm = useForm({
    initialValues: {
      ...user,
    },
    validate: zod4Resolver(userSchema),
  });

  const initialValues = useRef<User>({
    ...userForm.values,
  });

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    setIsLoading(true);

    e.preventDefault();

    userForm.validate();

    if (!userForm.isValid()) {
      setIsLoading(false);
      return;
    }

    if (!checkIfUserIsValid(userForm.values)) {
      setIsLoading(false);
      return;
    }

    const userRequest: UserRequest = {
      name: userForm.values.name,
      surname: userForm.values.surname,
      teamId: userForm.values.teamId ? userForm.values.teamId : "",
      gender: Number(userForm.values.gender),
      cardNumber: userForm.values.cardNumber,
      email: userForm.values.email,
      password: initialValues.current.password,
      role: Number(userForm.values.role),
      temporaryPassword: null,
      hasTemporaryPassword: false,
      isActive: userForm.values.isActive,
    };

    const response = await handleDataRequest<UserRequest, UserResponse>(
      `${urls.user}/${user.id}`,
      RequestType.Put,
      userRequest,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    initialValues.current = {
      ...userForm.values,
    };

    updateUser({
      ...userForm.values,
    });

    toast.success(t(Dictionary.User.UPDATED));

    modals.closeAll();

    setIsLoading(false);
  };

  const changeTeam = (team: ComboboxItem) => {
    userForm.setFieldValue("teamId", team.value);
    userForm.setFieldValue("teamName", team.label);
  };

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  return (
    <Flex direction={"column"} gap={10}>
      <TextInput
        ref={nameInputRef}
        {...userForm.getInputProps("name")}
        style={{ minHeight: MIN_INPUT_HEIGHT }}
        withAsterisk
        label={t(Dictionary.User.NAME)}
      />
      <TextInput
        {...userForm.getInputProps("surname")}
        style={{ minHeight: MIN_INPUT_HEIGHT }}
        withAsterisk
        label={t(Dictionary.User.SURNAME)}
      />
      <Select
        {...userForm.getInputProps("teamId")}
        onChange={(_, option) => changeTeam(option)}
        style={{ minHeight: MIN_INPUT_HEIGHT }}
        withAsterisk
        data={activeTeamSelectData}
        searchable
        label={t(Dictionary.User.TEAM_NAME)}
        placeholder={t(Dictionary.User.SELECT_TEAM)}
      />
      <Radio.Group
        label={t(Dictionary.User.GENDER)}
        style={{ flexGrow: 1, minHeight: MIN_INPUT_HEIGHT }}
        {...userForm.getInputProps("gender")}
      >
        <Group mt="xs">
          {genders.map((x) => (
            <Radio
              value={x.value}
              label={x.label}
              onClick={() => {
                if (userForm.values.gender === x.value) {
                  userForm.setFieldValue("gender", null);
                }
              }}
            ></Radio>
          ))}
        </Group>
      </Radio.Group>
      <TextInput
        {...userForm.getInputProps("cardNumber")}
        style={{ minHeight: MIN_INPUT_HEIGHT }}
        label={t(Dictionary.User.CARD_NUMBER)}
      />
      <TextInput
        {...userForm.getInputProps("email")}
        style={{ minHeight: MIN_INPUT_HEIGHT }}
        withAsterisk
        label={t(Dictionary.User.EMAIL)}
      />
      <Radio.Group
        label={t(Dictionary.User.ROLE)}
        withAsterisk
        style={{ flexGrow: 1, minHeight: MIN_INPUT_HEIGHT }}
        {...userForm.getInputProps("role")}
      >
        <Group mt="xs">
          {roles.map((x) => (
            <Radio value={x.value} label={x.label}></Radio>
          ))}
        </Group>
      </Radio.Group>

      <Button
        variant={"light"}
        disabled={!userForm.isDirty()}
        onClick={(e) => handleSave(e)}
        loading={isLoading}
      >
        {t(Dictionary.Common.EDIT)}
      </Button>
    </Flex>
  );
}

export default EditUserModal;
