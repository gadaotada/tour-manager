import { create } from "zustand";

import type { ManagedUser, UsersListQuery, UsersListResult } from "@tour-manager/shared";

type UsersStore = {
  result: UsersListResult | null;
  setResult: (result: UsersListResult) => void;
  upsertUser: (user: ManagedUser) => void;
  removeUser: (userId: string) => void;
};

const EMPTY_USERS: ManagedUser[] = [];

const usersStore = create<UsersStore>((set) => ({
  result: null,
  removeUser: (userId) =>
    set((state) => {
      if (!state.result) return state;

      return {
        result: {
          ...state.result,
          data: state.result.data.filter((user) => user.id !== userId),
          total: Math.max(0, state.result.total - 1),
        },
      };
    }),
  setResult: (result) => set({ result }),
  upsertUser: (user) =>
    set((state) => {
      if (!state.result) return state;

      const existingIndex = state.result.data.findIndex((item) => item.id === user.id);
      const nextData =
        existingIndex === -1
          ? [user, ...state.result.data]
          : state.result.data.map((item) => (item.id === user.id ? user : item));

      return {
        result: {
          ...state.result,
          data: nextData,
        },
      };
    }),
}));

const useUsersRows = () => usersStore((state) => state.result?.data ?? EMPTY_USERS);
const useUsersSort = () =>
  usersStore((state): UsersListQuery | null => state.result?.query ?? null);

export { usersStore, useUsersRows, useUsersSort };
