import { useEffect, useState } from "react";
import { Team, TeamRequest, TeamResponse } from "../../../types/team";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request-type";
import toast from "react-hot-toast";

function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);

  const { handleDataRequest } = useRequestHandler();

  const addTeam = async (team: Team) => {
    const teamRequest: TeamRequest = {
      name: team.name,
    };

    var response = await handleDataRequest<TeamRequest, TeamResponse>(
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
    var response = await handleDataRequest<string, never>(
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

  const updateTeam = async (team: Team) => {
    const updateTeams = teams.map((x) => {
      if (x.id === team.id) {
        return team;
      }

      return x;
    });

    const teamRequest: TeamRequest = {
      name: team.name,
    };

    var response = await handleDataRequest<TeamRequest, TeamResponse>(
      urls.team + "/" + team.id,
      RequestType.Patch,
      teamRequest
    );
    if (response.isSuccess) {
      setTeams(updateTeams);
      return true;
    }
    return false;
  };

  const partiallyUpdateTeam = (updatedTeam: Team) => {
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
    var response = await handleDataRequest<never, TeamResponse[]>(
      urls.team,
      RequestType.Get
    );
    if (response.isSuccess) {
      var teams: Team[] = response.value.map((x) => ({
        id: x.id,
        name: x.name,
        searchText: x.searhText,
        isActive: x.isActive,
        createUser: x.createUser,
        createDate: x.createDate,
      }));
      setTeams(teams);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    addTeam,
    deleteTeam,
    updateTeam,
    replaceTeam,
    partiallyUpdateTeam,
  };
}

export default useTeams;
