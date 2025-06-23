import { useEffect, useRef, useState } from "react";
import { Team } from "../../../types/team";
import { Button, Flex, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";

interface EditTeam {
  team: Team;
  updateTeam: (editedTeam: Team) => void;
}

function EditTeam({ team, updateTeam }: EditTeam) {
  const [editedTeam, setEditedTeam] = useState<Team>({
    id: team.id,
    name: team.name,
    searchText: team.searchText,
    isActive: team.isActive,
    createUser: team.createUser,
    createDate: team.createDate,
  });

  const userInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();

    updateTeam(editedTeam);

    modals.closeAll();
  };

  useEffect(() => {
    if (userInputRef.current) {
      userInputRef.current.focus();
    }
  }, []);

  return (
    <Flex direction={"column"} gap={10}>
      <TextInput
        ref={userInputRef}
        value={editedTeam.name}
        onChange={(e) =>
          setEditedTeam({ ...editedTeam, name: e.currentTarget.value })
        }
        label={"Name"}
      />
      <Button onClick={(e) => handleSave(e)}>Edit</Button>
    </Flex>
  );
}

export default EditTeam;
