abstract class Dictionary {
  static Common = class {
    static readonly EDIT = "common.edit";
    static readonly DELETE = "common.delete";
    static readonly APPROVE = "common.approve";
    static readonly CANCEL = "common.cancel";
    static readonly CLOSE = "common.close";
    static readonly CREATE_USER = "common.createUser";
    static readonly CREATE_DATE = "common.createDate";
    static readonly USERS = "common.users";
    static readonly TEAMS = "common.teams";
    static readonly PROJECTS = "common.projects";
    static readonly EXPENSES = "common.expenses";
    static readonly REPORTS = "common.reports";
    static readonly MALE = "common.male";
    static readonly FEMALE = "common.female";
    static readonly ADMIN = "common.admin";
    static readonly MANAGER = "common.manager";
    static readonly USER = "common.user";
    static readonly EXPENSE_MANAGEMENT = "common.expenseManagement";
    static readonly STATUS = "common.status";
    static readonly LOADING = "common.loading";
    static readonly UNEXPECTED_ERROR = "common.unexpectedError";
    static readonly SAVE = "common.save";
    static readonly OTHER = "common.other";
    static readonly YES = "common.yes";
    static readonly NO = "common.no";
    static readonly ACTIVE = "common.active";
    static readonly PASSIVE = "common.passive";
    static readonly ADD = "common.add";
    static readonly ALL = "common.all";
    static readonly TL = "common.tl";
    static readonly EURO = "common.euro";
    static readonly DOLLAR = "common.dollar";
    static readonly MALAYSIAN_RINGGIT = "common.malaysianRinggit";
    static readonly MACEDONIAN_DENAR = "common.macedonianDenar";
  };

  static Authentication = class {
    static readonly USE_AUTHENTICATION_REQUIRED =
      "authentication.useAuthenticationRequired";
    static readonly SESSION_EXPIRED = "authentication.sessionExpired";
  };

  static UserMenu = class {
    static readonly ENGLISH = "userMenu.english";
    static readonly TURKISH = "userMenu.turkish";
    static readonly SELECT_LANGUAGE = "userMenu.selectLanguage";
    static readonly CHANGE_PASSWORD = "userMenu.changePassword";
    static readonly LOGOUT = "userMenu.logout";
  };

  static Login = class {
    static readonly LOGIN = "login.login";
    static readonly EMAIL = "login.email";
    static readonly PASSWORD = "login.password";
    static readonly PASSWORD_RESET_MESSAGE = "login.passwordResetMessage";
    static readonly PASSWORD_RESETED = "login.passwordReseted";
    static readonly EMAIL_VALID = "login.emailValid";
    static readonly EMAIL_CANNOT_BE_EMPTY = "login.emailCannotBeEmpty";
    static readonly RESET_PASSWORD = "login.resetPassword";
    static readonly EMAIL_OR_PASSWORD_WRONG = "login.emailOrPasswordWrong";
    static readonly FORGOT_MY_PASSWORD = "login.forgotMyPassword";
    static readonly PASSWORD_CANNOT_BE_EMPTY = "login.passwordCannotBeEmpty";
  };

