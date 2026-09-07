// The 5 workspaces a user can sign in as, and how each maps to the
// underlying UserRole (lib/auth.ts). Used by the login page's role picker
// (app/page.tsx).

import {
  Building2,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/auth";

export type RoleKey = "teacher" | "principal" | "educator" | "district" | "sel";

export type RoleOption = {
  key: RoleKey;
  title: string;
  /** Who it's for — rendered as "For {audience}" with audience highlighted. */
  audience: string;
  /** The person's actual role, singular (e.g. "Teacher") — distinct from
   * `title`, which names the workspace/destination (e.g. "My Classroom").
   * Used anywhere a CTA says "Continue as ___" so it names the role the
   * user is signing in as, not the dashboard they're headed to. */
  roleLabel: string;
  Icon: LucideIcon;
  tone: string;
};

export const ROLES: RoleOption[] = [
  {
    key: "teacher",
    title: "My Classroom",
    audience: "teachers",
    roleLabel: "Teacher",
    Icon: GraduationCap,
    tone: "hsl(142 55% 45%)",
  },
  {
    key: "principal",
    title: "School Overview",
    audience: "principals and school leaders",
    roleLabel: "Principal",
    Icon: Building2,
    tone: "hsl(212 90% 58%)",
  },
  {
    key: "educator",
    title: "Student Support",
    audience: "special educators / 504 coordinators",
    roleLabel: "Special Educator",
    Icon: Users,
    tone: "hsl(262 60% 62%)",
  },
  {
    key: "district",
    title: "District Overview",
    audience: "district leaders",
    roleLabel: "District Leader",
    Icon: Landmark,
    tone: "hsl(28 88% 54%)",
  },
  {
    key: "sel",
    title: "SEL Hub",
    audience: "SEL coordinators",
    roleLabel: "SEL Coordinator",
    Icon: HeartHandshake,
    tone: "hsl(330 65% 62%)",
  },
];

export function mapRole(role: RoleKey): UserRole {
  if (role === "principal") return "admin";
  if (role === "district") return "district";
  if (role === "educator") return "specialEducator";
  if (role === "sel") return "selCoordinator";
  return "teacher";
}
