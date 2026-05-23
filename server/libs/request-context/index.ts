import type { Logger } from "@tour-manager/shared";

const REQUEST_ID_HEADER = "x-request-id";

type RequestContext = {
  logger: Logger;
  requestId: string;
};

type RequestLocals = {
  context?: RequestContext;
};

export {
  REQUEST_ID_HEADER,
  type RequestContext,
  type RequestLocals,
};
