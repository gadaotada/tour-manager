import type {
    Client,
    ClientsListResult,
    CreateClientInput,
    ListClientsQuery,
    UpdateClientInput,
} from "@tour-manager/shared";

import { api } from "@libs/api";

function toListParams(query: ListClientsQuery): Record<string, string | number> {
    const params: Record<string, string | number> = {
        page: query.page,
        page_size: query.page_size,
        sort_by: query.sort_by,
        sort_dir: query.sort_dir,
    };

    if (query.search) {
        params.search = query.search;
    }

    return params;
}

async function listClients(query: ListClientsQuery): Promise<ClientsListResult> {
    return api.json.get<ClientsListResult>("/api/clients/list", {
        params: toListParams(query),
    });
}

async function createClient(input: CreateClientInput): Promise<Client> {
    return api.json.post<Client>("/api/clients/create", input);
}

async function updateClient(input: UpdateClientInput): Promise<void> {
    await api.json.put<true>("/api/clients/update", input);
}

async function deleteClient(clientId: number): Promise<void> {
    await api.json.delete<null>(`/api/clients/${clientId}`);
}

export { createClient, deleteClient, listClients, updateClient };
