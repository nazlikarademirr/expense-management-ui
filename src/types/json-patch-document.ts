import { UseFormReturnType } from "@mantine/form";

enum JsonPatchOperationType {
  Add = "add",
  Replace = "replace",
  Move = "move",
  Test = "test",
  Remove = "remove",
}

type JsonPatchOperation = {
  op: JsonPatchOperationType;
  path: string;
  value: string;
};

export interface JsonPatchKeyValuePair {
  path: string;
  value: string;
}

function addOperations(
  patchList: JsonPatchKeyValuePair[]
): JsonPatchOperation[] {
  const operationList: JsonPatchOperation[] = [];
  patchList.forEach((x) => {
    operationList.push({
      op: JsonPatchOperationType.Replace,
      path: `/${x.path}`,
      value: x.value,
    });
  });
  return operationList;
}

export function createJsonPatchDocument(patchList: JsonPatchKeyValuePair[]) {
  const operationList = addOperations(patchList);
  return operationList;
}

export function createJsonPatchDocumentFromObject<T>(
  obj: T
): JsonPatchKeyValuePair[] {
  const jsonPatchList: JsonPatchKeyValuePair[] = [];

  let property: keyof typeof obj;

  for (property in obj) {
    jsonPatchList.push({ path: property, value: String(obj[property]) });
  }

  return createJsonPatchDocument(jsonPatchList);
}

export function createJsonPatchDocumentFromDirtyForm<T>(
  form: UseFormReturnType<T>,
  obj: T
): JsonPatchKeyValuePair[] {
  const jsonPatchList: JsonPatchKeyValuePair[] = [];

  let property: keyof typeof obj;

  for (property in obj) {
    if (form?.isDirty(property)) {
      jsonPatchList.push({ path: property, value: String(obj[property]) });
    }
  }

  return createJsonPatchDocument(jsonPatchList);
}
