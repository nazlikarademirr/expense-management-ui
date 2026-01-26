import { useReducer } from "react";
import { Team } from "../types/team";
import ReducerActions from "../enums/reducer-action";
import teamReducer from "../pages/Teams/team-reducer";

function useTeams() {
  const [teams, dispatch] = useReducer(teamReducer, []);

  const addTeam = (team: Team) => {
    dispatch({
      type: ReducerActions.Add,
      payload: team,
    });
  };

  const deleteTeam = (id: string) => {
    dispatch({
      type: ReducerActions.Delete,
      payload: id,
    });
  };

  const updateTeam = (updatedTeam: Team) => {
    dispatch({
      type: ReducerActions.Update,
      payload: updatedTeam,
    });
  };

  const replaceTeams = (list: Team[]) => {
    dispatch({
      type: ReducerActions.Replace,
      payload: list,
    });
  };

  const fetchTeams = (teams: Team[]) => {
    dispatch({
      type: ReducerActions.Replace,
      payload: teams,
    });
  };

  const fetchActiveTeamsSelectData = (teams: Team[]) => {
    dispatch({
      type: ReducerActions.Replace,
      payload: teams,
    });

    return teams.map((x) => ({ value: x.id, label: x.name }));
  };

  return {
    teams,
    fetchTeams,
    addTeam,
    deleteTeam,
    updateTeam,
    replaceTeams,
    fetchActiveTeamsSelectData,
  };
}

export default useTeams;
