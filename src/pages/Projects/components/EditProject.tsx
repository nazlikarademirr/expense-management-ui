import {
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
import { Project } from "../../../types/project.types.ts";
import { useTranslation } from "react-i18next";

interface EditProjectProps {
  project: Project;
  isEditing: boolean;
  editingProjectData: Project | null;
  setEditingProjectData: React.Dispatch<React.SetStateAction<Project | null>>;
  editErrors: Record<string, string>;
  setEditErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isLoading: boolean;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleEditClick: (project: Project) => void;
  openProjectActivityModal: (project: Project) => void;
}

const EditProject = ({
  project: x,
  isEditing,
  editingProjectData,
  setEditingProjectData,
  editErrors,
  setEditErrors,
  isLoading,
  handleSaveEdit,
  handleCancelEdit,
  handleEditClick,
  openProjectActivityModal,
}: EditProjectProps) => {
  const { t } = useTranslation();

  const hasChanges =
    editingProjectData !== null &&
    ((editingProjectData.name ?? "") !== (x.name ?? "") ||
      (editingProjectData.code ?? "") !== (x.code ?? ""));

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
                value={editingProjectData?.name ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingProjectData({
                    ...editingProjectData!,
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
            opened={!!editErrors.code}
            position="bottom"
            width="target"
            withArrow
            withinPortal={false}
            zIndex={200}
          >
            <Popover.Target>
              <TextInput
                w="100%"
                value={editingProjectData?.code ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingProjectData({
                    ...editingProjectData!,
                    code: val,
                  });
                  if (
                    editErrors.code &&
                    val.trim().length >= 2 &&
                    val.trim().length <= 128
                  )
                    setEditErrors((prev) => ({ ...prev, code: "" }));
                }}
                error={!!editErrors.code}
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
              {editErrors.code}
            </Popover.Dropdown>
          </Popover>
        ) : (
          x.code
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
                disabled={!hasChanges}
              >
                {t(Dictionary.Common.SAVE)}
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
              {x.isActive && (
                <Button
                  onClick={() => handleEditClick(x)}
                  variant="light"
                  loading={isLoading}
                  disabled={editingProjectData !== null}
                  leftSection={<IconEdit size={18} />}
                  color="blue"
                >
                  {t(Dictionary.Common.EDIT)}
                </Button>
              )}
              <Button
                onClick={() => openProjectActivityModal(x)}
                variant="light"
                loading={isLoading}
                disabled={editingProjectData !== null}
                style={{
                  color: x.isActive ? "red" : "green",
                  backgroundColor: x.isActive ? "#ffeeee" : "#e7ffe0",
                }}
                leftSection={
                  x.isActive ? (
                    <IoMdRemoveCircleOutline size={20} />
                  ) : (
                    <IoMdAddCircleOutline size={20} />
                  )
                }
              >
                {x.isActive
                  ? t(Dictionary.Project.DEACTIVATE)
                  : t(Dictionary.Project.ACTIVATE)}
              </Button>
            </>
          )}
        </Flex>
      </Table.Td>
    </Table.Tr>
  );
};

export default EditProject;
