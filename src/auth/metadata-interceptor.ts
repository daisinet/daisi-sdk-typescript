import { Metadata, type ClientMiddleware, type CallOptions } from "nice-grpc-common";
import { CLIENT_KEY_HEADER } from "../config";
import type { ClientKeyProvider, DriveIdentityProvider } from "./client-key-provider";

function isDriveIdentityProvider(
  provider: ClientKeyProvider,
): provider is DriveIdentityProvider {
  return (
    "getAccountId" in provider &&
    "getUserId" in provider &&
    "getUserName" in provider &&
    "getUserRole" in provider
  );
}

export function createAuthMiddleware(provider: ClientKeyProvider): ClientMiddleware {
  return async function* authMiddleware<Request, Response>(
    call: any,
    options: CallOptions,
  ) {
    const metadata = Metadata(options.metadata);
    metadata.set(CLIENT_KEY_HEADER, provider.getClientKey());

    if (isDriveIdentityProvider(provider)) {
      metadata.set("x-daisi-account-id", provider.getAccountId());
      metadata.set("x-daisi-user-id", provider.getUserId());
      metadata.set("x-daisi-user-name", provider.getUserName());
      metadata.set("x-daisi-user-role", provider.getUserRole());
    }

    return yield* call.next(call.request, {
      ...options,
      metadata,
    }) as AsyncGenerator<Response, Response | void, undefined>;
  } as ClientMiddleware;
}
