import { useEffect, useState } from "react";
import useRequestHandler from "../../../hooks/useRequestHandler";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request.type";
import { Report, ReportRequest, ReportResponse } from "../../../types/report";
import toast from "react-hot-toast";

function useReports() {
  const [reports, setReports] = useState<Report[]>([]);

  const { handleDataRequest } = useRequestHandler();

  const addReport = async (report: Report) => {
    const reportRequest: ReportRequest = {
      name: report.name,
    };

    var response = await handleDataRequest<ReportRequest, ReportResponse>(
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
    var response = await handleDataRequest<object, undefined>(
      urls.expenseExcel,
      RequestType.Post,
      undefined,
      { reportId }
    );

    if (response.isSuccess) {
      response.value;
    }
  };

  const deleteReport = async (id: string) => {
    var response = await handleDataRequest<object, undefined>(
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
    var response = await handleDataRequest<never, ReportResponse[]>(
      urls.report,
      RequestType.Get
    );
    if (response.isSuccess) {
      var reports: Report[] = response.value.map((x) => ({
        id: x.id,
        name: x.name,
        lastReportDate: x.lastReportDate,
        isActive: x.isActive,
        createUser: x.createUser,
        createDate: x.createDate,
      }));
      setReports(reports);
    }
  };

  useEffect(() => {
    fetchReports();
  });

  return {
    reports,
    addReport,
    downloadReport,
    deleteReport,
  };
}

export default useReports;
