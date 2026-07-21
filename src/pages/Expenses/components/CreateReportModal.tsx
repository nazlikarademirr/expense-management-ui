import { useForm } from "@mantine/form";
import {
  Button,
  Checkbox,
  Flex,
  Group,
  Radio,
  Select,
  TextInput,
} from "@mantine/core";
import Dictionary from "../../../helpers/translation/dictionary";
import { useTranslation } from "react-i18next";
import { currencyTypes } from "../../../constants/static-data";
import { zod4Resolver } from "mantine-form-zod-resolver";
import reportSchema, {
  Report,
  ReportRequest,
} from "../../../types/report.types";
import urls from "../../../constants/urls";
import RequestType from "../../../request-handler/request-type";
import useRequestHandler from "../../../hooks/useRequestHandler";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { format, subDays } from "date-fns";
import { modals } from "@mantine/modals";
import CurrencyType from "../../../enums/currency-type";
import { formatIban } from "../../../helpers/IbanFormatter";
import { SelectItem } from "../../../types/select-item.types";
import { User } from "../../../types/user.types";
import Role from "../../../enums/role";

const TEXT_INPUT_MIN_HEIGHT = 90;

interface CreateAbroadReportModalProps {
  addReport: (report: Report) => void;
  checkIfReportIsValid: (report: Report) => boolean;
  currentUserFullName: string;
}

function CreateReportModal({
  addReport,
  checkIfReportIsValid,
  currentUserFullName,
}: CreateAbroadReportModalProps) {
  const { t } = useTranslation();

  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const [activeUserSelectData, setActiveUserSelectData] = useState<
    SelectItem[]
  >([]);

  const [managerSelectData, setManagerSelectData] = useState<SelectItem[]>([]);

  const form = useForm({
    initialValues: {
      id: crypto.randomUUID(),
      name: "",
      isAbroad: false,
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

  const handleCurrencyDeselect = (
    field: keyof typeof form.values,
    selectItem: SelectItem,
  ) => {
    if (form.values[field] === selectItem.value) {
      form.setFieldValue(field, null);
    }
  };

  const getActiveUsers = async () => {
    const response = await handleDataRequest<never, User[]>(
      urls.user,
      RequestType.Get,
      undefined,
      { isActive: true },
    );

    if (!response.isSuccess) return;

    setActiveUserSelectData(
      response.value.map((x) => ({
        value: x.id.toLowerCase(),
        label: `${x.name} ${x.surname}`,
      })),
    );

    setManagerSelectData(
      response.value
        .filter((x) => x.role.toString() !== Role.User)
        .map((x) => ({
          value: x.id.toLowerCase(),
          label: `${x.name} ${x.surname}`,
        })),
    );
  };

  useEffect(() => {
    getActiveUsers();
  }, []);

  return (
    <Flex direction="column" mih={TEXT_INPUT_MIN_HEIGHT}>
      <Flex gap={20}>
        <Flex flex={1} gap={10} align="center">
          <TextInput
            label={t(Dictionary.Report.NAME)}
            mih={TEXT_INPUT_MIN_HEIGHT}
            withAsterisk
            flex={1}
            {...form.getInputProps("name")}
          />
          <Checkbox
            labelPosition="left"
            label={t(Dictionary.Report.ABROAD)}
            type="checkbox"
            mb={10}
            {...form.getInputProps("isAbroad")}
          />
        </Flex>
        <TextInput
          label={t(Dictionary.Report.REQUESTED_ADVANCE_AMOUNT)}
          mih={TEXT_INPUT_MIN_HEIGHT}
          flex={1}
          {...form.getInputProps("requestedAdvanceAmount")}
        />
      </Flex>
      <Flex gap={20}>
        <Select
          {...form.getInputProps("declarant")}
          mih={TEXT_INPUT_MIN_HEIGHT}
          data={activeUserSelectData}
          flex={2}
          searchable
          label={t(Dictionary.Report.DECLARANT)}
          comboboxProps={{ withinPortal: false }}
        />
        <Flex gap={20} flex={2} align="center">
          <TextInput
            label={t(Dictionary.Report.ADVANCE_RECEIVED_AMOUNT)}
            flex={1}
            mih={TEXT_INPUT_MIN_HEIGHT}
            {...form.getInputProps("advanceReceivedAmount")}
          />
          <Radio.Group {...form.getInputProps("advanceReceivedAmountCurrency")}>
            <Group>
              {filteredCurrency.map((x) => (
                <Radio
                  value={x.value}
                  label={x.label}
                  onClick={() =>
                    handleCurrencyDeselect("advanceReceivedAmountCurrency", x)
                  }
                ></Radio>
              ))}
            </Group>
          </Radio.Group>
        </Flex>
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.Report.TITLE)}
          flex={2}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...form.getInputProps("title")}
        />
        <Flex gap={20} flex={2} align="center">
          <TextInput
            label={t(Dictionary.Report.AMOUNT_TO_BE_REFUNDED)}
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
                  onClick={() =>
                    handleCurrencyDeselect("amountToBeRefundedCurrency", x)
                  }
                ></Radio>
              ))}
            </Group>
          </Radio.Group>
        </Flex>
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.Report.DEPARTMENT)}
          flex={2}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...form.getInputProps("department")}
        />
        <Flex gap={20} flex={2} align="center">
          <TextInput
            label={t(Dictionary.Report.AMOUNT_TO_BE_PAID)}
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
                  onClick={() =>
                    handleCurrencyDeselect("amountToBePaidCurrency", x)
                  }
                ></Radio>
              ))}
            </Group>
          </Radio.Group>
        </Flex>
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.Report.TRAVEL_PLACE)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...form.getInputProps("travelPlace")}
        />
        <Select
          {...form.getInputProps("departmentManager")}
          mih={TEXT_INPUT_MIN_HEIGHT}
          data={managerSelectData}
          flex={1}
          searchable
          label={t(Dictionary.Report.DEPARTMENT_MANAGER)}
          comboboxProps={{ withinPortal: false }}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.Report.PURPOSE_OF_TRAVEL)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...form.getInputProps("purposeOfTravel")}
        />
        <Select
          {...form.getInputProps("departmentHead")}
          mih={TEXT_INPUT_MIN_HEIGHT}
          data={managerSelectData}
          flex={1}
          searchable
          label={t(Dictionary.Report.DEPARTMENT_HEAD)}
          comboboxProps={{ withinPortal: false }}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.Report.DEPARTURE_AND_RETURN_DATES)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          placeholder={`${format(subDays(new Date(), 10), "dd.MM.yyyy")} - ${format(new Date(), "dd.MM.yyyy")}`}
          maxLength={21}
          {...form.getInputProps("departureAndReturnDates")}
        />
        <TextInput
          label={t(Dictionary.Report.FINANCE_OFFICER)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...form.getInputProps("financeOfficer")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.Report.TL_IBAN)}
          mih={TEXT_INPUT_MIN_HEIGHT}
          flex={2}
          {...form.getInputProps("tlIban")}
          onChange={(e) =>
            form.setFieldValue("tlIban", formatIban(e.currentTarget.value))
          }
        />
        <TextInput
          label={t(Dictionary.Report.EUR_IBAN)}
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
        disabled={!form.isDirty()}
      >
        {t(Dictionary.Report.CREATE_NEW)}
      </Button>
    </Flex>
  );
}

export default CreateReportModal;
