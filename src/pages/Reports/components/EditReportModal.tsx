import {
  Button,
  Checkbox,
  Flex,
  Group,
  Radio,
  Select,
  TextInput,
  Autocomplete,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import Dictionary from "../../../helpers/translation/dictionary";
import { useForm } from "@mantine/form";
import reportSchema, { Report } from "../../../types/report.types";
import { Team } from "../../../types/team.types";
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
import { User } from "../../../types/user.types";

const TEXT_INPUT_MIN_HEIGHT = 90;

interface EditAbroadReportModalProps {
  report: Report;
  updateReport: (formEditedReport: Report) => void;
  checkIfReportIsValid: (report: Report) => boolean;
  activeUsers: User[];
  activeUserSelectData: SelectItem[];
  managerSelectData: SelectItem[];
  projectSelectData: string[];
  travelPlaceSelectData: { value: string; label: string | null }[];
  namePlaceholder: string;
}

function EditAbroadReportModal({
  report,
  updateReport,
  checkIfReportIsValid,
  activeUsers,
  activeUserSelectData,
  managerSelectData,
  projectSelectData,
  travelPlaceSelectData,
  namePlaceholder,
}: EditAbroadReportModalProps) {
  const { t } = useTranslation();

  const { handleDataRequest } = useRequestHandler();

  const [isLoading, setIsLoading] = useState(false);

  const [teams, setTeams] = useState<Team[]>([]);

  const reportForm = useForm<Report>({
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

  const handleCurrencyDeselect = (
    field: keyof typeof reportForm.values,
    selectItem: { value: CurrencyType; label: string },
  ) => {
    if (reportForm.values[field] === selectItem.value) {
      reportForm.setFieldValue(field, null);
    }
  };

  const handleDeclarantChange = (value: string | null) => {
    const declarant = value ?? "";

    if (!declarant) {
      reportForm.setValues({
        declarant,
        title: "",
        tlIban: "",
        department: "",
        departmentManager: "",
        departmentHead: "",
      });
      return;
    }

    const selectedUser = activeUsers.find((x) => x.id === declarant);
    const selectedTeam = selectedUser?.teamId
      ? teams.find((x) => x.id === selectedUser.teamId)
      : null;

    reportForm.setValues({
      declarant,
      title: selectedUser?.title ?? "",
      tlIban: selectedUser?.iban ? formatIban(selectedUser.iban) : "",
      department: selectedTeam?.department ?? reportForm.values.department,
      departmentManager:
        selectedTeam?.departmentManager ?? reportForm.values.departmentManager,
      departmentHead:
        selectedTeam?.departmentHead ?? reportForm.values.departmentHead,
    });
  };

  const getTeams = async () => {
    const response = await handleDataRequest<never, Team[]>(
      urls.team,
      RequestType.Get,
    );
    if (!response.isSuccess) return;
    setTeams(response.value);
  };

  useEffect(() => {
    getTeams();
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  return (
    <Flex direction="column" mih={TEXT_INPUT_MIN_HEIGHT}>
      <Flex gap={20}>
        <Flex flex={1} gap={10} align="center">
          <TextInput
            label={t(Dictionary.Report.NAME)}
            mih={TEXT_INPUT_MIN_HEIGHT}
            withAsterisk
            placeholder={namePlaceholder}
            flex={1}
            {...reportForm.getInputProps("name")}
          />
          <Checkbox
            labelPosition="left"
            label={t(Dictionary.Report.ABROAD)}
            mb={10}
            {...reportForm.getInputProps("isAbroad", { type: "checkbox" })}
          />
        </Flex>
        <TextInput
          label={t(Dictionary.Report.REQUESTED_ADVANCE_AMOUNT)}
          mih={TEXT_INPUT_MIN_HEIGHT}
          flex={1}
          {...reportForm.getInputProps("requestedAdvanceAmount")}
        />
      </Flex>
      <Flex gap={20}>
        <Select
          {...reportForm.getInputProps("declarant")}
          mih={TEXT_INPUT_MIN_HEIGHT}
          data={activeUserSelectData}
          flex={2}
          searchable
          clearable
          label={t(Dictionary.Report.DECLARANT)}
          comboboxProps={{ withinPortal: false }}
          onChange={handleDeclarantChange}
        />
        <Flex gap={20} flex={2} align="center">
          <TextInput
            label={t(Dictionary.Report.ADVANCE_RECEIVED_AMOUNT)}
            flex={1}
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
          {...reportForm.getInputProps("title")}
        />
        <Flex gap={20} flex={2} align="center">
          <TextInput
            label={t(Dictionary.Report.AMOUNT_TO_BE_REFUNDED)}
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
          label={t(Dictionary.Team.DEPARTMENT)}
          flex={2}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...reportForm.getInputProps("department")}
        />
        <Flex gap={20} flex={2} align="center">
          <TextInput
            label={t(Dictionary.Report.AMOUNT_TO_BE_PAID)}
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
        <Autocomplete
          label={t(Dictionary.Report.TRAVEL_PLACE)}
          flex={1}
          clearable
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...reportForm.getInputProps("travelPlace")}
          data={travelPlaceSelectData}
          comboboxProps={{ withinPortal: false }}
        />
        <Autocomplete
          {...reportForm.getInputProps("departmentManager")}
          mih={TEXT_INPUT_MIN_HEIGHT}
          data={managerSelectData}
          flex={1}
          clearable
          label={t(Dictionary.Team.DEPARTMENT_MANAGER)}
          comboboxProps={{ withinPortal: false }}
        />
      </Flex>
      <Flex gap={20}>
        <Autocomplete
          label={t(Dictionary.Report.PURPOSE_OF_TRAVEL)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          data={projectSelectData}
          placeholder={t(Dictionary.Report.PURPOSE_OF_TRAVEL_PLACEHOLDER)}
          clearable
          {...reportForm.getInputProps("purposeOfTravel")}
        />
        <Autocomplete
          {...reportForm.getInputProps("departmentHead")}
          mih={TEXT_INPUT_MIN_HEIGHT}
          data={managerSelectData}
          flex={1}
          clearable
          label={t(Dictionary.Team.DEPARTMENT_HEAD)}
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
          {...reportForm.getInputProps("departureAndReturnDates")}
        />
        <TextInput
          label={t(Dictionary.Report.FINANCE_OFFICER)}
          flex={1}
          mih={TEXT_INPUT_MIN_HEIGHT}
          {...reportForm.getInputProps("financeOfficer")}
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.Report.TL_IBAN)}
          mih={TEXT_INPUT_MIN_HEIGHT}
          flex={1}
          {...reportForm.getInputProps("tlIban")}
          onChange={(e) =>
            reportForm.setFieldValue(
              "tlIban",
              formatIban(e.currentTarget.value),
            )
          }
        />
        <TextInput
          label={t(Dictionary.Report.EUR_IBAN)}
          mih={TEXT_INPUT_MIN_HEIGHT}
          flex={1}
          {...reportForm.getInputProps("eurIban")}
          onChange={(e) =>
            reportForm.setFieldValue(
              "eurIban",
              formatIban(e.currentTarget.value),
            )
          }
        />
      </Flex>
      <Flex gap={20}>
        <TextInput
          label={t(Dictionary.Common.CREATE_USER)}
          value={report.createUserFullName}
          mih={TEXT_INPUT_MIN_HEIGHT}
          disabled
          flex={1}
        />
        <TextInput
          label={t(Dictionary.Common.CREATE_DATE)}
          value={format(report.createDate, "dd/MM/yyyy - HH.mm")}
          mih={TEXT_INPUT_MIN_HEIGHT}
          disabled
          flex={1}
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
