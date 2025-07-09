import ExpenseCurrencyType from "../enums/expense-currency-type";
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

const expenseCurrencyTypes = [
  {
    value: ExpenseCurrencyType.TL,
    label: "TL",
  },
  {
    value: ExpenseCurrencyType.Euro,
    label: "Euro",
  },
  {
    value: ExpenseCurrencyType.Dollar,
    label: "Dollar",
  },
  {
    value: ExpenseCurrencyType.MalaysianRinggit,
    label: "MalaysianRinggit",
  },
];

export { genders, roles, expenseTypes, expenseCurrencyTypes };
