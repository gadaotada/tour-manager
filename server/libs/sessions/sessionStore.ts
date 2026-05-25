import session, { type SessionData } from "express-session";

import { QUERY_MODE, query } from "@libs/db";

type SessionRow = {
  data: string | SessionData;
  expires_at: Date | string;
};

class DbSessionStore extends session.Store {
  get(
    sid: string,
    callback: (err: unknown, session?: SessionData | null) => void,
  ): void {
    query(async (qe) => {
      const result = await qe.read<SessionRow>(
        QUERY_MODE.execute,
        `
          SELECT data, expires_at
          FROM sessions
          WHERE sid = ? AND expires_at > CURRENT_TIMESTAMP(3)
          LIMIT 1
        `,
        [sid],
        { shouldThrow: true },
      );

      if (!result.ok || result.rows.length === 0) {
        callback(null, null);
        return;
      }

      const row = result.rows[0];
      if (!row) {
        callback(null, null);
        return;
      }

      callback(null, parseSessionData(row.data));
    }).catch((error: unknown) => {
      callback(error);
    });
  }

  set(sid: string, sessionData: SessionData, callback?: (err?: unknown) => void): void {
    query(async (qe) => {
      const expiresAt = getSessionExpiresAt(sessionData);

      await qe.mutate(
        QUERY_MODE.execute,
        `
          INSERT INTO sessions (sid, data, expires_at)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE
            data = VALUES(data),
            expires_at = VALUES(expires_at)
        `,
        [sid, JSON.stringify(sessionData), expiresAt],
        { shouldThrow: true },
      );

      callback?.();
    }).catch((error: unknown) => {
      callback?.(error);
    });
  }

  destroy(sid: string, callback?: (err?: unknown) => void): void {
    query(async (qe) => {
      await qe.mutate(
        QUERY_MODE.execute,
        "DELETE FROM sessions WHERE sid = ?",
        [sid],
        { shouldThrow: true },
      );

      callback?.();
    }).catch((error: unknown) => {
      callback?.(error);
    });
  }

  touch(sid: string, sessionData: SessionData, callback?: (err?: unknown) => void): void {
    query(async (qe) => {
      await qe.mutate(
        QUERY_MODE.execute,
        "UPDATE sessions SET expires_at = ? WHERE sid = ?",
        [getSessionExpiresAt(sessionData), sid],
        { shouldThrow: true },
      );

      callback?.();
    }).catch((error: unknown) => {
      callback?.(error);
    });
  }
}

function parseSessionData(data: string | SessionData): SessionData | null {
  if (typeof data !== "string") {
    return data;
  }

  try {
    return JSON.parse(data) as SessionData;
  } catch {
    return null;
  }
}

function getSessionExpiresAt(sessionData: SessionData): Date {
  if (sessionData.cookie.expires) {
    return new Date(sessionData.cookie.expires);
  }

  const maxAge = sessionData.cookie.maxAge ?? 0;
  return new Date(Date.now() + maxAge);
}

export { DbSessionStore };
