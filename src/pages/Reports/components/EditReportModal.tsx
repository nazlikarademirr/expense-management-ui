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
  reports: Report[];
  updateReport: (formEditedReport: Report) => void;
}

function EditReportModal({ report, reports, updateReport }: EditReportProps) {
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
    setIsLoading(true);

    e.preventDefault();

    reportForm.validate();

    if (!reportForm.isValid()) {
      setIsLoading(false);
      return;
    }

    if (reports.some((x) => x.name.trim() === reportForm.values.name.trim())) {
      toast.error("There is a report with the same name!");
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
