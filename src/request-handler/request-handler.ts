export interface PaginationMetaData {
  TotalItemCount: number;
  TotalPageCount: number;
  PageSize: number;
  CurrentPage: number;
}

export interface ResponseBase<T> {
  detail: string;
  data: T;
  dataList: Array<T>;
  errors: ResponseErrorArrayDto;
  isSuccess: boolean;
  metaData: PaginationMetaData;
  status?: number;
}

export interface SuccessResponse<T> {
  detail: string;
  data: T;
  dataList: Array<T>;
  errors: ResponseErrorArrayDto;
  isSuccess: boolean;
  metaData: PaginationMetaData;
  status?: number;
}

export interface FailureResponse {
  detail: string;
  errors: ResponseErrorArrayDto;
  isSuccess: boolean;
  status?: number;
}

export interface ResponseErrorArrayDto {
  [key: string]: Array<string>;
}
