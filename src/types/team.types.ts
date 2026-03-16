import z from "zod/v4";

type Team = {
  id: string;
  name: string;
  searchText: string;
  isActive: boolean;
  createUserId: string;
  createUserFullName: string;
  createDate: Date;
};

type TeamRequest = {
  name: string;
};

const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must have at least 2 letters.")
    .max(128, "Name cannot exceed 128 characters."),
});

export default teamSchema;
export type { Team, TeamRequest };