  static User = class {
    static readonly ACTIVATE = "user.activate";
    static readonly DEACTIVATE = "user.deactivate";
    static readonly TEMPORARY_PASSWORD = "user.temporaryPassword";
    static readonly ACTIVATED = "user.activated";
    static readonly DEACTIVATED = "user.deactivated";
    static readonly ADDED = "user.added";
    static readonly SAME_EMAIL = "user.sameEmail";
    static readonly SAME_CARD_NUMBER = "user.sameCardNumber";
    static readonly EDIT = "user.edit";
    static readonly ADD_NEW = "user.addNew";
    static readonly NAME = "user.name";
    static readonly SURNAME = "user.surname";
    static readonly TEAM_NAME = "user.teamName";
    static readonly GENDER = "user.gender";
    static readonly CARD_NUMBER = "user.cardNumber";
    static readonly EMAIL = "user.email";
    static readonly PASSWORD = "user.password";
    static readonly ROLE = "user.role";
    static readonly SELECT_TEAM = "user.selectTeam";
    static readonly SELECT_ROLE = "user.selectRole";
    static readonly SHOW_ACTIVE = "user.showActive";
    static readonly NAME_MIN_LENGTH = "user.nameMinLength";
    static readonly NAME_MAX_LENGTH = "user.nameMaxLength";
    static readonly SURNAME_MIN_LENGTH = "user.surnameMinLength";
    static readonly SURNAME_MAX_LENGTH = "user.surnameMaxLength";
    static readonly TEAM_MUST_BE_SELECTED = "user.teamMustBeSelected";
    static readonly GENDER_MUST_BE_SELECTED = "user.genderMustBeSelected";
    static readonly CARD_NUMBER_CANNOT_BE_EMPTY =
      "user.cardNumberCannotBeEmpty";
    static readonly CARD_NUMBER_MAX_LENGTH = "user.cardNumberMaxLength";
    static readonly EMAIL_RULE = "user.emailRule";
    static readonly EMAIL_MIN_LENGTH = "user.emailMinLength";
    static readonly EMAIL_MAX_LENGTH = "user.emailMaxLength";
    static readonly PASSWORD_MIN_LENGTH = "user.passwordMinLength";
    static readonly PASSWORD_MAX_LENGTH = "user.passwordMaxLength";
    static readonly ROLE_MUST_BE_SELECTED = "user.roleMustBeSelected";
    static readonly UPDATED = "user.updated";
    static readonly PASSWORDS_NOT_MATCH = "user.passwordsNotMatch";
    static readonly PASSWORD_SUCCESSFULLY_UPDATED =
      "user.passwordSuccessfullyUpdated";
    static readonly CURRENT_PASSWORD = "user.currentPassword";
    static readonly NEW_PASSWORD = "user.newPassword";
    static readonly NEW_PASSWORD_AGAIN = "user.newPasswordAgain";
    static readonly CURRENT_PASSWORD_CANNOT_BE_EMPTY =
      "user.currentPasswordCannotBeEmpty";
    static readonly NEW_PASSWORD_CANNOT_BE_EMPTY =
      "user.newPasswordCannotBeEmpty";
    static readonly NEW_PASSWORD_AGAIN_CANNOT_BE_EMPTY =
      "user.newPasswordAgainCannotBeEmpty";
    static readonly PROBLEM_OCCURRED_WITH_USER = "user.problemOccurredWithUser";
    static readonly CHANGE_PASSWORD = "user.changePassword";
    static readonly ACTIVITY_QUESTION = "user.activityQuestion";
    static readonly DEACTIVITY_QUESTION = "user.deactivityQuestion";
    static readonly DEACTIVITY_RULE = "user.deactivityRule";
  };

  static Team = class {
    static readonly NAME = "team.name";
    static readonly ADDED = "team.added";
    static readonly ACTIVITY_CHECK = "team.activityCheck";
    static readonly SAME_NAME = "team.sameName";
    static readonly ACTIVATED = "team.activated";
    static readonly DEACTIVATED = "team.deactivated";
    static readonly ADD_NEW = "team.addNew";
    static readonly ACTIVATE = "team.activate";
    static readonly DEACTIVATE = "team.deactivate";
    static readonly SHOW_ACTIVE = "team.showActive";
    static readonly EDIT = "team.edit";
    static readonly NAME_MIN_LENGTH = "team.nameMinLength";
    static readonly NAME_MAX_LENGTH = "team.nameMaxLength";
    static readonly UPDATED = "team.updated";
    static readonly ACTIVITY_QUESTION = "team.activityQuestion";
    static readonly DEACTIVITY_QUESTION = "team.deactivityQuestion";
  };

