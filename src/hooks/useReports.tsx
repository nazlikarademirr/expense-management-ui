import { useReducer } from "react";
import { Report } from "../types/report";
import ReducerActions from "../enums/reducer-action";
import reportReducer from "../pages/Reports/report-reducer";

function useReports() {
  const [reports, dispatch] = useReducer(reportReducer, []);

  const addReport = (report: Report) => {
    dispatch({
      type: ReducerActions.Add,
      payload: report,
    });
  };

  const updateReport = (updatedReport: Report) => {
    dispatch({
      type: ReducerActions.Update,
      payload: updatedReport,
    });
  };

  const deleteReport = (id: string) => {
    dispatch({
      type: ReducerActions.Delete,
      payload: id,
    });
  };

  const replaceReports = (reports: Report[]) => {
    dispatch({
      type: ReducerActions.Replace,
      payload: reports,
    });
  };

  return {
    reports,
    addReport,
    updateReport,
    deleteReport,
    replaceReports,
  };
}

export default useReports;
