
export enum UserLevel {
  ATTENDANT = 'ATTENDANT',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

export interface IUser {
  name: string;
  email: string;
  level: UserLevel;
}
