import type { MessageKey } from "@tour-manager/shared";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  icon: LucideIcon;
  labelKey: MessageKey;
  to: string;
};

type AppSidebarProps =
  | {
      isExpanded: boolean;
      onLogout: () => void;
      userName: string | undefined;
      variant: "desktop";
    }
  | {
      isOpen: boolean;
      onClose: () => void;
      onLogout: () => void;
      userName: string | undefined;
      variant: "mobile";
    };

type DesktopSidebarProps = Extract<AppSidebarProps, { variant: "desktop" }>;
type MobileSidebarProps = Extract<AppSidebarProps, { variant: "mobile" }>;

export type { AppSidebarProps, DesktopSidebarProps, MobileSidebarProps, NavItem };
