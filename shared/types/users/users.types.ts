import type { Permission } from "./users.permissions";
import type { Role } from "./users.roles";
import type { UserSettings } from "./users.settings";

type BaseUser = {
    id: string;
    username: string;
    display_name: string;
};

type ClientUser = BaseUser & {
    is_enabled: boolean;
    role: Role;
    permissions: Permission[];
    settings: UserSettings;
};

export { type BaseUser, type ClientUser };
