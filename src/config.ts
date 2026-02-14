export interface DaisiConfig {
  /** IP address or domain for the Orc service. Default: "orc.daisinet.com" */
  orcAddress: string;
  /** Port for the Orc service. Default: 443 */
  orcPort: number;
  /** Whether to use SSL for Orc connections. Default: true */
  orcUseSsl: boolean;
  /** Network name to connect to. Default: "devnet" */
  networkName: string;
  /** Secret key for server-side authentication (exchanged for a client key). */
  secretKey?: string;
  /** Client key for authenticating API calls. */
  clientKey?: string;
}

export const DEFAULT_CONFIG: Readonly<DaisiConfig> = {
  orcAddress: "orc.daisinet.com",
  orcPort: 443,
  orcUseSsl: true,
  networkName: "devnet",
};

export const CLIENT_KEY_HEADER = "x-daisi-client-key";

export function resolveConfig(options?: Partial<DaisiConfig>): DaisiConfig {
  return { ...DEFAULT_CONFIG, ...options };
}

export function getOrcUrl(config: DaisiConfig): string {
  const protocol = config.orcUseSsl ? "https" : "http";
  return `${protocol}://${config.orcAddress}:${config.orcPort}`;
}
