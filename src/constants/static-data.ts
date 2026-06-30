import { t } from "i18next";
import CurrencyType from "../enums/currency-type";
import ExpenseType from "../enums/expense-type";
import Gender from "../enums/gender";
import Role from "../enums/role";
import Dictionary from "../helpers/translation/dictionary";

const genders = [
  {
    value: Gender.Male,
    label: t(Dictionary.Common.MALE),
  },
  {
    value: Gender.Female,
    label: t(Dictionary.Common.FEMALE),
  },
];

const roles = [
  {
    value: Role.Admin,
    label: t(Dictionary.Common.ADMIN),
  },
  {
    value: Role.Manager,
    label: t(Dictionary.Common.MANAGER),
  },
  {
    value: Role.User,
    label: t(Dictionary.Common.USER),
  },
];

const expenseTypes = [
  {
    value: ExpenseType.Food,
    label: t(Dictionary.Expense.FOOD),
  },
  {
    value: ExpenseType.Transportation,
    label: t(Dictionary.Expense.TRANSPORTATION),
  },
  {
    value: ExpenseType.Other,
    label: t(Dictionary.Common.OTHER),
  },
];

const currencyTypes = [
  {
    value: CurrencyType.TL,
    label: t(Dictionary.Common.TL),
  },
  {
    value: CurrencyType.Euro,
    label: t(Dictionary.Common.EURO),
  },
  {
    value: CurrencyType.Dollar,
    label: t(Dictionary.Common.DOLLAR),
  },
  {
    value: CurrencyType.MalaysianRinggit,
    label: t(Dictionary.Common.MALAYSIAN_RINGGIT),
  },
];

export { genders, roles, expenseTypes, currencyTypes };
