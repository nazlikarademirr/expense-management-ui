import { useEffect, useReducer, useState } from "react";
import useRequestHandler from "./useRequestHandler";
import urls from "../constants/urls";
import RequestType from "../request-handler/request-type";
import { Report, ReportRequest, ReportResponse } from "../types/report";
import toast from "react-hot-toast";
import { SelectItem } from "../types/select-item";
import ReducerActions from "../enums/reducer-action";
import reportReducer from "../pages/Reports/report-reducer";

interface UseReportsProps {
  hasValueLabel: boolean;
}

function useReports({ hasValueLabel }: UseReportsProps) {
  const [reports, dispatch] = useReducer(reportReducer, []);

  const [reportSelectData, setReportSelectData] = useState<SelectItem[]>([]);

  const { downloadFile, handleDataRequest } = useRequestHandler();

  const addReport = async (report: Report) => {
    const reportRequest: ReportRequest = {
      ...report,
    };

    const response = await handleDataRequest<ReportRequest, ReportResponse>(
      urls.report,
      RequestType.Post,
      reportRequest
    );

    if (response.isSuccess) {
      const newReport: Report = {
        ...response.value,
      };
      dispatch({
        type: ReducerActions.Add,
        payload: newReport,
      });
      return true;
    }

    return false;
  };

  const downloadReport = async (report: Report) => {
    await downloadFile(urls.expenseExcel, report.name, undefined, {
      reportId: report.id,
    });
  };

  const updateReport = (updatedReport: Report) => {
    dispatch({
      type: ReducerActions.Update,
      payload: updatedReport,
    });
  };

  const deleteReport = async (id: string) => {
    const response = await handleDataRequest<string, never>(
      urls.report,
      RequestType.Delete,
      undefined,
      { id }
    );

    if (response.isSuccess) {
      dispatch({
        type: ReducerActions.Delete,
        payload: id,
      });
      toast.success("Report has been deleted successfully!");

      return true;
    }

    return false;
  };

  const fetchReports = async () => {
    const response = await handleDataRequest<never, ReportResponse[]>(
      urls.report,
      RequestType.Get
    );
    if (response.isSuccess) {
      const reports: Report[] = response.value.map((x) => ({
        ...x,
      }));
      dispatch({
        type: ReducerActions.Replace,
        payload: reports,
      });

      if (hasValueLabel) {
        setReportSelectData(
          response.value.map((x) => ({ value: x.id, label: x.name }))
        );
      }
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    reportSelectData,
    fetchReports,
    addReport,
    downloadReport,
    updateReport,
    deleteReport,
  };
}

export default useReports;
