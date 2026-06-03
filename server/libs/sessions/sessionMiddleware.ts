import session from "express-session";

import { env } from "@libs/config";

import { DbSessionStore } from "./sessionStore";

const SESSION_TTL_MS = env.sessionTtlDays * 24 * 60 * 60 * 1000;

const sessionMiddleware = session({
  name: env.sessionCookieName,
  secret: env.sessionSecret,
  store: new DbSessionStore(),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    maxAge: SESSION_TTL_MS,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
  },
});

export { sessionMiddleware };
