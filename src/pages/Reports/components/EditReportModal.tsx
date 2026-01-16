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
import useReports from "../../../hooks/useReports";

interface EditReportProps {
  report: Report;
  updateReport: (formEditedReport: Report) => void;
}

function EditReportModal({ report, updateReport }: EditReportProps) {
  const { handleDataRequest } = useRequestHandler();

  const { reports } = useReports({
    hasValueLabel: false,
    hasApprovedReportValueLabel: false,
  });

  const reportForm = useForm({
    initialValues: {
      ...report,
    },
    validate: {
      name: (value) =>
        value.trim().length === 0
          ? "Name cannot be empty."
          : value.length < 2
            ? "Name must have at least 2 letters."
            : value.length > 128
              ? "Name cannot exceed 128 characters."
              : null,
    },
  });

  const initialValues = useRef<Report>(reportForm.values);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    reportForm.validate();

    if (!reportForm.isValid()) return;

    if (
      reports
        .filter((x) => x.isApproved)
        .find((x) => x.name === reportForm.values.name)
    ) {
      toast.error("There is a report with the same name!");
      return;
    }

    const patchDocument = createJsonPatchDocumentFromDirtyForm(
      reportForm,
      reportForm.values
    );

    const response = await handleDataRequest<
      JsonPatchKeyValuePair[],
      ReportResponse
    >(`${urls.report}/${report.id}`, RequestType.Patch, patchDocument);

    if (!response.isSuccess) return;

    initialValues.current = reportForm.values;

    updateReport(reportForm.values);

    toast.success("Report edited successfully.");

    modals.closeAll();
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
        label={"Name"}
        {...reportForm.getInputProps("name")}
      />
      <Button
        variant="light"
        disabled={!reportForm.isDirty()}
        onClick={(e) => handleSave(e)}
      >
        Edit
      </Button>
    </Flex>
  );
}

export default EditReportModal;
