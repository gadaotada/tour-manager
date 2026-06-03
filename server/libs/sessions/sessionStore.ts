import session, { type SessionData } from "express-session";

import { query } from "@libs/db";

type SessionRow = {
  data: string | SessionData;
  expires_at: Date | string;
};

class DbSessionStore extends session.Store {
  // fallow-ignore-next-line unused-class-member
  get(
    sid: string,
    callback: (err: unknown, session?: SessionData | null) => void,
  ): void {
    query(async (qe) => {
      const rows = await qe.read<SessionRow>(
        "execute",
        `
          SELECT data, expires_at
          FROM sessions
          WHERE sid = ? AND expires_at > CURRENT_TIMESTAMP(3)
          LIMIT 1
        `,
        [sid],
      );

      const row = rows[0];
      if (!row) {
        callback(null, null);
        return;
      }

      callback(null, parseSessionData(row.data));
    }).catch((error: unknown) => {
      callback(error);
    });
  }

  // fallow-ignore-next-line unused-class-member
  set(sid: string, sessionData: SessionData, callback?: (err?: unknown) => void): void {
    query(async (qe) => {
      const expiresAt = getSessionExpiresAt(sessionData);

      await qe.mutate(
        "execute",
        `
          INSERT INTO sessions (sid, data, expires_at)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE
            data = VALUES(data),
            expires_at = VALUES(expires_at)
        `,
        [sid, JSON.stringify(sessionData), expiresAt],
        
      );

      callback?.();
    }).catch((error: unknown) => {
      callback?.(error);
    });
  }

  // fallow-ignore-next-line unused-class-member
  destroy(sid: string, callback?: (err?: unknown) => void): void {
    query(async (qe) => {
      await qe.mutate(
        "execute",
        "DELETE FROM sessions WHERE sid = ?",
        [sid],
        
      );

      callback?.();
    }).catch((error: unknown) => {
      callback?.(error);
    });
  }

  // fallow-ignore-next-line unused-class-member
  touch(sid: string, sessionData: SessionData, callback?: (err?: unknown) => void): void {
    query(async (qe) => {
      await qe.mutate(
        "execute",
        "UPDATE sessions SET expires_at = ? WHERE sid = ?",
        [getSessionExpiresAt(sessionData), sid],
        
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
