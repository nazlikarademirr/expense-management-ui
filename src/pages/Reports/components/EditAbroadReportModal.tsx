import { Button, Flex, Group, Radio, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import Dictionary from "../../../helpers/translation/dictionary";
import { useForm } from "@mantine/form";
import reportSchema, { Report } from "../../../types/report.types";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { currencyTypes } from "../../../constants/static-data";
import { useEffect, useRef, useState } from "react";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request-type";
import useRequestHandler from "../../../hooks/useRequestHandler";
import {
  createJsonPatchDocumentFromDirtyForm,
  JsonPatchKeyValuePair,
} from "../../../types/json-patch-document";
import toast from "react-hot-toast";
import { modals } from "@mantine/modals";
import { SelectItem } from "../../../types/select-item.types";
import CurrencyType from "../../../enums/currency-type";
import { format, subDays } from "date-fns";

const TEXT_INPUT_MIN_HEIGHT = 90;

interface EditAbroadReportModalProps {
  report: Report;
  updateReport: (formEditedReport: Report) => void;

  checkIfReportIsValid: (report: Report) => boolean;
}

function EditAbroadReportModal({
  report,
  updateReport,
  checkIfReportIsValid,
}: EditAbroadReportModalProps) {
  const { t } = useTranslation();

  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const reportForm = useForm({
    initialValues: {
      ...report,
    },
    validate: zod4Resolver(reportSchema),
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

    if (report.isApproved) {
      patchDocument.push({
        path: "/isApproved",
        value: "false",
      });
      reportForm.values.isApproved = false;
    }

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

    toast.success(t(Dictionary.Report.UPDATED));

    modals.closeAll();

    setIsLoading(false);
  };

  const handleAdvanceReceivedAmountCurrencyDeselect = (
    selectItem: SelectItem,
  ) => {
    if (reportForm.values.advanceReceivedAmountCurrency === selectItem.value) {
      reportForm.setFieldValue("advanceReceivedAmountCurrency", null);
    }
  };

  const handleAmountToBeRefundedCurrencyDeselect = (selectItem: SelectItem) => {
    if (reportForm.values.amountToBeRefundedCurrency === selectItem.value) {
      reportForm.setFieldValue("amountToBeRefundedCurrency", null);
    }
  };

  const handleAmountToBePaidCurrencyDeselect = (selectItem: SelectItem) => {
    if (reportForm.values.amountToBePaidCurrency === selectItem.value) {
      reportForm.setFieldValue("amountToBePaidCurrency", null);
    }
  };

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  return (
    <Flex direction="column" style={{ minHeight: TEXT_INPUT_MIN_HEIGHT }}>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.Report.NAME)}
          style={{ flex: 2, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          withAsterisk
          {...reportForm.getInputProps("name")}
        />
        <Flex gap={20} style={{ flex: 2 }}>
          <TextInput
            label={t(Dictionary.AbroadReport.ADVANCE_RECEIVED_AMOUNT)}
            style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
            {...reportForm.getInputProps("advanceReceivedAmount")}
          />
          <Radio.Group
            style={{
              flex: 1,
              marginTop: 32,
            }}
            {...reportForm.getInputProps("advanceReceivedAmountCurrency")}
          >
            <Group>
              {currencyTypes
                .filter((x) => x.value !== CurrencyType.MalaysianRinggit)
                .map((x) => (
                  <Radio
                    value={x.value}
                    label={x.label}
                    onClick={() =>
                      handleAdvanceReceivedAmountCurrencyDeselect(x)
                    }
                  ></Radio>
                ))}
            </Group>
          </Radio.Group>
        </Flex>
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.TITLE)}
          style={{ flex: 2, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...reportForm.getInputProps("title")}
        />
        <Flex gap={20} style={{ flex: 2 }}>
          <TextInput
            label={t(Dictionary.AbroadReport.AMOUNT_TO_BE_REFUNDED)}
            style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
            {...reportForm.getInputProps("amountToBeRefunded")}
          />
          <Radio.Group
            style={{ flex: 1, marginTop: 32 }}
            {...reportForm.getInputProps("amountToBeRefundedCurrency")}
          >
            <Group>
              {currencyTypes
                .filter((x) => x.value !== CurrencyType.MalaysianRinggit)
                .map((x) => (
                  <Radio
                    value={x.value}
                    label={x.label}
                    onClick={() => handleAmountToBeRefundedCurrencyDeselect(x)}
                  ></Radio>
                ))}
            </Group>
          </Radio.Group>
        </Flex>
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.DEPARTMENT)}
          style={{ flex: 2, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...reportForm.getInputProps("department")}
        />
        <Flex gap={20} style={{ flex: 2 }}>
          <TextInput
            label={t(Dictionary.AbroadReport.AMOUNT_TO_BE_PAID)}
            style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
            {...reportForm.getInputProps("amountToBePaid")}
          />
          <Radio.Group
            style={{ flex: 1, marginTop: 32 }}
            {...reportForm.getInputProps("amountToBePaidCurrency")}
          >
            <Group>
              {currencyTypes
                .filter((x) => x.value !== CurrencyType.MalaysianRinggit)
                .map((x) => (
                  <Radio
                    value={x.value}
                    label={x.label}
                    onClick={() => handleAmountToBePaidCurrencyDeselect(x)}
                  ></Radio>
                ))}
            </Group>
          </Radio.Group>
        </Flex>
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.TRAVEL_PLACE)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...reportForm.getInputProps("travelPlace")}
        />
        <TextInput
          label={t(Dictionary.AbroadReport.DECLARANT)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...reportForm.getInputProps("declarant")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.PURPOSE_OF_TRAVEL)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...reportForm.getInputProps("purposeOfTravel")}
        />

        <TextInput
          label={t(Dictionary.AbroadReport.DEPARTMENT_MANAGER)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...reportForm.getInputProps("departmentManager")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.DEPARTURE_AND_RETURN_DATES)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          placeholder={`${format(subDays(new Date(), 10), "dd.MM.yyyy")} - ${format(new Date(), "dd.MM.yyyy")}`}
          {...reportForm.getInputProps("departureAndReturnDates")}
        />
        <TextInput
          label={t(Dictionary.AbroadReport.DEPARTMENT_HEAD)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...reportForm.getInputProps("departmentHead")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.REQUESTED_ADVANCE_AMOUNT)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...reportForm.getInputProps("requestedAdvanceAmount")}
        />
        <TextInput
          label={t(Dictionary.AbroadReport.FINANCE_OFFICER)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...reportForm.getInputProps("financeOfficer")}
        />
      </Flex>
      <Button
        variant="light"
        loading={isLoading}
        onClick={handleSave}
        disabled={!reportForm.isDirty()}
      >
        {t(Dictionary.Common.EDIT)}
      </Button>
    </Flex>
  );
}

export default EditAbroadReportModal;
