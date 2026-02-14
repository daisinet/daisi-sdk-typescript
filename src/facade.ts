import type { ClientMiddleware } from "nice-grpc-common";
import { type DaisiConfig, resolveConfig, getOrcUrl } from "./config";
import type { TransportFactory } from "./transport";
import { createAuthMiddleware } from "./auth/metadata-interceptor";
import { StaticClientKeyProvider, type ClientKeyProvider } from "./auth/client-key-provider";

// Orc clients
import { AuthClient } from "./clients/orc/auth-client";
import { SessionClient } from "./clients/orc/session-client";
import { AccountClient } from "./clients/orc/account-client";
import { HostClient } from "./clients/orc/host-client";
import { DriveClient } from "./clients/orc/drive-client";
import { CreditClient } from "./clients/orc/credit-client";
import { SkillClient } from "./clients/orc/skill-client";
import { MarketplaceClient } from "./clients/orc/marketplace-client";
import { ModelClient } from "./clients/orc/model-client";
import { NetworkClient } from "./clients/orc/network-client";
import { DappClient } from "./clients/orc/dapp-client";
import { ReleaseClient } from "./clients/orc/release-client";
import { OrcClient } from "./clients/orc/orc-client";
import { AppCommandClient } from "./clients/orc/app-command-client";
import { HostCommandClient } from "./clients/orc/host-command-client";

// Host client factories
import { InferenceClientFactory } from "./clients/host/inference-client-factory";
import { PeerClientFactory } from "./clients/host/peer-client-factory";
import { SettingsClientFactory } from "./clients/host/settings-client-factory";

export interface DaisiClient {
  // Orc clients
  auth: AuthClient;
  sessions: SessionClient;
  accounts: AccountClient;
  hosts: HostClient;
  drives: DriveClient;
  credits: CreditClient;
  skills: SkillClient;
  marketplace: MarketplaceClient;
  models: ModelClient;
  networks: NetworkClient;
  dapps: DappClient;
  releases: ReleaseClient;
  orcs: OrcClient;
  appCommands: AppCommandClient;
  hostCommands: HostCommandClient;

  // Host client factories
  inference: InferenceClientFactory;
  peers: PeerClientFactory;
  settings: SettingsClientFactory;

  // Config
  config: DaisiConfig;
}

export interface CreateDaisiClientOptions extends Partial<DaisiConfig> {
  transportFactory: TransportFactory;
}

/**
 * Creates a fully configured DaisiClient with all Orc clients and host client factories.
 *
 * If a `secretKey` is provided, it will be exchanged for a `clientKey` via the Auth service
 * (mirroring the .NET SDK's `UseDaisi()` behavior).
 */
export async function createDaisiClient(
  options: CreateDaisiClientOptions,
): Promise<DaisiClient> {
  const { transportFactory, ...configOptions } = options;
  const config = resolveConfig(configOptions);

  let clientKey = config.clientKey;

  // If secretKey is provided but not clientKey, exchange it
  if (config.secretKey && !clientKey) {
    // Create a temporary channel with no auth middleware to call CreateClientKey
    const tempChannel = transportFactory.createChannel(getOrcUrl(config));
    const noopMiddleware: ClientMiddleware = async function* (call, opts) {
      return yield* call.next(call.request, opts) as any;
    };
    const tempAuthClient = new AuthClient(tempChannel, noopMiddleware);
    const response = await tempAuthClient.createClientKey({
      SecretKey: config.secretKey,
    });
    clientKey = response.ClientKey;
  }

  if (!clientKey) {
    throw new Error(
      "Either clientKey or secretKey must be provided to createDaisiClient.",
    );
  }

  // Create the auth middleware with the resolved client key
  const provider: ClientKeyProvider = new StaticClientKeyProvider(clientKey);
  const middleware = createAuthMiddleware(provider);

  // Create the Orc channel
  const orcChannel = transportFactory.createChannel(getOrcUrl(config));

  // Create all Orc clients
  const auth = new AuthClient(orcChannel, middleware);
  const sessions = new SessionClient(orcChannel, middleware);
  const accounts = new AccountClient(orcChannel, middleware);
  const hosts = new HostClient(orcChannel, middleware);
  const drives = new DriveClient(orcChannel, middleware);
  const credits = new CreditClient(orcChannel, middleware);
  const skills = new SkillClient(orcChannel, middleware);
  const marketplace = new MarketplaceClient(orcChannel, middleware);
  const models = new ModelClient(orcChannel, middleware);
  const networks = new NetworkClient(orcChannel, middleware);
  const dapps = new DappClient(orcChannel, middleware);
  const releases = new ReleaseClient(orcChannel, middleware);
  const orcs = new OrcClient(orcChannel, middleware);
  const appCommands = new AppCommandClient(orcChannel, middleware);
  const hostCommands = new HostCommandClient(orcChannel, middleware);

  // Create host client factories
  const inference = new InferenceClientFactory(config, transportFactory, middleware);
  const peers = new PeerClientFactory(config, transportFactory, middleware);
  const settingsFactory = new SettingsClientFactory(config, transportFactory, middleware);

  return {
    auth,
    sessions,
    accounts,
    hosts,
    drives,
    credits,
    skills,
    marketplace,
    models,
    networks,
    dapps,
    releases,
    orcs,
    appCommands,
    hostCommands,
    inference,
    peers,
    settings: settingsFactory,
    config: { ...config, clientKey },
  };
}