  static Project = class {
    static readonly NAME = "project.name";
    static readonly CODE = "project.code";
    static readonly SAME_NAME = "project.sameName";
    static readonly SAME_CODE = "project.sameCode";
    static readonly EDIT = "project.edit";
    static readonly ADDED = "project.added";
    static readonly ACTIVATED = "project.activated";
    static readonly DEACTIVATED = "project.deactivated";
    static readonly ACTIVATE = "project.activate";
    static readonly DEACTIVATE = "project.deactivate";
    static readonly ADD_NEW = "project.addNew";
    static readonly SHOW_ACTIVE = "project.showActive";
    static readonly UPDATED = "project.updated";
    static readonly NAME_MIN_LENGTH = "project.nameMinLength";
    static readonly NAME_MAX_LENGTH = "project.nameMaxLength";
    static readonly CODE_MIN_LENGTH = "project.codeMinLength";
    static readonly CODE_MAX_LENGTH = "project.codeMaxLength";
    static readonly ACTIVITY_QUESTION = "project.activityQuestion";
    static readonly DEACTIVITY_QUESTION = "project.deactivityQuestion";
  };

  static Expense = class {
    static readonly DATE_VALID = "expense.dateValid";
    static readonly TOTAL_PRICE_VALID = "expense.totalPriceValid";
    static readonly ADDED = "expense.added";
    static readonly UPDATED = "expense.updated";
    static readonly DELETED = "expense.deleted";
    static readonly DECLARANT = "expense.declarant";
    static readonly PROJECT_NAME = "expense.projectName";
    static readonly DATE = "expense.date";
    static readonly DESCRIPTION = "expense.description";
    static readonly CURRENCY = "expense.currency";
    static readonly ADD_NEW = "expense.addNew";
    static readonly SELECT_USER = "expense.selectUser";
    static readonly SELECT_REPORT = "expense.selectReport";
    static readonly REPORT_NAME = "expense.reportName";
    static readonly TOTAL_PRICE = "expense.totalPrice";
    static readonly TYPE = "expense.type";
    static readonly FOOD = "expense.food";
    static readonly TRANSPORTATION = "expense.transportation";
    static readonly DELETE = "expense.delete";
    static readonly DELETION_QUESTION = "expense.deletionQuestion";
    static readonly EDIT = "expense.edit";
    static readonly DECLARANT_MUST_BE_SELECTED =
      "expense.declarantMustBeSelected";
    static readonly PROJECT_MUST_BE_SELECTED = "expense.projectMustBeSelected";
    static readonly TYPE_MUST_BE_SELECTED = "expense.typeMustBeSelected";
    static readonly DATE_MUST_BE_SELECTED = "expense.dateMustBeSelected";
    static readonly TOTAL_PRICE_CANNOT_BE_EMPTY =
      "expense.totalPriceCannotBeEmpty";
    static readonly TOTAL_PRICE_CANNOT_BE_ZERO =
      "expense.totalPriceCannotBeZero";
    static readonly CURRENCY_MUST_BE_SELECTED =
      "expense.currencyMustBeSelected";
    static readonly DESCRIPTION_RULE = "expense.descriptionRule";
    static readonly RECEIPT_UPLOADER = "expense.receiptUploader";
    static readonly RECEIPT_SELECT = "expense.receiptSelect";
    static readonly REMOVE_IMAGE = "expense.removeImage";
    static readonly PHOTO_PROCESSING = "expense.photoProcessing";
    static readonly TEXT_NOT_DETECTED = "expense.textNotDetected";
    static readonly ACCURACY_RATE = "expense.accuracyRate";
    static readonly LOW_IMAGE_QUALITY = "expense.lowImageQuality";
    static readonly FILE_UPLOAD_RULE = "expense.fileUploadRule";
    static readonly OCR_REQUEST_TIMED_OUT = "expense.ocrRequestTimedOut";
    static readonly FILE_SIZE = "expense.fileSize";
    static readonly NO_FOUND = "expense.noFound";
    static readonly TEXT_COULD_NOT_BE_DETECTED =
      "expense.textCouldNotBeDetected";
  };

