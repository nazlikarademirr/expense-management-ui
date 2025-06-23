import { useEffect, useRef, useState } from "react";
import { Project } from "../../../types/project";
import { modals } from "@mantine/modals";
import { Button, Flex, TextInput } from "@mantine/core";

interface EditProject {
  project: Project;
  updateProject: (editedProject: Project) => void;
}

function EditProject({ project, updateProject }: EditProject) {
  const [editedProject, setEditedProject] = useState<Project>({
    id: project.id,
    name: project.name,
    code: project.code,
    searchText: project.searchText,
    isActive: project.isActive,
    createUser: project.createUser,
    createDate: project.createDate,
  });

  const projectInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();

    updateProject(editedProject);

    modals.closeAll();
  };

  useEffect(() => {
    if (projectInputRef.current) {
      projectInputRef.current.focus();
    }
  }, []);

  return (
    <Flex direction={"column"} gap={10}>
      <TextInput
        ref={projectInputRef}
        value={editedProject.name}
        onChange={(e) =>
          setEditedProject({ ...editedProject, name: e.currentTarget.value })
        }
        label={"Name"}
      />

      <TextInput
        value={editedProject.code}
        onChange={(e) =>
          setEditedProject({ ...editedProject, code: e.currentTarget.value })
        }
        label={"Code"}
      />
      <Button onClick={(e) => handleSave(e)}>Edit</Button>
    </Flex>
  );
}

export default EditProject;
