import z from "zod/v4";

type Report = {
  id: string;
  name: string;
  isApproved: boolean;
  searchText: string;
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

type ReportRequest = {
  name: string;
  isApproved: boolean;
};

const reportSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must have at least 2 letters.")
    .max(128, "Name cannot exceed 128 characters."),
});

export default reportSchema;
export type { Report, ReportRequest };
