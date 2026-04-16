abstract class Dictionary {
  static Common = class {
    static readonly ENGLISH = "common.english";
    static readonly TURKISH = "common.turkish";
    static readonly EDIT = "common.edit";
    static readonly DELETE = "common.delete";
    static readonly CANCEL = "common.cancel";
    static readonly CREATE_USER = "common.createUser";
    static readonly CREATE_DATE = "common.createDate";
  };

  static Expense = class {
    static readonly DATE_VALID = "expense.dateValid";
    static readonly TOTAL_PRICE_VALID = "expense.totalPriceValid";
    static readonly YOU_CAN_NOT_ADD_YOURSELF_AS_OVERTIME_MEMBER =
      "expense.youCanNotAddYourselfAsOvertimeMember";
    static readonly ADDED = "expense.added";
    static readonly DELETED = "expense.deleted";
    static readonly OVERTIME_MEMBER_VALID = "expense.overtimeMemberValid";
    static readonly USER_NAME = "expense.userName";
    static readonly PROJECT_NAME = "expense.projectName";
    static readonly DATE = "expense.date";
    static readonly TRIP_DESCRIPTION = "expense.tripDescription";
    static readonly CURRENCY = "expense.currency";
    static readonly OUT_OF_OFFICE = "expense.outOfOffice";
    static readonly PRICE = "expense.price";
    static readonly ADD_OVERTIME_MEMBER = "expense.addOvertimeMember";
    static readonly ADD_NEW = "expense.addNew";
    static readonly SELECT_USER = "expense.selectUser";
    static readonly SELECT_REPORT = "expense.selectReport";
    static readonly SHOW_UNAPPROVED = "expense.showUnapproved";
    static readonly REPORT_NAME = "expense.reportName";
    static readonly TOTAL_PRICE = "expense.totalPrice";
    static readonly TYPE = "expense.type";
    static readonly FOOD = "expense.food";
    static readonly TRANSPORTATION = "expense.transportation";
    static readonly EXPENSES = "expense.expenses";
    static readonly DELETE = "expense.delete";
    static readonly DELETION_QUESTION = "expense.deletionQuestion";
  };
}

export default Dictionary;
