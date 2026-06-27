import type { z } from "zod";
import type {
    clientCoreSchema,
    clientIdParamsSchema,
    clientRecordSchema,
    createClientSchema,
    listClientsQuerySchema,
    updateClientSchema,
} from "../../schemas/clients";
import type { PaginatedResult } from "../pagination";

type CreateClientInput = z.infer<typeof createClientSchema>;
type UpdateClientInput = z.infer<typeof updateClientSchema>;
type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
type ClientIdParams = z.infer<typeof clientIdParamsSchema>;

type ClientCore = z.infer<typeof clientCoreSchema>;
type ClientRecord = z.infer<typeof clientRecordSchema>;

type Client = ClientCore &
    ClientRecord & {
        created_at: string;
        updated_at: string;
    };

type ClientsListQuery = Pick<ListClientsQuery, "search" | "sort_by" | "sort_dir">;

type ClientsListResult = PaginatedResult<Client[], ClientsListQuery>;

export type {
    Client,
    ClientCore,
    ClientIdParams,
    ClientRecord,
    ClientsListQuery,
    ClientsListResult,
    CreateClientInput,
    ListClientsQuery,
    UpdateClientInput,
};
