import { RoleEnum } from "../role";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string | null;
  google_id?: string | null;
  roles: RoleEnum[];
  created_at: string | Date;
}
