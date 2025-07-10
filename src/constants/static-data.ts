import CurrencyType from "../enums/currency-type";
import ExpenseType from "../enums/expense-type";
import Gender from "../enums/gender";
import Role from "../enums/role";

const genders = [
  {
    value: Gender.Male,
    label: "Male",
  },
  {
    value: Gender.Female,
    label: "Female",
  },
];

const roles = [
  {
    value: Role.Admin,
    label: "Admin",
  },
  {
    value: Role.Manager,
    label: "Manager",
  },
  {
    value: Role.User,
    label: "User",
  },
];

const expenseTypes = [
  {
    value: ExpenseType.Food,
    label: "Food",
  },
  {
    value: ExpenseType.Transportation,
    label: "Transportation",
  },
];

const currencyTypes = [
  {
    value: CurrencyType.TL,
    label: "TL",
  },
  {
    value: CurrencyType.Euro,
    label: "Euro",
  },
  {
    value: CurrencyType.Dollar,
    label: "Dollar",
  },
  {
    value: CurrencyType.MalaysianRinggit,
    label: "MalaysianRinggit",
  },
];

export { genders, roles, expenseTypes, currencyTypes };
