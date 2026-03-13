import z from "zod/v4";

type Project = {
  id: string;
  name: string;
  code: string;
  searchText: string;
  isActive: boolean;
  createUser: string;
  createUserFullName: string;
  createDate: Date;
};

type ProjectRequest = {
  name: string;
  code: string;
};

const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must have at least 2 letters.")
    .max(128, "Name cannot exceed 128 characters."),
  code: z
    .string()
    .trim()
    .min(2, "Code must have at least 2 letters.")
    .max(128, "Code cannot exceed 128 characters."),
});

export default projectSchema;
export type { Project, ProjectRequest };
