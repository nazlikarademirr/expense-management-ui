import parseResponseErrors from "../helpers/apiErrorParser";
import RequestType from "../request-handler/request-type";
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
  const sessionToken = sessionStorage.getItem("token");

  async function handleDataRequest<Request, Response>(
    url: string,
    requestType: RequestType,
    requestData?: Request,
    searchParameters?: { [key: string]: string | string | number | boolean },
  ): Promise<ResponseBase<Response>> {
    const link = new URL(url);

    if (searchParameters) {
      Object.entries(searchParameters).forEach((x) => {
        link.searchParams.set(x[0], String(x[1]));
      });
    }

    return fetch(link, {
      method: requestType,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
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
          if (response.status === 401) {
            return {
              isSuccess: false,
              error: responseJson.detail,
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

          if (responseJson.errors !== undefined) {
            const validationErrors = parseResponseErrors(responseJson.errors);

            toast.error(validationErrors);

            return {
              isSuccess: false,
              error: parseResponseErrors(responseJson.errors),
            } as FailureResponse;
          }

          if (responseJson.detail !== undefined) {
            toast.error(responseJson.detail);

            return {
              isSuccess: false,
              error: responseJson.detail,
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

  async function downloadFile<T>(
    url: string,
    fileName: string,
    data?: T,
    searchParameters?: { [key: string]: string | number | boolean },
  ): Promise<boolean> {
    const link = new URL(url);

    if (searchParameters) {
      Object.entries(searchParameters).forEach((x) => {
        link.searchParams.set(x[0], String(x[1]));
      });
    }

    return fetch(link, {
      method: RequestType.Post,
      body: data ? JSON.stringify(data) : undefined,
    })
      .then(async (response) => {
        if (!response.ok) {
          const responseJson = await response.json();

          if (responseJson.errors !== undefined) {
            const validationErrors = parseResponseErrors(responseJson.errors);

            toast.error(validationErrors);
          }

          if (responseJson.detail !== undefined) {
            toast.error(responseJson.detail);
          }

          return false;
        }

        const blob: Blob = await response.blob();
        const link: HTMLAnchorElement = document.createElement("a");

        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();

        URL.revokeObjectURL(link.href);

        return true;
      })
      .catch(() => false);
  }

  return { handleDataRequest, downloadFile };
}

export default useRequestHandler;
