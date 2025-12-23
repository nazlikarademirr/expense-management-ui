import CurrencyType from "../enums/currency-type";
import ExpenseType from "../enums/expense-type";
import Gender from "../enums/gender";
import Role from "../enums/role";

const genders = [
  {
    value: Gender.Male.toString(),
    label: "Male",
  },
  {
    value: Gender.Female.toString(),
    label: "Female",
  },
];

const roles = [
  {
    value: Role.Admin.toString(),
    label: "Admin",
  },
  {
    value: Role.Manager.toString(),
    label: "Manager",
  },
  {
    value: Role.User.toString(),
    label: "User",
  },
];

const expenseTypes = [
  {
    value: ExpenseType.Food.toString(),
    label: "Food",
  },
  {
    value: ExpenseType.Transportation.toString(),
    label: "Transportation",
  },
];

const currencyTypes = [
  {
    value: CurrencyType.TL.toString(),
    label: "TL",
  },
  {
    value: CurrencyType.Euro.toString(),
    label: "Euro",
  },
  {
    value: CurrencyType.Dollar.toString(),
    label: "Dollar",
  },
  {
    value: CurrencyType.MalaysianRinggit.toString(),
    label: "MalaysianRinggit",
  },
];

export { genders, roles, expenseTypes, currencyTypes };
