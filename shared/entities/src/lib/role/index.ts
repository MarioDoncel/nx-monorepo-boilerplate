export enum RoleEnum {
  ADMIN = 'admin',
  MASTER_ADMIN = 'master_admin',
  USER = 'user',
}

export interface Role {
  name: RoleEnum;
}
