export interface ClientKeyProvider {
  getClientKey(): string;
}

export interface DriveIdentityProvider extends ClientKeyProvider {
  getAccountId(): string;
  getUserId(): string;
  getUserName(): string;
  getUserRole(): string;
}

export class StaticClientKeyProvider implements ClientKeyProvider {
  constructor(private readonly clientKey: string) {}

  getClientKey(): string {
    return this.clientKey;
  }
}

export class StaticDriveIdentityProvider implements DriveIdentityProvider {
  constructor(
    private readonly clientKey: string,
    private readonly accountId: string,
    private readonly userId: string,
    private readonly userName: string,
    private readonly userRole: string,
  ) {}

  getClientKey(): string {
    return this.clientKey;
  }
  getAccountId(): string {
    return this.accountId;
  }
  getUserId(): string {
    return this.userId;
  }
  getUserName(): string {
    return this.userName;
  }
  getUserRole(): string {
    return this.userRole;
  }
}
