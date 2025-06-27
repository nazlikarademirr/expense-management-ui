import { useForm } from "@mantine/form";
import useRequestHandler from "../../../hooks/useRequestHandler";
import { Report, ReportResponse } from "../../../types/report";
import { useEffect, useRef } from "react";
import { Button, Flex, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import toast from "react-hot-toast";
import RequestType from "../../../request-handler/request-type";
import urls from "../../../constants/urls";
import {
  createJsonPatchDocumentFromDirtyForm,
  JsonPatchKeyValuePair,
} from "../../../types/json-patch-document";

interface EditReport {
  report: Report;
  partiallyUpdateReport: (formEditedReport: Report) => void;
}

function EditReport({ report, partiallyUpdateReport }: EditReport) {
  const { handleDataRequest } = useRequestHandler();

  const formEditedReport = useForm({
    initialValues: {
      id: report.id,
      name: report.name,
      lastReportDate: report.lastReportDate,
      isActive: report.isActive,
      createUser: report.createUser,
      createDate: report.createDate,
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  const initialValues = useRef<Report>(formEditedReport.values);

  const userInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    formEditedReport.validate();

    if (formEditedReport.isDirty()) {
      const patchDocument = createJsonPatchDocumentFromDirtyForm(
        formEditedReport,
        formEditedReport.values
      );

      const response = await handleDataRequest<
        JsonPatchKeyValuePair[],
        ReportResponse
      >(urls.report + "/" + report.id, RequestType.Patch, patchDocument);

      if (response.isSuccess) {
        initialValues.current = formEditedReport.values;

        partiallyUpdateReport(formEditedReport.values);

        toast.success("Report edited successfully.");

        modals.closeAll();
      }
    }
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
        key={formEditedReport.key("id")}
        {...formEditedReport.getInputProps("name")}
        withAsterisk
        label={"Name"}
      />
      <Button onClick={(e) => handleSave(e)}>Edit</Button>
    </Flex>
  );
}

export default EditReport;
