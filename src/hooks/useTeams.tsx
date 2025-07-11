import { useEffect, useReducer, useState } from "react";
import { Team, TeamRequest, TeamResponse } from "../types/team";
import useRequestHandler from "./useRequestHandler";
import urls from "../constants/urls";
import RequestType from "../request-handler/request-type";
import toast from "react-hot-toast";
import { SelectItem } from "../types/select-item";
import expenseReducer from "../expense-reducer/expense-reducer";
import ReducerActions from "../enums/reducer-action";

interface UseTeamsProps {
  hasValueLabel: boolean;
}

function useTeams({ hasValueLabel }: UseTeamsProps) {
  const [teams, dispatch] = useReducer(expenseReducer<Team>, []);

  const [teamSelectData, setTeamSelectData] = useState<SelectItem[]>([]);

  const { handleDataRequest } = useRequestHandler();

  const addTeam = async (team: Team) => {
    const teamRequest: TeamRequest = {
      ...team,
    };

    const response = await handleDataRequest<TeamRequest, TeamResponse>(
      urls.team,
      RequestType.Post,
      teamRequest
    );

    if (response.isSuccess) {
      const newTeam: Team = {
        ...response.value,
      };
      dispatch({
        type: ReducerActions.Add,
        payload: newTeam,
      });
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
      dispatch({
        type: ReducerActions.Delete,
        payload: id,
      });
      toast.success("Team has been deleted successfully!");
      return true;
    }

    return false;
  };

  const updateTeam = (updatedTeam: Team) => {
    dispatch({
      type: ReducerActions.Update,
      payload: updatedTeam,
    });
  };

  const replaceTeam = (list: Team[]) => {
    dispatch({
      type: ReducerActions.Replace,
      payload: list,
    });
  };

  const fetchTeams = async () => {
    const response = await handleDataRequest<never, TeamResponse[]>(
      urls.team,
      RequestType.Get
    );
    if (response.isSuccess) {
      const teams: Team[] = response.value.map((x) => ({
        ...x,
      }));
      dispatch({
        type: ReducerActions.Fetch,
        payload: teams,
      });
      if (hasValueLabel) {
        setTeamSelectData(
          response.value.map((x) => ({ value: x.id, label: x.name }))
        );
      }
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
