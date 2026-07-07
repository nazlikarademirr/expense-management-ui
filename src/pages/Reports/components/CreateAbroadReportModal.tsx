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
import { SelectItem } from "../../../types/select-item.types";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request-type";
import useRequestHandler from "../../../hooks/useRequestHandler";
import { useState } from "react";
import useReports from "../../../hooks/useReports";
import toast from "react-hot-toast";
import CurrencyType from "../../../enums/currency-type";
import { format, subDays } from "date-fns";

const TEXT_INPUT_MIN_HEIGHT = 90;

interface CreateAbroadReportModalProps {
  checkIfReportIsValid: (report: Report) => boolean;
}

function CreateAbroadReportModal({
  checkIfReportIsValid,
}: CreateAbroadReportModalProps) {
  const { t } = useTranslation();

  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const { addReport } = useReports();

  const form = useForm({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      isApproved: false,
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
    });

    form.reset();

    toast.success(t(Dictionary.Report.ADDED));

    setIsLoading(false);
  };

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
    <Flex direction="column" style={{ minHeight: TEXT_INPUT_MIN_HEIGHT }}>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.Report.NAME)}
          flex={2}
          mih={TEXT_INPUT_MIN_HEIGHT}
          withAsterisk
          {...form.getInputProps("name")}
        />
        <Flex gap={20} style={{ flex: 2 }}>
          <TextInput
            label={t(Dictionary.AbroadReport.ADVANCE_RECEIVED_AMOUNT)}
            flex={1}
            mih={TEXT_INPUT_MIN_HEIGHT}
            {...form.getInputProps("advanceReceivedAmount")}
          />
          <Radio.Group
            style={{
              flex: 1,
              marginTop: 25,
            }}
            {...form.getInputProps("advanceReceivedAmountCurrency")}
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
          {...form.getInputProps("title")}
        />
        <Flex gap={20} style={{ flex: 2 }}>
          <TextInput
            label={t(Dictionary.AbroadReport.AMOUNT_TO_BE_REFUNDED)}
            style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
            {...form.getInputProps("amountToBeRefunded")}
          />
          <Radio.Group
            style={{ flex: 1, marginTop: 25 }}
            {...form.getInputProps("amountToBeRefundedCurrency")}
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
          {...form.getInputProps("department")}
        />
        <Flex gap={20} style={{ flex: 2 }}>
          <TextInput
            label={t(Dictionary.AbroadReport.AMOUNT_TO_BE_PAID)}
            style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
            {...form.getInputProps("amountToBePaid")}
          />
          <Radio.Group
            style={{ flex: 1, marginTop: 25 }}
            {...form.getInputProps("amountToBePaidCurrency")}
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
          {...form.getInputProps("travelPlace")}
        />
        <TextInput
          label={t(Dictionary.AbroadReport.DECLARANT)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...form.getInputProps("declarant")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.PURPOSE_OF_TRAVEL)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...form.getInputProps("purposeOfTravel")}
        />

        <TextInput
          label={t(Dictionary.AbroadReport.DEPARTMENT_MANAGER)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...form.getInputProps("departmentManager")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.DEPARTURE_AND_RETURN_DATES)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          placeholder={`${format(subDays(new Date(), 10), "dd.MM.yyyy")} - ${format(new Date(), "dd.MM.yyyy")}`}
          maxLength={21}
          {...form.getInputProps("departureAndReturnDates")}
        />
        <TextInput
          label={t(Dictionary.AbroadReport.DEPARTMENT_HEAD)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...form.getInputProps("departmentHead")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.AbroadReport.REQUESTED_ADVANCE_AMOUNT)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...form.getInputProps("requestedAdvanceAmount")}
        />
        <TextInput
          label={t(Dictionary.AbroadReport.FINANCE_OFFICER)}
          style={{ flex: 1, minHeight: TEXT_INPUT_MIN_HEIGHT }}
          {...form.getInputProps("financeOfficer")}
        />
      </Flex>
      <Button
        variant="light"
        loading={isLoading}
        onClick={handleSave}
        leftSection={<PiPlusCircle size={22} />}
      >
        {t(Dictionary.Report.ADD_NEW)}
      </Button>
    </Flex>
  );
}

export default CreateAbroadReportModal;
