const ROLES = {
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  EMPLOYEE: "EMPLOYEE",
} as const;

type Role = (typeof ROLES)[keyof typeof ROLES];

function isRole(value: string): value is Role {
  return Object.values(ROLES).includes(value as Role);
}

export { ROLES, isRole, type Role };
