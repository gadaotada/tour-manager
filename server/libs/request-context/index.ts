import { HTTP_HEADERS } from "@tour-manager/shared";
import type { Logger } from "@tour-manager/shared";

const REQUEST_ID_HEADER = HTTP_HEADERS.REQUEST_ID;

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
