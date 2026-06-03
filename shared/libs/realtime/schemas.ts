import { z } from "zod";

const REALTIME_SCOPES = [
  "global",
  "clients",
  "contracts",
  "dashboard",
  "hotels",
  "logs",
  "payments",
  "settings",
  "templates",
  "users",
] as const;

const realtimeScopeSchema = z.enum(REALTIME_SCOPES);

const presenceJoinMessageSchema = z.object({
  type: z.literal("presence.join"),
  scope: realtimeScopeSchema,
});

const presenceLeaveMessageSchema = z.object({
  type: z.literal("presence.leave"),
  scope: realtimeScopeSchema,
});

const realtimeClientMessageSchema = z.discriminatedUnion("type", [
  presenceJoinMessageSchema,
  presenceLeaveMessageSchema,
]);

const realtimeConnectedMessageSchema = z.object({
  type: z.literal("realtime.connected"),
  user_id: z.string().min(1),
  socket_id: z.string().min(1),
  scopes: z.array(realtimeScopeSchema),
});

const realtimeScopeActiveUserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  display_name: z.string().min(1),
});

const realtimeScopeActiveUsersEventSchema = z.object({
  type: z.literal("scope.active_users"),
  scope: realtimeScopeSchema,
  active_users: z.number().int().min(0),
  users: z.array(realtimeScopeActiveUserSchema),
  occurred_at: z.string().datetime(),
});

type RealtimeScope = (typeof REALTIME_SCOPES)[number];
type RealtimeClientMessage = z.infer<typeof realtimeClientMessageSchema>;
type RealtimeConnectedMessage = z.infer<typeof realtimeConnectedMessageSchema>;
type RealtimeScopeActiveUser = z.infer<typeof realtimeScopeActiveUserSchema>;
type RealtimeScopeActiveUsersEvent = z.infer<typeof realtimeScopeActiveUsersEventSchema>;

export {
  REALTIME_SCOPES,
  presenceJoinMessageSchema,
  presenceLeaveMessageSchema,
  realtimeClientMessageSchema,
  realtimeConnectedMessageSchema,
  realtimeScopeActiveUserSchema,
  realtimeScopeActiveUsersEventSchema,
  realtimeScopeSchema,
  type RealtimeClientMessage,
  type RealtimeConnectedMessage,
  type RealtimeScope,
  type RealtimeScopeActiveUser,
  type RealtimeScopeActiveUsersEvent,
};
