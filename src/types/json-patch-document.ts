type JsonPatchDocument = {
  operationType: number;
  path: string;
  op: string;
  value: string;
};

export default JsonPatchDocument;