  static OvertimeMember = class {
    static readonly USER_NAME = "overtimeMember.userName";
    static readonly PRICE = "overtimeMember.price";
    static readonly USER_MUST_BE_SELECTED = "overtimeMember.userMustBeSelected";
    static readonly PRICE_CANNOT_BE_EMPTY = "overtimeMember.priceCannotBeEmpty";
    static readonly PRICE_CANNOT_BE_ZERO = "overtimeMember.priceCannotBeZero";
    static readonly ADD_NEW = "overtimeMember.addNew";
    static readonly VALID = "overtimeMember.valid";
    static readonly YOU_CAN_NOT_ADD_YOURSELF_AS_OVERTIME_MEMBER =
      "overtimeMember.youCanNotAddYourselfAsOvertimeMember";
  };

  static Report = class {
    static readonly EDIT = "report.edit";
    static readonly DELETE = "report.delete";
    static readonly DELETE_QUESTION = "report.deleteQuestion";
    static readonly SAME_NAME = "report.sameName";
    static readonly CREATED = "report.created";
    static readonly DELETED = "report.deleted";
    static readonly DOWNLOAD = "report.download";
    static readonly CREATE_NEW = "report.createNew";
    static readonly NAME = "report.name";
    static readonly UPDATED = "report.updated";
    static readonly NAME_MIN_LENGTH = "report.nameMinLength";
    static readonly NAME_MAX_LENGTH = "report.nameMaxLength";
    static readonly DELETE_RULE = "report.deleteRule";
    static readonly SELECT_MESSAGE = "report.selectMessage";
    static readonly SELECT = "report.select";
    static readonly ALL_NAME = "report.allName";
    static readonly ABROAD = "report.abroad";
    static readonly SHOW_ABROAD = "report.showAbroad";
    static readonly TITLE = "report.title";
    static readonly DEPARTMENT = "report.department";
    static readonly REQUESTED_ADVANCE_AMOUNT = "report.requestedAdvanceAmount";
    static readonly TRAVEL_PLACE = "report.travelPlace";
    static readonly DEPARTURE_AND_RETURN_DATES =
      "report.departureAndReturnDates";
    static readonly PURPOSE_OF_TRAVEL = "report.purposeOfTravel";
    static readonly ADVANCE_RECEIVED_AMOUNT = "report.advanceReceivedAmount";
    static readonly ADVANCE_RECEIVED_AMOUNT_CURRENCY =
      "report.advanceReceivedAmountCurrency";
    static readonly AMOUNT_TO_BE_REFUNDED = "report.amountToBeRefunded";
    static readonly AMOUNT_TO_BE_REFUNDED_CURRENCY =
      "report.amountToBeRefundedCurrency";
    static readonly AMOUNT_TO_BE_PAID = "report.amountToBePaid";
    static readonly AMOUNT_TO_BE_PAID_CURRENY = "report.amountToBePaidCurrency";
    static readonly DECLARANT = "report.declarant";
    static readonly DEPARTMENT_MANAGER = "report.departmentManager";
    static readonly DEPARTMENT_HEAD = "report.departmentHead";
    static readonly FINANCE_OFFICER = "report.financeOfficer";
    static readonly TL_IBAN = "report.tlIban";
    static readonly EUR_IBAN = "report.eurIban";
    static readonly INVALID_IBAN = "report.invalidIban";
    static readonly NEW = "report.new";
    static readonly PURPOSE_OF_TRAVEL_PLACEHOLDER =
      "report.purposeOfTravelPlaceholder";
    static readonly MAX_NUMBER_OF_EXPENSES = "report.maxNumberOfExpenses";
  };
}

export default Dictionary;
