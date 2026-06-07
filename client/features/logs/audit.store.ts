import { create } from "zustand";

import type { AuditLog, AuditLogsListResult } from "@tour-manager/shared";

type AuditStore = {
  result: AuditLogsListResult | null;
  setResult: (result: AuditLogsListResult) => void;
};

const EMPTY_AUDITS: AuditLog[] = [];

const auditStore = create<AuditStore>((set) => ({
  result: null,
  setResult: (result) => set({ result }),
}));

const useAuditRows = () => auditStore((state) => state.result?.data ?? EMPTY_AUDITS);
const useAuditPagination = () => auditStore((state) => state.result);
const useAuditSort = () =>
  auditStore((state) => state.result?.query ?? null);

export {
  auditStore,
  useAuditPagination,
  useAuditRows,
  useAuditSort,
};
