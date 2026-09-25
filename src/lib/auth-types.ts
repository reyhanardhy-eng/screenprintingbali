export type AppRole = "customer" | "admin";

export type PublicUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
};

export type ChatPrincipal = PublicUser;

