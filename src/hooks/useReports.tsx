import { useEffect, useState } from "react";
import useRequestHandler from "./useRequestHandler";
import urls from "../constants/urls";
import RequestType from "../request-handler/request-type";
import { Report, ReportRequest, ReportResponse } from "../types/report";
import toast from "react-hot-toast";
import { SelectItem } from "../types/select-item";

function useReports() {
  const [reports, setReports] = useState<Report[]>([]);

  const [reportSelectData, setReportSelectData] = useState<SelectItem[]>([]);

  const { handleDataRequest } = useRequestHandler();

  const addReport = async (report: Report) => {
    const reportRequest: ReportRequest = {
      name: report.name,
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
      setReports([newReport, ...reports]);
      return true;
    }

    return false;
  };

  const downloadReport = async (reportId: string) => {
    const response = await handleDataRequest<string, undefined>(
      urls.expenseExcel,
      RequestType.Post,
      undefined,
      { reportId }
    );

    if (response.isSuccess) {
      // response.value;
    }
  };

  const updateReport = (updatedReport: Report) => {
    const replacedReports = reports.map((x) => {
      if (x.id === updatedReport.id) {
        return updatedReport;
      }
      return x;
    });
    setReports(replacedReports);
  };

  const deleteReport = async (id: string) => {
    const response = await handleDataRequest<string, never>(
      urls.report,
      RequestType.Delete,
      undefined,
      { id }
    );

    if (response.isSuccess) {
      setReports(reports.filter((x) => x.id !== id));
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
      setReports(response.value);
      setReportSelectData(
        response.value.map((x) => ({ value: x.id, label: x.name }))
      );
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
