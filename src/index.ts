// Node.js entry point — uses nice-grpc (full gRPC over HTTP/2)
import { createChannel } from "nice-grpc";
import type { TransportFactory } from "./transport";

// Re-export everything
export { type DaisiConfig, DEFAULT_CONFIG, resolveConfig, getOrcUrl, CLIENT_KEY_HEADER } from "./config";
export { DaisiError, DaisiAuthenticationError, DaisiSessionError, DaisiNotFoundError, DaisiConnectionError } from "./errors";
export { type TransportFactory, type TransportOptions } from "./transport";
export { type ClientKeyProvider, type DriveIdentityProvider, StaticClientKeyProvider, StaticDriveIdentityProvider } from "./auth/client-key-provider";
export { createAuthMiddleware } from "./auth/metadata-interceptor";

// Session management
export { SessionManager, type SessionManagerOptions } from "./session/session-manager";
export { InferenceSessionManager } from "./session/inference-session-manager";
export { PeerSessionManager } from "./session/peer-session-manager";
export { SettingsSessionManager } from "./session/settings-session-manager";

// Orc clients
export { AuthClient } from "./clients/orc/auth-client";
export { SessionClient } from "./clients/orc/session-client";
export { AccountClient } from "./clients/orc/account-client";
export { HostClient } from "./clients/orc/host-client";
export { DriveClient } from "./clients/orc/drive-client";
export { CreditClient } from "./clients/orc/credit-client";
export { SkillClient } from "./clients/orc/skill-client";
export { MarketplaceClient } from "./clients/orc/marketplace-client";
export { ModelClient } from "./clients/orc/model-client";
export { NetworkClient } from "./clients/orc/network-client";
export { DappClient } from "./clients/orc/dapp-client";
export { ReleaseClient } from "./clients/orc/release-client";
export { OrcClient } from "./clients/orc/orc-client";
export { AppCommandClient } from "./clients/orc/app-command-client";
export { HostCommandClient } from "./clients/orc/host-command-client";

// Host clients
export { InferenceClient } from "./clients/host/inference-client";
export { InferenceClientFactory } from "./clients/host/inference-client-factory";
export { PeerClient } from "./clients/host/peer-client";
export { PeerClientFactory } from "./clients/host/peer-client-factory";
export { SettingsClient } from "./clients/host/settings-client";
export { SettingsClientFactory } from "./clients/host/settings-client-factory";
export { DriveNotificationClient } from "./clients/host/drive-notification-client";

// Extensions
export { createDefaultSendInferenceRequest } from "./extensions/send-inference-request";
export { getLastMessageTokensPerSecond, getSessionTokensPerSecond } from "./extensions/inference-stats";

// Generated types commonly needed by consumers
export { ThinkLevels, InferenceCloseReasons, InferenceResponseTypes, InferenceOutputFormats } from "./generated/Protos/V1/Models/InferenceModels";
export type { SendInferenceRequest, SendInferenceResponse, InferenceStatsResponse, CreateInferenceRequest, CreateInferenceResponse } from "./generated/Protos/V1/Models/InferenceModels";

// Facade
export { type DaisiClient, type CreateDaisiClientOptions, createDaisiClient } from "./facade";

// Node.js default transport factory
export const nodeTransportFactory: TransportFactory = {
  createChannel(address: string) {
    return createChannel(address);
  },
};
