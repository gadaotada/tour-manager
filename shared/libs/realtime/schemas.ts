import { z } from "zod";

const REALTIME_SCOPES = ["global", "hotels"] as const;

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

type RealtimeScope = (typeof REALTIME_SCOPES)[number];
type RealtimeClientMessage = z.infer<typeof realtimeClientMessageSchema>;
type RealtimeConnectedMessage = z.infer<typeof realtimeConnectedMessageSchema>;

export {
  REALTIME_SCOPES,
  presenceJoinMessageSchema,
  presenceLeaveMessageSchema,
  realtimeClientMessageSchema,
  realtimeConnectedMessageSchema,
  realtimeScopeSchema,
  type RealtimeClientMessage,
  type RealtimeConnectedMessage,
  type RealtimeScope,
};
