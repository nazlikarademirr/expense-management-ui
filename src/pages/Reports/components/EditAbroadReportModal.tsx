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
import { format, subDays } from "date-fns";
import CurrencyType from "../../../enums/currency-type";
import { formatIban } from "../../../helpers/IbanFormatter";
import { SelectItem } from "../../../types/select-item.types";

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

    const validation = reportForm.validate();

    if (validation.hasErrors) {
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

    toast.success(t(Dictionary.Report.UPDATED));

    modals.closeAll();

    setIsLoading(false);
  };

  const filteredCurrency = currencyTypes.filter(
    (x) =>
      x.value !== CurrencyType.MacedonianDenar &&
      x.value !== CurrencyType.MalaysianRinggit,
  );

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
    <Flex direction="column" mih={TEXT_INPUT_MIN_HEIGHT}>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.DECLARANT)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...reportForm.getInputProps("declarant")}
        />
        <TextInput
          label={t(Dictionary.Report.NAME)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          withAsterisk
          {...reportForm.getInputProps("name")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.TITLE)}
          flex={2}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...reportForm.getInputProps("title")}
        />
        <Flex gap={20} flex={2} align="center">
          <TextInput
            label={t(Dictionary.AbroadReport.ADVANCE_RECEIVED_AMOUNT)}
            flex={2}
            mih={TEXT_INPUT_MIN_HEIGHT}
            {...reportForm.getInputProps("advanceReceivedAmount")}
          />
          <Radio.Group
            {...reportForm.getInputProps("advanceReceivedAmountCurrency")}
          >
            <Group>
              {filteredCurrency.map((x) => (
                <Radio
                  value={x.value}
                  label={x.label}
                  onClick={() => handleAdvanceReceivedAmountCurrencyDeselect(x)}
                ></Radio>
              ))}
            </Group>
          </Radio.Group>
        </Flex>
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.DEPARTMENT)}
          flex={2}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...reportForm.getInputProps("department")}
        />
        <Flex gap={20} flex={2} align="center">
          <TextInput
            label={t(Dictionary.AbroadReport.AMOUNT_TO_BE_REFUNDED)}
            mih={TEXT_INPUT_MIN_HEIGHT}
            flex={2}
            {...reportForm.getInputProps("amountToBeRefunded")}
          />
          <Radio.Group
            {...reportForm.getInputProps("amountToBeRefundedCurrency")}
          >
            <Group>
              {filteredCurrency.map((x) => (
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
          label={t(Dictionary.AbroadReport.TRAVEL_PLACE)}
          flex={2}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...reportForm.getInputProps("travelPlace")}
        />
        <Flex gap={20} flex={2} align="center">
          <TextInput
            label={t(Dictionary.AbroadReport.AMOUNT_TO_BE_PAID)}
            flex={2}
            mih={TEXT_INPUT_MIN_HEIGHT}
            {...reportForm.getInputProps("amountToBePaid")}
          />
          <Radio.Group {...reportForm.getInputProps("amountToBePaidCurrency")}>
            <Group>
              {filteredCurrency.map((x) => (
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
          label={t(Dictionary.AbroadReport.PURPOSE_OF_TRAVEL)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...reportForm.getInputProps("purposeOfTravel")}
        />

        <TextInput
          label={t(Dictionary.AbroadReport.DEPARTMENT_MANAGER)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...reportForm.getInputProps("departmentManager")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.DEPARTURE_AND_RETURN_DATES)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          placeholder={`${format(subDays(new Date(), 10), "dd.MM.yyyy")} - ${format(new Date(), "dd.MM.yyyy")}`}
          maxLength={21}
          {...reportForm.getInputProps("departureAndReturnDates")}
        />
        <TextInput
          label={t(Dictionary.AbroadReport.DEPARTMENT_HEAD)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...reportForm.getInputProps("departmentHead")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.REQUESTED_ADVANCE_AMOUNT)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...reportForm.getInputProps("requestedAdvanceAmount")}
        />
        <TextInput
          label={t(Dictionary.AbroadReport.FINANCE_OFFICER)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...reportForm.getInputProps("financeOfficer")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.TL_IBAN)}
          mih={TEXT_INPUT_MIN_HEIGHT}
          flex={2}
          {...reportForm.getInputProps("tlIban")}
          onChange={(e) =>
            reportForm.setFieldValue(
              "tlIban",
              formatIban(e.currentTarget.value),
            )
          }
        />
        <TextInput
          label={t(Dictionary.AbroadReport.EUR_IBAN)}
          mih={TEXT_INPUT_MIN_HEIGHT}
          flex={2}
          {...reportForm.getInputProps("eurIban")}
          onChange={(e) =>
            reportForm.setFieldValue(
              "eurIban",
              formatIban(e.currentTarget.value),
            )
          }
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
