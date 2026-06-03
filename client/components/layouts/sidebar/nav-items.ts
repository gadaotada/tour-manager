import {
  Contact,
  CreditCard,
  FileText,
  Hotel,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";
import { PERMISSIONS } from "@tour-manager/shared";

import { APP_PATHS } from "@libs/routes/app-paths";

import type { NavItem } from "./types";

const mainNavItems: NavItem[] = [
  {
    labelKey: "dashboard.nav.dashboard",
    icon: LayoutDashboard,
    to: APP_PATHS.dashboard,
  },
  {
    labelKey: "dashboard.nav.contracts",
    icon: FileText,
    to: APP_PATHS.contracts,
  },
  {
    labelKey: "dashboard.nav.hotels",
    icon: Hotel,
    to: APP_PATHS.hotels,
  },
  {
    labelKey: "dashboard.nav.clients",
    icon: Contact,
    to: APP_PATHS.clients,
  },
  {
    labelKey: "dashboard.nav.payments",
    icon: CreditCard,
    to: APP_PATHS.payments,
  },
  {
    labelKey: "dashboard.nav.users",
    icon: Users,
    anyPermissions: [PERMISSIONS.USERS.READ_ANY, PERMISSIONS.USERS.READ_NON_ADMIN],
    to: APP_PATHS.users,
  },
];

const operationsNavItems: NavItem[] = [
  {
    labelKey: "dashboard.nav.logs",
    icon: ScrollText,
    to: APP_PATHS.logs,
  },
  {
    labelKey: "dashboard.nav.templates",
    icon: FileText,
    to: APP_PATHS.templates,
  },
  {
    labelKey: "dashboard.nav.settings",
    icon: Settings,
    to: APP_PATHS.settings,
  },
];

export { mainNavItems, operationsNavItems };
