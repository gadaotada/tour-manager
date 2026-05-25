import type { Permission } from "./users.permissions";
import type { Role } from "./users.roles";
import type { UserSettings } from "./users.settings";

type BaseUser = {
  id: string;
  username: string;
  displayName: string;
};

type ClientUser = BaseUser & {
  isEnabled: boolean;
  role: Role;
  permissions: Permission[];
  settings: UserSettings;
};

export { type BaseUser, type ClientUser };
