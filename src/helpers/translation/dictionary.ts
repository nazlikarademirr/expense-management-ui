abstract class Dictionary {
  static Expense = class {
    static readonly EXPENSE_DATE_VALID = "expense.expenseDateValid";
    static readonly EXPENSE_TOTAL_PRICE_VALID =
      "expense.expenseTotalPriceValid";
    static readonly YOU_CAN_NOT_ADD_YOURSELF_AS_OVERTIME_MEMBER =
      "expense.youCanNotAddYourselfAsOvertimeMember";
    static readonly EXPENSE_ADDED = "expense.expenseAdded";
    static readonly EXPENSE_DELETED = "expense.expenseDeleted";
    static readonly OVERTIME_MEMBER_VALID = "expense.overtimeMemberValid";
    static readonly USER_NAME = "expense.userName";
    static readonly PROJECT_NAME = "expense.projectName";
    static readonly EXPENSE_DATE = "expense.expenseDate";
    static readonly TRIP_DESCRIPTION = "expense.tripDescription";
    static readonly CURRENCY = "expense.currency";
    static readonly OUT_OF_OFFICE = "expense.outOfOffice";
    static readonly PRICE = "expense.price";
    static readonly ADD_OVERTIME_MEMBER = "expense.addOvertimeMember";
    static readonly CREATE_USER = "expense.createUser";
    static readonly CREATE_DATE = "expense.createDate";
    static readonly ADD_NEW_EXPENSE = "expense.addNewExpense";
    static readonly SELECT_USER = "expense.selectUser";
    static readonly SELECT_REPORT = "expense.selectReport";
    static readonly SHOW_UNAPPROVED_EXPENSES = "expense.showUnapprovedExpenses";
    static readonly REPORT_NAME = "expense.reportName";
    static readonly TOTAL_PRICE = "expense.totalPrice";
    static readonly EXPENSE_TYPE = "expense.expenseType";
    static readonly EDIT = "expense.edit";
    static readonly DELETE = "expense.delete";
    static readonly FOOD = "expense.food";
    static readonly TRANSPORTATION = "expense.transportation";
    static readonly CANCEL = "expense.cancel";
    static readonly EXPENSES = "expense.expenses";
    static readonly DELETE_EXPENSE = "expense.deleteExpense";
    static readonly DELETE_EXPENSE_QUESTION = "expense.deleteExpenseQuestion";
  };
}

export default Dictionary;
