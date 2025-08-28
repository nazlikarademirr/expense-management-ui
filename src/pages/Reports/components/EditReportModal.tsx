import { useForm } from "@mantine/form";
import useRequestHandler from "../../../hooks/useRequestHandler";
import { Report, ReportResponse } from "../../../types/report";
import { useEffect, useRef } from "react";
import { Button, Flex, Select, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import toast from "react-hot-toast";
import RequestType from "../../../request-handler/request-type";
import urls from "../../../constants/urls";
import {
  createJsonPatchDocumentFromObjectOrDirtyForm,
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
      ...report,
    },
    validate: {
      name: (value) =>
        value.length === 0
          ? "Name cannot be empty."
          : value.length < 2
            ? "Name must have at least 2 letters."
            : value.length > 128
              ? "Name cannot exceed 128 characters."
              : null,
      isApproved: (value) =>
        value === null ? "Approval must be selected." : undefined,
    },
  });

  const initialValues = useRef<Report>(reportForm.values);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    reportForm.validate();

    if (!reportForm.isValid()) return;

    const patchDocument = createJsonPatchDocumentFromObjectOrDirtyForm(
      reportForm.values,
      reportForm
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
      <Select
        {...reportForm.getInputProps("isApproved")}
        withAsterisk
        data={["true", "false"]}
        label={"Is Approved"}
      />
      <Button disabled={!reportForm.isDirty()} onClick={(e) => handleSave(e)}>
        Edit
      </Button>
    </Flex>
  );
}

export default EditReportModal;
