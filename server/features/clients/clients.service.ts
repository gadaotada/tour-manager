import { wsGateway } from "@core/realtime";
import { buildPaginatedResult, DB_ERROR_CODES, DB_ERROR_MESSAGE_KEYS, DbError } from "@libs/db";
import { AuditLog } from "@libs/audit";
import {
    CLIENT_REALTIME_EVENTS,
    type ClientUser,
    type ListClientsQuery,
    type CreateClientInput,
    type UpdateClientInput,
    type Client,
    type ClientRealtimePayload,
} from "@tour-manager/shared";

import { clientsRepository } from "./clients.repository";

function emitClientsEvent(
    event: ClientRealtimePayload["event"],
    data: number,
    exclude_socket_id: string | undefined,
) {
    const payload: ClientRealtimePayload = { event, data };
    wsGateway.emitToScope("clients", payload, { exclude_socket_id });
}

const clientsService = {
    getClients: async (payload: ListClientsQuery) => {
        const { rows, total } = await clientsRepository.listClients(payload);

        return buildPaginatedResult({
            page: payload.page,
            page_size: payload.page_size,
            total,
            data: rows,
            query: {
                search: payload.search,
                sort_by: payload.sort_by,
                sort_dir: payload.sort_dir,
            },
        });
    },
    getClient: async (clientId: number) => {
        const client = await clientsRepository.findClientById(clientId);
        
        if (!client) throw new DbError({
            statusCode: 404,
            code: DB_ERROR_CODES.NOT_FOUND_OR_FORBIDDEN,
            messageKey: DB_ERROR_MESSAGE_KEYS.NOT_FOUND_OR_FORBIDDEN,
            safeMessage: "Record was not found.",
            cause: null,
        });

        return client;
    },

    createClient: async (
        payload: CreateClientInput,
        exclude_socket_id: string | undefined,
        actor: ClientUser,
    ): Promise<Client> => {
        const mutation = await clientsRepository.createClient(payload);

        if (!mutation.ok) throw new DbError(mutation.error);

        const createdRow = mutation.rows?.[0];

        if (!createdRow) {
            throw new DbError({
                statusCode: 500,
                code: DB_ERROR_CODES.GENERAL_DB_ERROR,
                messageKey: DB_ERROR_MESSAGE_KEYS.GENERAL_DB_ERROR,
                safeMessage: "Database operation failed.",
                cause: null,
            });
        }

        emitClientsEvent(CLIENT_REALTIME_EVENTS.CREATE, createdRow.id, exclude_socket_id);
        AuditLog.record("CREATE", {
            user_id: actor.id,
            resource: "CLIENTS",
            resource_id: createdRow.id,
            data: {
                name: createdRow.name,
                egn: createdRow.egn,
                address: createdRow.address,
                email: createdRow.email,
                phone_number: createdRow.phone_number,
            },
        });

        return createdRow;
    },

    updateClient: async (
        payload: UpdateClientInput,
        exclude_socket_id: string | undefined,
        actor: ClientUser,
    ) => {
        const { before } = await clientsRepository.updateClient(payload);
        emitClientsEvent(CLIENT_REALTIME_EVENTS.UPDATE, payload.id, exclude_socket_id);

        if (before) {
            AuditLog.record("UPDATE", {
                user_id: actor.id,
                resource: "CLIENTS",
                resource_id: payload.id,
                data: {
                    before,
                    after: payload,
                },
            });
        }
    },

    deleteClient: async (
        clientId: number,
        exclude_socket_id: string | undefined,
        actor: ClientUser,
    ) => {
        await clientsRepository.deleteClient(clientId);
        emitClientsEvent(CLIENT_REALTIME_EVENTS.DELETE, clientId, exclude_socket_id);

        AuditLog.record("DELETE", {
            user_id: actor.id,
            resource: "CLIENTS",
            resource_id: clientId,
        });
    },
};

export { clientsService };
