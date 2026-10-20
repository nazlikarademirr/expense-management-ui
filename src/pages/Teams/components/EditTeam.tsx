import {
  Autocomplete,
  Badge,
  Button,
  Flex,
  Popover,
  Table,
  TextInput,
} from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from "react-icons/io";
import Dictionary from "../../../helpers/translation/dictionary.ts";
import { Team } from "../../../types/team.types.ts";
import { SelectItem } from "../../../types/select-item.types.ts";
import { useTranslation } from "react-i18next";

interface EditTeamProps {
  team: Team;
  isEditing: boolean;
  editingTeamData: Team | null;
  setEditingTeamData: React.Dispatch<React.SetStateAction<Team | null>>;
  editErrors: Record<string, string>;
  setEditErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  managerSelectData: SelectItem[];
  isLoading: boolean;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleEditClick: (team: Team) => void;
  openTeamActivityModal: (team: Team) => void;
}

const EditTeam = ({
  team: x,
  isEditing,
  editingTeamData,
  setEditingTeamData,
  editErrors,
  setEditErrors,
  managerSelectData,
  isLoading,
  handleSaveEdit,
  handleCancelEdit,
  handleEditClick,
  openTeamActivityModal,
}: EditTeamProps) => {
  const { t } = useTranslation();

  const hasChanges =
    editingTeamData !== null &&
    ((editingTeamData.name ?? "") !== (x.name ?? "") ||
      (editingTeamData.department ?? "") !== (x.department ?? "") ||
      (editingTeamData.departmentManager ?? "") !==
        (x.departmentManager ?? "") ||
      (editingTeamData.departmentHead ?? "") !== (x.departmentHead ?? ""));

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
                value={editingTeamData?.name ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingTeamData({
                    ...editingTeamData!,
                    name: val,
                  });
                  if (
                    editErrors.name &&
                    val.trim().length >= 2 &&
                    val.trim().length <= 128
                  )
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
            opened={!!editErrors.department}
            position="bottom"
            width="target"
            withArrow
            withinPortal={false}
            zIndex={200}
          >
            <Popover.Target>
              <TextInput
                w="100%"
                value={editingTeamData?.department ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingTeamData({
                    ...editingTeamData!,
                    department: val,
                  });
                  if (
                    editErrors.department &&
                    val.trim().length >= 2 &&
                    val.trim().length <= 128
                  )
                    setEditErrors((prev) => ({ ...prev, department: "" }));
                }}
                error={!!editErrors.department}
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
              {editErrors.department}
            </Popover.Dropdown>
          </Popover>
        ) : (
          x.department
        )}
      </Table.Td>
      <Table.Td>
        {isEditing ? (
          <Popover
            opened={!!editErrors.departmentManager}
            position="bottom"
            width="target"
            withArrow
            withinPortal={false}
            zIndex={200}
          >
            <Popover.Target>
              <Autocomplete
                w="100%"
                data={managerSelectData}
                value={editingTeamData?.departmentManager ?? ""}
                clearable
                onChange={(val) => {
                  setEditingTeamData({
                    ...editingTeamData!,
                    departmentManager: val,
                  });
                  if (
                    editErrors.departmentManager &&
                    val.trim().length <= 128
                  )
                    setEditErrors((prev) => ({
                      ...prev,
                      departmentManager: "",
                    }));
                }}
                error={!!editErrors.departmentManager}
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
              {editErrors.departmentManager}
            </Popover.Dropdown>
          </Popover>
        ) : (
          x.departmentManager
        )}
      </Table.Td>
      <Table.Td>
        {isEditing ? (
          <Popover
            opened={!!editErrors.departmentHead}
            position="bottom"
            width="target"
            withArrow
            withinPortal={false}
            zIndex={200}
          >
            <Popover.Target>
              <Autocomplete
                w="100%"
                data={managerSelectData}
                value={editingTeamData?.departmentHead ?? ""}
                clearable
                onChange={(val) => {
                  setEditingTeamData({
                    ...editingTeamData!,
                    departmentHead: val,
                  });
                  if (editErrors.departmentHead && val.trim().length <= 128)
                    setEditErrors((prev) => ({
                      ...prev,
                      departmentHead: "",
                    }));
                }}
                error={!!editErrors.departmentHead}
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
              {editErrors.departmentHead}
            </Popover.Dropdown>
          </Popover>
        ) : (
          x.departmentHead
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
                size="sm"
                onClick={handleSaveEdit}
                variant="light"
                loading={isLoading}
                disabled={!hasChanges}
              >
                {t(Dictionary.Common.SAVE)}
              </Button>
              <Button
                size="sm"
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
              {x.isActive && (
                <Button
                  size="sm"
                  onClick={() => handleEditClick(x)}
                  variant="light"
                  color="blue"
                  loading={isLoading}
                  disabled={editingTeamData !== null}
                  leftSection={<IconEdit size={18} />}
                >
                  {t(Dictionary.Common.EDIT)}
                </Button>
              )}

              <Button
                size="sm"
                onClick={() => openTeamActivityModal(x)}
                variant="light"
                style={
                  x.isActive
                    ? { color: "red", backgroundColor: "#ffeeee" }
                    : { color: "green", backgroundColor: "#e7ffe0" }
                }
                loading={isLoading}
                disabled={editingTeamData !== null}
                leftSection={
                  x.isActive ? (
                    <IoMdRemoveCircleOutline size={20} />
                  ) : (
                    <IoMdAddCircleOutline size={20} />
                  )
                }
              >
                {x.isActive
                  ? t(Dictionary.Team.DEACTIVATE)
                  : t(Dictionary.Team.ACTIVATE)}
              </Button>
            </>
          )}
        </Flex>
      </Table.Td>
    </Table.Tr>
  );
};

export default EditTeam;
