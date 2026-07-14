import { useForm } from "@mantine/form";
import { Button, Flex, Group, Radio, TextInput } from "@mantine/core";
import Dictionary from "../../../helpers/translation/dictionary";
import { useTranslation } from "react-i18next";
import { PiPlusCircle } from "react-icons/pi";
import { currencyTypes } from "../../../constants/static-data";
import { zod4Resolver } from "mantine-form-zod-resolver";
import reportSchema, {
  Report,
  ReportRequest,
} from "../../../types/report.types";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request-type";
import useRequestHandler from "../../../hooks/useRequestHandler";
import { useState } from "react";
import toast from "react-hot-toast";
import { format, subDays } from "date-fns";
import { modals } from "@mantine/modals";
import CurrencyType from "../../../enums/currency-type";
import { formatIban } from "../../../helpers/IbanFormatter";
import { SelectItem } from "../../../types/select-item.types";

const TEXT_INPUT_MIN_HEIGHT = 90;

interface CreateAbroadReportModalProps {
  addReport: (report: Report) => void;
  checkIfReportIsValid: (report: Report) => boolean;
  currentUserFullName: string;
}

function CreateAbroadReportModal({
  addReport,
  checkIfReportIsValid,
  currentUserFullName,
}: CreateAbroadReportModalProps) {
  const { t } = useTranslation();

  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      isAbroad: true,
      title: "",
      department: "",
      requestedAdvanceAmount: "",
      travelPlace: "",
      departureAndReturnDates: "",
      purposeOfTravel: "",
      advanceReceivedAmount: null,
      advanceReceivedAmountCurrency: null,
      amountToBeRefunded: null,
      amountToBeRefundedCurrency: null,
      amountToBePaid: null,
      amountToBePaidCurrency: null,
      declarant: "",
      departmentManager: "",
      departmentHead: "",
      financeOfficer: "",
      tlIban: "",
      eurIban: "",
      searchText: "",
      createUserId: "",
      createUserFullName: "",
      createDate: new Date(),
    },
    validate: zod4Resolver(reportSchema),
  });

  const handleSave = async () => {
    setIsLoading(true);

    form.validate();

    if (!form.isValid()) {
      setIsLoading(false);
      return;
    }

    if (!checkIfReportIsValid(form.values)) {
      setIsLoading(false);
      return;
    }

    const request: ReportRequest = {
      ...form.values,
      name: form.values.name.trim(),
      isAbroad: true,
    };

    const response = await handleDataRequest<ReportRequest, Report>(
      urls.report,
      RequestType.Post,
      request,
    );

    if (!response.isSuccess) {
      setIsLoading(false);
      return;
    }

    addReport({
      ...response.value,
      advanceReceivedAmountCurrency:
        response.value.advanceReceivedAmountCurrency !== null
          ? response.value.advanceReceivedAmountCurrency.toString()
          : null,
      amountToBeRefundedCurrency:
        response.value.amountToBeRefundedCurrency !== null
          ? response.value.amountToBeRefundedCurrency.toString()
          : null,
      amountToBePaidCurrency:
        response.value.amountToBePaidCurrency !== null
          ? response.value.amountToBePaidCurrency.toString()
          : null,
      createUserFullName: currentUserFullName,
    });

    form.reset();

    toast.success(t(Dictionary.Report.CREATED));

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
    if (form.values.advanceReceivedAmountCurrency === selectItem.value) {
      form.setFieldValue("advanceReceivedAmountCurrency", null);
    }
  };

  const handleAmountToBeRefundedCurrencyDeselect = (selectItem: SelectItem) => {
    if (form.values.amountToBeRefundedCurrency === selectItem.value) {
      form.setFieldValue("amountToBeRefundedCurrency", null);
    }
  };

  const handleAmountToBePaidCurrencyDeselect = (selectItem: SelectItem) => {
    if (form.values.amountToBePaidCurrency === selectItem.value) {
      form.setFieldValue("amountToBePaidCurrency", null);
    }
  };

  return (
    <Flex direction="column" mih={TEXT_INPUT_MIN_HEIGHT}>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.DECLARANT)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...form.getInputProps("declarant")}
        />
        <TextInput
          label={t(Dictionary.Report.NAME)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          withAsterisk
          {...form.getInputProps("name")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.TITLE)}
          flex={2}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...form.getInputProps("title")}
        />
        <Flex gap={20} flex={2} align="center">
          <TextInput
            label={t(Dictionary.AbroadReport.ADVANCE_RECEIVED_AMOUNT)}
            flex={2}
            mih={TEXT_INPUT_MIN_HEIGHT}
            {...form.getInputProps("advanceReceivedAmount")}
          />
          <Radio.Group {...form.getInputProps("advanceReceivedAmountCurrency")}>
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
          {...form.getInputProps("department")}
        />
        <Flex gap={20} flex={2} align="center">
          <TextInput
            label={t(Dictionary.AbroadReport.AMOUNT_TO_BE_REFUNDED)}
            mih={TEXT_INPUT_MIN_HEIGHT}
            flex={2}
            {...form.getInputProps("amountToBeRefunded")}
          />
          <Radio.Group {...form.getInputProps("amountToBeRefundedCurrency")}>
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
          {...form.getInputProps("travelPlace")}
        />
        <Flex gap={20} flex={2} align="center">
          <TextInput
            label={t(Dictionary.AbroadReport.AMOUNT_TO_BE_PAID)}
            flex={2}
            mih={TEXT_INPUT_MIN_HEIGHT}
            {...form.getInputProps("amountToBePaid")}
          />
          <Radio.Group {...form.getInputProps("amountToBePaidCurrency")}>
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
          {...form.getInputProps("purposeOfTravel")}
        />

        <TextInput
          label={t(Dictionary.AbroadReport.DEPARTMENT_MANAGER)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...form.getInputProps("departmentManager")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.DEPARTURE_AND_RETURN_DATES)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          placeholder={`${format(subDays(new Date(), 10), "dd.MM.yyyy")} - ${format(new Date(), "dd.MM.yyyy")}`}
          maxLength={21}
          {...form.getInputProps("departureAndReturnDates")}
        />
        <TextInput
          label={t(Dictionary.AbroadReport.DEPARTMENT_HEAD)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...form.getInputProps("departmentHead")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.REQUESTED_ADVANCE_AMOUNT)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...form.getInputProps("requestedAdvanceAmount")}
        />
        <TextInput
          label={t(Dictionary.AbroadReport.FINANCE_OFFICER)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...form.getInputProps("financeOfficer")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.TL_IBAN)}
          mih={TEXT_INPUT_MIN_HEIGHT}
          flex={2}
          {...form.getInputProps("tlIban")}
          onChange={(e) =>
            form.setFieldValue("tlIban", formatIban(e.currentTarget.value))
          }
        />
        <TextInput
          label={t(Dictionary.AbroadReport.EUR_IBAN)}
          mih={TEXT_INPUT_MIN_HEIGHT}
          flex={2}
          {...form.getInputProps("eurIban")}
          onChange={(e) =>
            form.setFieldValue("eurIban", formatIban(e.currentTarget.value))
          }
        />
      </Flex>
      <Button
        variant="light"
        loading={isLoading}
        onClick={handleSave}
        leftSection={<PiPlusCircle size={22} />}
      >
        {t(Dictionary.Report.CREATE_NEW)}
      </Button>
    </Flex>
  );
}

export default CreateAbroadReportModal;
