import {
    HOTEL_SORT_BY_COLS,
    type ChangeHotelStatusInput,
    type CreateHotelInput,
    type Hotel,
    type ListHotelsQuery,
    type UpdateHotelInput,
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

type HotelRow = Omit<Hotel, "is_active"> & {
    is_active: number | boolean;
};

function toHotel(row: HotelRow): Hotel {
    return {
        ...row,
        is_active: Boolean(row.is_active),
    };
}

async function findHotelById(hotelId: number): Promise<Hotel | undefined> {
    return query(async (qe) => {
        const sql = `
            SELECT
                id,
                name,
                stars,
                address,
                is_active,
                version,
                created_at,
                updated_at
            FROM hotels
            WHERE id = ?
            LIMIT 1
        `;
        const rows = await qe.read<HotelRow>("execute", sql, [hotelId]);
        const row = rows[0];

        return row ? toHotel(row) : undefined;
    });
}

async function listHotels(queryParams: ListHotelsQuery) {
    const filters = [];

    if (queryParams.stars !== undefined) {
        filters.push({ column: "stars", value: queryParams.stars });
    }

    if (queryParams.is_active !== undefined) {
        filters.push({ column: "is_active", value: queryParams.is_active });
    }

    const { sql, values, countSql, countValues } = buildGeneralPaginatedSelectSql(
        "hotels",
        ["id", "version", ...HOTEL_SORT_BY_COLS],
        {
            page: queryParams.page,
            page_size: queryParams.page_size,
            searchBy: ["name", "address"],
            searchValue: queryParams.search,
            sort_by: queryParams.sort_by,
            sort_dir: queryParams.sort_dir,
            filters,
        },
    );

    return query(async (qe) => {
        const rows = await qe.read<HotelRow>("execute", sql, values);
        const count = await qe.read<{ total: number }>("execute", countSql, countValues);

        return {
            rows: rows.map(toHotel),
            total: count[0]?.total ?? 0,
        };
    });
}

async function createHotel({ name, address, stars }: CreateHotelInput): Promise<DbMutateResultWithRows<Hotel>> {
    return transaction(async (qe) => {
        const sql = `
            INSERT INTO hotels (name, address, stars) 
            VALUES (?, ?, ?)
            RETURNING
                id,
                name,
                stars,
                address,
                is_active,
                version,
                created_at,
                updated_at
        `;
        const mutation = await qe.mutate<HotelRow>("execute", sql, [name, address, stars]);

        if (!mutation.ok || !mutation.rows?.[0]) {
            return mutation as DbMutateResultWithRows<Hotel>;
        }

        return {
            ok: true,
            result: mutation.result,
            rows: [toHotel(mutation.rows[0])],
            error: null,
        };
    });
}

async function updateHotel(payload: UpdateHotelInput | ChangeHotelStatusInput) {
    const { sql, values } = buildGeneralUpdateSql(payload, "hotels");

    return transaction(async (qe) => {
        const result = await mutateWithVersion(qe, {
            mode: "execute",
            sql,
            values,
            probeSql: "SELECT version FROM hotels WHERE id = ? LIMIT 1;",
            probeValues: [payload.id],
        });

        return result;
    });
}

async function deleteHotel(hotelId: number) {
    return transaction(async (qe) => {
        const sql = "DELETE FROM hotels WHERE id = ?;";
        const mutation = await qe.mutate("execute", sql, [hotelId]);

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

export const hotelsRepository = {
    listHotels,
    findHotelById,
    createHotel,
    updateHotel,
    deleteHotel,
};
