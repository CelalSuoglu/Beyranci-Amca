export const APP_ROLES = ["customer", "staff", "admin"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  customer: "Müşteri",
  staff: "Personel",
  admin: "Yönetici",
};

export function isStaffRole(role: AppRole | null | undefined): boolean {
  return role === "staff" || role === "admin";
}
