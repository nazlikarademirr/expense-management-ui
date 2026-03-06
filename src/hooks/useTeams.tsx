import { useReducer } from "react";
import { Team } from "../types/team.types";
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

  return {
    teams,
    addTeam,
    deleteTeam,
    updateTeam,
    replaceTeams,
  };
}

export default useTeams;
