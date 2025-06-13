import parseResponseErrors from "../helpers/apiErrorParser";
import RequestType from "../request-handler/request.type";
import toast from "react-hot-toast";

interface SuccessResponse<T> {
  isSuccess: true;
  metadata: undefined;
  value: T;
}

interface FailureResponse {
  isSuccess: false;
  error: string;
}

export type ResponseBase<T> = SuccessResponse<T> | FailureResponse;

function useRequestHandler() {
  async function fetchData<T>(
    url: string,
    searchParameters?: { [key: string]: string | number | boolean }
    // headers?: HeadersInit
  ): Promise<ResponseBase<T>> {
    const link = new URL(url);

    if (searchParameters) {
      Object.entries(searchParameters).forEach((x) => {
        link.searchParams.set(x[0], String(x[1]));
      });
    }

    const requestHeaders = new Headers();

    return fetch(link, { method: RequestType.Get, headers: requestHeaders })
      .then(async (response) => {
        const responseJson = await response.json();

        if (!response.ok) {
          if (responseJson.errors !== undefined) {
            const validationErrors = parseResponseErrors(responseJson.errors);

            toast.error(validationErrors);

            return {
              isSuccess: false,
              error: parseResponseErrors(responseJson.errors),
            } as FailureResponse;
          }

          if (response.status === 500) {
            if (responseJson.traceId !== undefined) {
              return {
                isSuccess: false,
                error: responseJson.traceId,
              } as FailureResponse;
            }

            return {
              isSuccess: false,
              error: responseJson as string,
            } as FailureResponse;
          }

          return {
            isSuccess: false,
            error: responseJson as string,
          } as FailureResponse;
        }

        let paginationJson = response.headers.get("x-pagination");

        if (paginationJson) paginationJson = JSON.parse(paginationJson);

        return {
          isSuccess: true,
          metadata: paginationJson ? paginationJson : undefined,
          value: responseJson,
        } as SuccessResponse<T>;
      })
      .catch((error) => {
        return {
          isSuccess: false,
          error: error instanceof Error ? error.message : String(error),
        } as FailureResponse;
      });
  }

  async function sendData<dataResponse, dataRequest>(
    url: string,
    searchParameters?: { [key: string]: string | number | boolean },
    data?: dataRequest
  ): Promise<ResponseBase<dataResponse>> {
    const link = new URL(url);

    if (searchParameters) {
      Object.entries(searchParameters).forEach((x) => {
        link.searchParams.set(x[0], String(x[1]));
      });
    }

    // const requestHeaders = new Headers();

    return fetch(link, {
      method: RequestType.Post,
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
    })
      .then(async (response) => {
        const responseJson = await response.json();

        if (!response.ok) {
          if (responseJson.errors !== undefined) {
            const validationErrors = parseResponseErrors(responseJson.errors);

            toast.error(validationErrors);

            return {
              isSuccess: false,
              error: parseResponseErrors(responseJson.errors),
            } as FailureResponse;
          }

          if (response.status === 500) {
            if (responseJson.traceId !== undefined) {
              return {
                isSuccess: false,
                error: responseJson.traceId,
              } as FailureResponse;
            }

            return {
              isSuccess: false,
              error: responseJson as string,
            } as FailureResponse;
          }

          return {
            isSuccess: false,
            error: responseJson as string,
          } as FailureResponse;
        }
        let paginationJson = response.headers.get("x-pagination");

        if (paginationJson) paginationJson = JSON.parse(paginationJson);

        return {
          isSuccess: true,
          metadata: paginationJson ? paginationJson : undefined,
          value: responseJson,
        } as SuccessResponse<dataResponse>;
      })
      .catch((error) => {
        return {
          isSuccess: false,
          error: error instanceof Error ? error.message : String(error),
        } as FailureResponse;
      });
  }

  async function handleDataRequest<Request, Response>(
    url: string,
    requestType: RequestType,
    requestData?: Request,
    searchParameters?: { [key: string]: string | string | number | boolean }
  ): Promise<ResponseBase<Response>> {
    const link = new URL(url);

    if (searchParameters) {
      Object.entries(searchParameters).forEach((x) => {
        link.searchParams.set(x[0], String(x[1]));
      });
    }
    // const requestHeaders = new Headers();

    return fetch(link, {
      method: requestType,
      headers: { "Content-Type": "application/json" },
      body: requestData ? JSON.stringify(requestData) : undefined,
    })
      .then(async (response) => {
        if (response.status === 204) {
          return {
            isSuccess: true,
          } as SuccessResponse<Response>;
        }

        const responseJson = await response.json();
        if (!response.ok) {
          if (responseJson.errors !== undefined) {
            const validationErrors = parseResponseErrors(responseJson.errors);

            toast.error(validationErrors);

            return {
              isSuccess: false,
              error: parseResponseErrors(responseJson.errors),
            } as FailureResponse;
          }

          if (response.status === 500) {
            if (responseJson.traceId !== undefined) {
              return {
                isSuccess: false,
                error: responseJson.traceId,
              } as FailureResponse;
            }

            return {
              isSuccess: false,
              error: responseJson as string,
            } as FailureResponse;
          }

          return {
            isSuccess: false,
            error: responseJson as string,
          } as FailureResponse;
        }

        let paginationJson = response.headers.get("x-pagination");

        if (paginationJson) paginationJson = JSON.parse(paginationJson);

        return {
          isSuccess: true,
          metadata: paginationJson ? paginationJson : undefined,
          value: responseJson as Response,
        } as SuccessResponse<Response>;
      })
      .catch((error) => {
        return {
          isSuccess: false,
          error: error instanceof Error ? error.message : String(error),
        } as FailureResponse;
      });
  }

  return { fetchData, sendData, handleDataRequest };
}

export default useRequestHandler;
