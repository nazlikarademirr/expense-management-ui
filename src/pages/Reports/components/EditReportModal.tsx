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

interface EditReportProps {
  report: Report;
  updateReport: (formEditedReport: Report) => void;
}

function EditReportModal({ report, updateReport }: EditReportProps) {
  const { handleDataRequest } = useRequestHandler();

  const reportForm = useForm({
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

  const initialValues = useRef<Report>(reportForm.values);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    reportForm.validate();

    if (!reportForm.isValid()) return;

    if (reportForm.isDirty()) {
      const patchDocument = createJsonPatchDocumentFromDirtyForm(
        reportForm,
        reportForm.values
      );

      const response = await handleDataRequest<
        JsonPatchKeyValuePair[],
        ReportResponse
      >(`${urls.report}/${report.id}`, RequestType.Patch, patchDocument);

      if (response.isSuccess) {
        initialValues.current = reportForm.values;

        updateReport(reportForm.values);

        toast.success("Report edited successfully.");

        modals.closeAll();
      }
    }
  };

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  return (
    <Flex direction={"column"} gap={10}>
      <TextInput
        ref={nameInputRef}
        {...reportForm.getInputProps("name")}
        withAsterisk
        label={"Name"}
      />
      <Button onClick={(e) => handleSave(e)}>Edit</Button>
    </Flex>
  );
}

export default EditReportModal;
