export type AppRole = "admin";

export type PublicUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
};

