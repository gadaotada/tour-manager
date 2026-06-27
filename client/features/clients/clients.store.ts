import { create } from "zustand";

import type { Client, ClientsListResult } from "@tour-manager/shared";

type ClientsStore = {
    result: ClientsListResult | null;
    setResult: (result: ClientsListResult) => void;
    upsertClient: (client: Client) => void;
    removeClient: (clientId: number) => void;
};

const EMPTY_CLIENTS: Client[] = [];

const clientsStore = create<ClientsStore>((set) => ({
    result: null,
    removeClient: (clientId) =>
        set((state) => {
            if (!state.result) return state;

            return {
                result: {
                    ...state.result,
                    data: state.result.data.filter((client) => client.id !== clientId),
                    total: Math.max(0, state.result.total - 1),
                },
            };
        }),
    setResult: (result) => set({ result }),
    upsertClient: (client) =>
        set((state) => {
            if (!state.result) return state;

            const existingIndex = state.result.data.findIndex((item) => item.id === client.id);
            const nextData =
                existingIndex === -1
                    ? [client, ...state.result.data]
                    : state.result.data.map((item) => (item.id === client.id ? client : item));

            return {
                result: {
                    ...state.result,
                    data: nextData,
                },
            };
        }),
}));

const useClientsRows = () => clientsStore((state) => state.result?.data ?? EMPTY_CLIENTS);
const useClientsPagination = () => clientsStore((state) => state.result);
const useClientsSort = () =>
    clientsStore((state): ClientsListResult["query"] | null => state.result?.query ?? null);

export { clientsStore, useClientsPagination, useClientsRows, useClientsSort };
