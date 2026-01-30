import { useForm } from "@mantine/form";
import useRequestHandler from "../../../hooks/useRequestHandler";
import { Report } from "../../../types/report";
import { useEffect, useRef, useState } from "react";
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
  checkIfReportIsValid: (report: Report) => boolean;
}

function EditReportModal({
  report,
  updateReport,
  checkIfReportIsValid,
}: EditReportProps) {
  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const reportForm = useForm({
    initialValues: {
      ...report,
    },
    validate: {
      name: (value) =>
        value.trim().length === 0
          ? "Name cannot be empty."
          : value.trim().length < 2
            ? "Name must have at least 2 letters."
            : value.trim().length > 128
              ? "Name cannot exceed 128 characters."
              : null,
    },
  });

  const initialValues = useRef<Report>(reportForm.values);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.MouseEvent) => {
    setIsLoading(true);

    e.preventDefault();

    reportForm.validate();

    if (!reportForm.isValid()) {
      setIsLoading(false);
      return;
    }

    if (!checkIfReportIsValid(reportForm.values)) {
      setIsLoading(false);
      return;
    }

    const patchDocument = createJsonPatchDocumentFromDirtyForm(
      reportForm,
      reportForm.values,
    );

    const response = await handleDataRequest<JsonPatchKeyValuePair[], Report>(
      `${urls.report}/${report.id}`,
      RequestType.Patch,
      patchDocument,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    initialValues.current = reportForm.values;

    updateReport(reportForm.values);

    toast.success("Report edited successfully.");

    modals.closeAll();

    setIsLoading(false);
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
        style={{ minHeight: 80 }}
        {...reportForm.getInputProps("name")}
      />
      <Button
        variant="light"
        disabled={!reportForm.isDirty()}
        onClick={(e) => handleSave(e)}
        loading={isLoading}
      >
        Edit
      </Button>
    </Flex>
  );
}

export default EditReportModal;
