import {
    type Client,
    type CreateClientInput,
    type ListClientsQuery,
    type UpdateClientInput,
} from "@tour-manager/shared";
import {
    buildGeneralPaginatedSelectSql,
    buildGeneralUpdateSql,
    DB_ERROR_CODES,
    DB_ERROR_MESSAGE_KEYS,
    DbError,
    mutateWithVersion,
    query,
    transaction,
    type DbMutateResultWithRows,
} from "@libs/db";

const CLIENT_LIST_COLS = [
    "id",
    "name",
    "egn",
    "address",
    "phone_number",
    "email",
    "version",
    "created_at",
    "updated_at",
] as const;

async function findClientById(clientId: number): Promise<Client | undefined> {
    return query(async (qe) => {
        const sql = `
            SELECT
                id,
                name,
                egn,
                address,
                phone_number,
                email,
                version,
                created_at,
                updated_at
            FROM clients
            WHERE id = ?
            LIMIT 1
        `;
        const rows = await qe.read<Client>("execute", sql, [clientId]);
        const row = rows[0];

        return row ?? undefined;
    });
}

async function listClients(queryParams: ListClientsQuery) {
    const { sql, values, countSql, countValues } = buildGeneralPaginatedSelectSql(
        "clients",
        CLIENT_LIST_COLS,
        {
            page: queryParams.page,
            page_size: queryParams.page_size,
            searchBy: ["name", "address", "egn", "phone_number", "email"],
            searchValue: queryParams.search,
            sort_by: queryParams.sort_by,
            sort_dir: queryParams.sort_dir,
        },
    );

    return query(async (qe) => {
        const rows = await qe.read<Client>("execute", sql, values);
        const count = await qe.read<{ total: number }>("execute", countSql, countValues);

        return {
            rows: rows,
            total: count[0]?.total ?? 0,
        };
    });
}

async function createClient({
    name,
    egn,
    address,
    phone_number,
    email,
}: CreateClientInput): Promise<DbMutateResultWithRows<Client>> {
    return transaction(async (qe) => {
        const sql = `
            INSERT INTO clients (name, egn, address, phone_number, email) 
            VALUES (?, ?, ?, ?, ?)
            RETURNING
                id,
                name,
                egn,
                address,
                phone_number,
                email,
                version,
                created_at,
                updated_at
        `;
        const mutation = await qe.mutate<Client>("execute", sql, [
            name,
            egn,
            address,
            phone_number,
            email,
        ]);

        if (!mutation.ok || !mutation.rows?.[0]) {
            return mutation;
        }

        return {
            ok: true,
            result: mutation.result,
            rows: [mutation.rows[0]],
            error: null,
        };
    });
}

async function updateClient(payload: UpdateClientInput) {
    const { sql, values } = buildGeneralUpdateSql(payload, "clients");

    return transaction(async (qe) => {
        const oldData = await qe.read<Client>(
            "execute",
            "SELECT * FROM clients WHERE id = ? LIMIT 1;",
            [payload.id],
        );
        const before = oldData[0] ?? undefined;

        const result = await mutateWithVersion(qe, {
            mode: "execute",
            sql,
            values,
            probeSql: "SELECT version FROM clients WHERE id = ? LIMIT 1;",
            probeValues: [payload.id],
        });

        return { mutation: result, before };
    });
}

async function deleteClient(clientId: number) {
    return transaction(async (qe) => {
        const sql = "DELETE FROM clients WHERE id = ?;";
        const mutation = await qe.mutate("execute", sql, [clientId]);

        if (!mutation.ok) throw new DbError(mutation.error);

        if (mutation.result.affectedRows === 0) {
            throw new DbError({
                statusCode: 404,
                code: DB_ERROR_CODES.NOT_FOUND_OR_FORBIDDEN,
                messageKey: DB_ERROR_MESSAGE_KEYS.NOT_FOUND_OR_FORBIDDEN,
                safeMessage: "Record was not found.",
                cause: null,
            });
        }

        return mutation;
    });
}

export const clientsRepository = {
    listClients,
    findClientById,
    createClient,
    updateClient,
    deleteClient,
};
