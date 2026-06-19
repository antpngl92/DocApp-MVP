"use client";

import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardPlus,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { useState } from "react";

import { ROUTES } from "@/config/routes";

import type { DashboardSidebarProps } from "./types";

const iconByKey = {
  bell: Bell,
  calendar: CalendarDays,
  clipboardPlus: ClipboardPlus,
  fileText: FileText,
  layoutDashboard: LayoutDashboard,
  settings: Settings,
  stethoscope: Stethoscope,
  users: Users,
} as const;

const isActiveDashboardItem = (pathname: string, href: string): boolean => {
  if (href === ROUTES.dashboard) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

const DashboardSidebar = ({ content, currentUserName, items }: DashboardSidebarProps) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const ToggleIcon = isCollapsed ? ChevronRight : ChevronLeft;

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-[var(--border)] bg-white transition-[width] duration-200 ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      <div
        className={`flex border-b border-[var(--border)] px-4 ${
          isCollapsed
            ? "min-h-28 flex-col items-center justify-center gap-3 py-4"
            : "min-h-20 items-center justify-between gap-3"
        }`}
      >
        <Link
          aria-label="DocApp dashboard"
          className={`flex min-w-0 items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}
          href={ROUTES.dashboard}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[var(--primary)]">
            <Stethoscope aria-hidden="true" size={22} strokeWidth={2} />
          </span>
          {!isCollapsed ? (
            <span className="min-w-0">
              <strong className="block truncate text-sm text-[var(--text-strong)]">DocApp</strong>
              {currentUserName ? (
                <span className="block truncate text-xs text-[var(--text-muted)]">
                  {currentUserName}
                </span>
              ) : null}
            </span>
          ) : null}
        </Link>
        <button
          aria-label={isCollapsed ? content.expandLabel : content.collapseLabel}
          className="grid size-9 shrink-0 place-items-center rounded-md border border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-strong)]"
          onClick={() => setIsCollapsed((currentValue) => !currentValue)}
          type="button"
        >
          <ToggleIcon aria-hidden="true" size={18} strokeWidth={2} />
        </button>
      </div>

      <nav aria-label={content.navigationLabel} className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = iconByKey[item.iconKey];
            const isActive = isActiveDashboardItem(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-50 text-[var(--primary)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-strong)]"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon aria-hidden="true" className="shrink-0" size={19} strokeWidth={2} />
                  {!isCollapsed ? <span className="truncate">{item.label}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        <SignOutButton redirectUrl={ROUTES.home}>
          <button
            className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-strong)] ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? content.signOutLabel : undefined}
            type="button"
          >
            <LogOut aria-hidden="true" className="shrink-0" size={19} strokeWidth={2} />
            {!isCollapsed ? <span className="truncate">{content.signOutLabel}</span> : null}
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
