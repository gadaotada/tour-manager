import { DesktopSidebar } from "./desktop-sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import type { AppSidebarProps } from "./types";

function AppSidebar(props: AppSidebarProps) {
  if (props.variant === "mobile") {
    return <MobileSidebar {...props} />;
  }

  return <DesktopSidebar {...props} />;
}

export { AppSidebar };
