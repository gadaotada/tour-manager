import { create } from "zustand";

type ToastKind = "error" | "success";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastsStore = {
  dismiss: (id: number) => void;
  show: (toast: Omit<Toast, "id">) => void;
  toasts: Toast[];
};

let nextToastId = 1;
const TOAST_TTL_MS = 4500;

const useToastsStore = create<ToastsStore>((set, get) => ({
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  show: (toast) => {
    const id = nextToastId;
    nextToastId += 1;

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    window.setTimeout(() => {
      get().dismiss(id);
    }, TOAST_TTL_MS);
  },
  toasts: [],
}));

const toast = {
  error(message: string) {
    useToastsStore.getState().show({ kind: "error", message });
  },
  success(message: string) {
    useToastsStore.getState().show({ kind: "success", message });
  },
};

export { toast, useToastsStore };
