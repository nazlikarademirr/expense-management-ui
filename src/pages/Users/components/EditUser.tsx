import {
  Autocomplete,
  Badge,
  Button,
  Flex,
  Popover,
  Select,
  Table,
  TextInput,
} from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";
import { RiLockPasswordLine } from "react-icons/ri";
import Dictionary from "../../../helpers/translation/dictionary.ts";
import { roles } from "../../../constants/static-data.ts";
import { User } from "../../../types/user.types.ts";
import { SelectItem } from "../../../types/select-item.types.ts";
import { useTranslation } from "react-i18next";

interface EditUserProps {
  user: User;
  isEditing: boolean;
  editingUserData: User | null;
  setEditingUserData: React.Dispatch<React.SetStateAction<User | null>>;
  editErrors: Record<string, string>;
  setEditErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  titleSelectData: SelectItem[];
  activeTeamSelectData: SelectItem[];
  isLoading: boolean;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleEditClick: (user: User) => void;
  openUserActivityModal: (user: User) => void;
  openTemporaryPasswordModal: (user: User) => void;
}

const EditUser = ({
  user: x,
  isEditing,
  editingUserData,
  setEditingUserData,
  editErrors,
  setEditErrors,
  titleSelectData,
  activeTeamSelectData,
  isLoading,
  handleSaveEdit,
  handleCancelEdit,
  handleEditClick,
  openUserActivityModal,
  openTemporaryPasswordModal,
}: EditUserProps) => {
  const { t } = useTranslation();

  return (
    <Table.Tr key={x.id}>
      <Table.Td>
        {isEditing ? (
          <Popover
            opened={!!editErrors.name}
            position="bottom"
            width="target"
            withArrow
            withinPortal={false}
            zIndex={200}
          >
            <Popover.Target>
              <TextInput
                w="100%"
                value={editingUserData?.name ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingUserData({
                    ...editingUserData!,
                    name: val,
                  });
                  if (editErrors.name && val.trim().length >= 2)
                    setEditErrors((prev) => ({ ...prev, name: "" }));
                }}
                error={!!editErrors.name}
              />
            </Popover.Target>
            <Popover.Dropdown
              p={6}
              styles={{
                dropdown: {
                  backgroundColor: "#f0f4f8",
                  color: "red",
                  fontSize: "13px",
                  textAlign: "center",
                  border: "1px solid red",
                },
                arrow: {
                  backgroundColor: "#f0f4f8",
                  borderColor: "red",
                },
              }}
            >
              {editErrors.name}
            </Popover.Dropdown>
          </Popover>
        ) : (
          x.name
        )}
      </Table.Td>
      <Table.Td>
        {isEditing ? (
          <Popover
            opened={!!editErrors.surname}
            position="bottom"
            width="target"
            withArrow
            withinPortal={false}
            zIndex={200}
          >
            <Popover.Target>
              <TextInput
                w="100%"
                value={editingUserData?.surname ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingUserData({
                    ...editingUserData!,
                    surname: val,
                  });
                  if (editErrors.surname && val.trim().length >= 2)
                    setEditErrors((prev) => ({ ...prev, surname: "" }));
                }}
                error={!!editErrors.surname}
              />
            </Popover.Target>
            <Popover.Dropdown
              p={6}
              styles={{
                dropdown: {
                  backgroundColor: "#f0f4f8",
                  color: "red",
                  fontSize: "13px",
                  textAlign: "center",
                  border: "1px solid red",
                },
                arrow: {
                  backgroundColor: "#f0f4f8",
                  borderColor: "red",
                },
              }}
            >
              {editErrors.surname}
            </Popover.Dropdown>
          </Popover>
        ) : (
          x.surname
        )}
      </Table.Td>
      <Table.Td>
        {isEditing ? (
          <Popover
            opened={!!editErrors.title}
            position="bottom"
            width="target"
            withArrow
            withinPortal={false}
            zIndex={200}
          >
            <Popover.Target>
              <Autocomplete
                w="100%"
                data={titleSelectData}
                value={editingUserData?.title ?? ""}
                clearable
                onChange={(val) => {
                  setEditingUserData({
                    ...editingUserData!,
                    title: val,
                  });
                  if (editErrors.title && val.trim().length >= 2)
                    setEditErrors((prev) => ({ ...prev, title: "" }));
                }}
                error={!!editErrors.title}
                comboboxProps={{ withinPortal: false, zIndex: 300 }}
              />
            </Popover.Target>
            <Popover.Dropdown
              p={6}
              styles={{
                dropdown: {
                  backgroundColor: "#f0f4f8",
                  color: "red",
                  fontSize: "13px",
                  textAlign: "center",
                  border: "1px solid red",
                },
                arrow: {
                  backgroundColor: "#f0f4f8",
                  borderColor: "red",
                },
              }}
            >
              {editErrors.title}
            </Popover.Dropdown>
          </Popover>
        ) : (
          x.title
        )}
      </Table.Td>
      <Table.Td>
        {isEditing ? (
          <Popover
            opened={!!editErrors.teamId}
            position="bottom"
            width="target"
            withArrow
            withinPortal={false}
            zIndex={200}
          >
            <Popover.Target>
              <Select
                w="100%"
                data={activeTeamSelectData}
                value={editingUserData?.teamId || null}
                onChange={(val, option) => {
                  setEditingUserData({
                    ...editingUserData!,
                    teamId: val,
                    teamName: option?.label ?? "",
                  });
                  if (editErrors.teamId && val)
                    setEditErrors((prev) => ({ ...prev, teamId: "" }));
                }}
                error={!!editErrors.teamId}
                comboboxProps={{ withinPortal: false, zIndex: 300 }}
              />
            </Popover.Target>
            <Popover.Dropdown
              p={6}
              styles={{
                dropdown: {
                  backgroundColor: "#f0f4f8",
                  color: "red",
                  fontSize: "13px",
                  textAlign: "center",
                  border: "1px solid red",
                },
                arrow: {
                  backgroundColor: "#f0f4f8",
                  borderColor: "red",
                },
              }}
            >
              {editErrors.teamId}
            </Popover.Dropdown>
          </Popover>
        ) : (
          x.teamName
        )}
      </Table.Td>
      <Table.Td>
        {isEditing ? (
          <Popover
            opened={!!editErrors.email}
            position="bottom"
            width="target"
            withArrow
            withinPortal={false}
            zIndex={200}
          >
            <Popover.Target>
              <TextInput
                w="100%"
                value={editingUserData?.email ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingUserData({
                    ...editingUserData!,
                    email: val,
                  });
                  if (
                    editErrors.email &&
                    val.trim().length >= 14 &&
                    val.includes("@acibadem.com")
                  )
                    setEditErrors((prev) => ({ ...prev, email: "" }));
                }}
                error={!!editErrors.email}
              />
            </Popover.Target>
            <Popover.Dropdown
              p={6}
              styles={{
                dropdown: {
                  backgroundColor: "#f0f4f8",
                  color: "red",
                  fontSize: "13px",
                  textAlign: "center",
                  border: "1px solid red",
                },
                arrow: {
                  backgroundColor: "#f0f4f8",
                  borderColor: "red",
                },
              }}
            >
              {editErrors.email}
            </Popover.Dropdown>
          </Popover>
        ) : (
          x.email
        )}
      </Table.Td>
      <Table.Td>
        {isEditing ? (
          <Popover
            opened={!!editErrors.role}
            position="bottom"
            width="target"
            withArrow
            withinPortal={false}
            zIndex={200}
          >
            <Popover.Target>
              <Select
                w="100%"
                data={roles.map((r) => ({
                  value: r.value.toString(),
                  label: r.label,
                }))}
                value={editingUserData?.role?.toString() || null}
                onChange={(val) => {
                  setEditingUserData({
                    ...editingUserData!,
                    role: val ?? "",
                  });
                  if (editErrors.role && (val || val === "0"))
                    setEditErrors((prev) => ({ ...prev, role: "" }));
                }}
                error={!!editErrors.role}
                comboboxProps={{ withinPortal: false, zIndex: 300 }}
              />
            </Popover.Target>
            <Popover.Dropdown
              p={6}
              styles={{
                dropdown: {
                  backgroundColor: "#f0f4f8",
                  color: "red",
                  fontSize: "13px",
                  textAlign: "center",
                  border: "1px solid red",
                },
                arrow: {
                  backgroundColor: "#f0f4f8",
                  borderColor: "red",
                },
              }}
            >
              {editErrors.role}
            </Popover.Dropdown>
          </Popover>
        ) : (
          roles[Number(x.role)].label
        )}
      </Table.Td>
      <Table.Td>
        <Badge size="md" color={x.isActive ? "green" : "gray"} variant="light">
          {x.isActive
            ? t(Dictionary.Common.ACTIVE)
            : t(Dictionary.Common.PASSIVE)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Flex justify="center" gap={10}>
          {isEditing ? (
            <>
              <Button
                onClick={handleSaveEdit}
                variant="light"
                loading={isLoading}
              >
                {x.id === "NEW_USER" ? t(Dictionary.User.ADD_NEW) : t(Dictionary.Common.SAVE)}
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="light"
                disabled={isLoading}
                style={{ color: "red", backgroundColor: "#ffeeee" }}
              >
                {t(Dictionary.Common.CANCEL)}
              </Button>
            </>
          ) : (
            <>
              {x.hasTemporaryPassword && (
                <Button
                  onClick={() => openTemporaryPasswordModal(x)}
                  variant="light"
                  loading={isLoading}
                  disabled={editingUserData !== null}
                  style={{
                    color: "#5f3dc4",
                    backgroundColor: "#e7e2fa",
                  }}
                  leftSection={<RiLockPasswordLine size={22} />}
                >
                  {t(Dictionary.User.TEMPORARY_PASSWORD)}
                </Button>
              )}

              {x.isActive && (
                <Button
                  onClick={() => handleEditClick(x)}
                  variant="light"
                  color="blue"
                  loading={isLoading}
                  disabled={editingUserData !== null}
                  leftSection={<IconEdit size={18} />}
                >
                  {t(Dictionary.Common.EDIT)}
                </Button>
              )}

              <Button
                onClick={() => openUserActivityModal(x)}
                variant="light"
                style={
                  x.isActive
                    ? { color: "red", backgroundColor: "#ffeeee" }
                    : { color: "green", backgroundColor: "#e7ffe0" }
                }
                loading={isLoading}
                disabled={editingUserData !== null}
                leftSection={
                  x.isActive ? (
                    <IoMdRemoveCircleOutline size={20} />
                  ) : (
                    <IoMdAddCircleOutline size={20} />
                  )
                }
              >
                {x.isActive
                  ? t(Dictionary.User.DEACTIVATE)
                  : t(Dictionary.User.ACTIVATE)}
              </Button>
            </>
          )}
        </Flex>
      </Table.Td>
    </Table.Tr>
  );
};

export default EditUser;
