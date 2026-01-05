export const ROLES = {
  member: "member",
  editor: "editor",
  admin: "admin",
};

const ROLE_WEIGHT = {
  [ROLES.member]: 1,
  [ROLES.editor]: 2,
  [ROLES.admin]: 3,
};

export function canAccess(requiredRole, currentRole) {
  if (!requiredRole) return true;
  if (!currentRole) return false;
  return ROLE_WEIGHT[currentRole] >= ROLE_WEIGHT[requiredRole];
}

export function roleLabel(role) {
  if (!role) return "Guest";
  return role.charAt(0).toUpperCase() + role.slice(1);
}
