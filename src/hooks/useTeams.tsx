import { useEffect, useState } from "react";
import { Team, TeamRequest, TeamResponse } from "../types/team";
import useRequestHandler from "./useRequestHandler";
import urls from "../constants/urls";
import RequestType from "../request-handler/request-type";
import toast from "react-hot-toast";
import { SelectItem } from "../types/select-item";

function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);

  const [teamSelectData, setTeamSelectData] = useState<SelectItem[]>([]);

  const { handleDataRequest } = useRequestHandler();

  const addTeam = async (team: Team) => {
    const teamRequest: TeamRequest = {
      name: team.name,
    };

    const response = await handleDataRequest<TeamRequest, TeamResponse>(
      urls.team,
      RequestType.Post,
      teamRequest
    );

    if (response.isSuccess) {
      const newTeam: Team = {
        ...response.value,
        searchText: response.value.searhText,
      };
      setTeams([newTeam, ...teams]);
      return true;
    }

    return false;
  };

  const deleteTeam = async (id: string) => {
    const response = await handleDataRequest<string, never>(
      urls.team,
      RequestType.Delete,
      undefined,
      { id }
    );

    if (response.isSuccess) {
      setTeams(teams.filter((x) => x.id !== id));
      toast.success("Team has been deleted successfully!");
      return true;
    }

    return false;
  };

  const updateTeam = (updatedTeam: Team) => {
    const replacedTeams = teams.map((x) => {
      if (x.id === updatedTeam.id) {
        return updatedTeam;
      }

      return x;
    });
    setTeams(replacedTeams);
  };

  const replaceTeam = (list: Team[]) => {
    setTeams(list);
  };

  const fetchTeams = async () => {
    const response = await handleDataRequest<never, TeamResponse[]>(
      urls.team,
      RequestType.Get
    );
    if (response.isSuccess) {
      const teams: Team[] = response.value.map((x) => ({
        id: x.id,
        name: x.name,
        searchText: x.searhText,
        isActive: x.isActive,
        createUser: x.createUser,
        createDate: x.createDate,
      }));
      setTeams(teams);
      setTeamSelectData(
        response.value.map((x) => ({ value: x.id, label: x.name }))
      );
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    teamSelectData,
    fetchTeams,
    addTeam,
    deleteTeam,
    updateTeam,
    replaceTeam,
  };
}

export default useTeams;
