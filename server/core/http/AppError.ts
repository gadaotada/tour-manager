import type { MessageKey } from "@libs/i18n";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    public readonly messageKey: MessageKey,
    public readonly safeMessage: string,
    public readonly details?: unknown,
  ) {
    super(safeMessage);
    this.name = "AppError";
  }
}
