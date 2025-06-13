import { ResponseErrorArrayDto } from "../request-handler/request-handler";

const parseResponseErrors = (errors: ResponseErrorArrayDto) => {
  let validationError = Object.values(errors).toString();
  validationError = validationError.replace(",", "\n");

  return validationError;
};

export default parseResponseErrors;
