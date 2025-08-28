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

export function createJsonPatchDocumentFromObjectOrDirtyForm<T>(
  obj: T,
  form?: UseFormReturnType<T>
): JsonPatchKeyValuePair[] {
  const jsonPatchList: JsonPatchKeyValuePair[] = [];

  let property: keyof typeof obj;

  for (property in obj) {
    if (form === undefined || form?.isDirty(property)) {
      jsonPatchList.push({ path: property, value: String(obj[property]) });
    }
  }

  return createJsonPatchDocument(jsonPatchList);
}
