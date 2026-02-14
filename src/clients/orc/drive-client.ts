import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import Long from "long";
import {
  DrivesProtoDefinition,
  type DrivesProtoClient,
} from "../../generated/Protos/V1/Drives";
import type {
  FileChunk,
  UploadResponse,
  FileSearchResponse,
  VectorSearchResponse,
  ListRepositoriesResponse,
  CreateRepositoryResponse,
  DeleteRepositoryResponse,
  GrantRepositoryAccessResponse,
  RevokeRepositoryAccessResponse,
  CreateFolderResponse,
  DeleteFolderResponse,
  MoveFileResponse,
  ListFilesResponse,
  ListTrashResponse,
  RestoreFromTrashResponse,
  EmptyTrashResponse,
  GetFilePreviewResponse,
  DeleteFileResponse,
  GetAccountDriveSettingsResponse,
  SetAccountDriveSettingsResponse,
  StorageLimits,
} from "../../generated/Protos/V1/Models/DriveModels";

export class DriveClient {
  private client: DrivesProtoClient;

  constructor(channel: Channel, middleware: ClientMiddleware) {
    this.client = createClientFactory().use(middleware).create(DrivesProtoDefinition, channel);
  }

  get raw(): DrivesProtoClient {
    return this.client;
  }

  /** Upload a file via streaming chunks. */
  async uploadFile(
    data: Uint8Array,
    fileName: string,
    options?: {
      repositoryId?: string;
      folderId?: string;
      path?: string;
      contentType?: string;
      isSystemFile?: boolean;
    },
  ): Promise<UploadResponse> {
    const chunkSize = 64 * 1024; // 64KB chunks
    const totalSize = data.length;
    const path = options?.path ?? "/";
    const contentType = options?.contentType ?? "application/octet-stream";
    const isSystemFile = options?.isSystemFile ?? false;

    async function* generateChunks(): AsyncIterable<Partial<FileChunk>> {
      let offset = 0;
      let firstChunk = true;

      while (offset < totalSize) {
        const end = Math.min(offset + chunkSize, totalSize);
        const chunkData = data.slice(offset, end);

        const chunk: Partial<FileChunk> = {
          Data: chunkData,
          Offset: Long.fromNumber(offset),
          TotalSize: Long.fromNumber(totalSize),
          IsSystemFile: isSystemFile,
        };

        if (firstChunk) {
          chunk.FileName = fileName;
          chunk.ContentType = contentType;
          chunk.Path = path;
          if (options?.repositoryId) chunk.RepositoryId = options.repositoryId;
          if (options?.folderId) chunk.FolderId = options.folderId;
          firstChunk = false;
        }

        yield chunk;
        offset = end;
      }
    }

    return this.client.upload(generateChunks());
  }

  /** Download a file and reassemble from streaming chunks. */
  async downloadFile(fileId: string): Promise<Uint8Array> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of this.client.download({ FileId: fileId })) {
      if (chunk.Data) {
        chunks.push(chunk.Data);
      }
    }
    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }

  /** Search files by partial filename. */
  async searchFiles(query: string, maxResults = 10): Promise<FileSearchResponse> {
    return this.client.searchFiles({ Query: query, MaxResults: maxResults });
  }

  /** Search files scoped to repositories. */
  async searchFilesInRepositories(
    query: string,
    repositoryIds: string[],
    maxResults = 10,
  ): Promise<FileSearchResponse> {
    return this.client.searchFiles({
      Query: query,
      MaxResults: maxResults,
      RepositoryIds: repositoryIds,
    });
  }

  /** Semantic vector search over file contents. */
  async vectorSearch(
    query: string,
    topK = 5,
    includeSystemFiles = false,
  ): Promise<VectorSearchResponse> {
    return this.client.vectorSearch({
      Query: query,
      TopK: topK,
      IncludeSystemFiles: includeSystemFiles,
    });
  }

  // Repository operations

  async listRepositories(includeTrash = false): Promise<ListRepositoriesResponse> {
    return this.client.listRepositories({ IncludeTrash: includeTrash });
  }

  async createRepository(name: string): Promise<CreateRepositoryResponse> {
    return this.client.createRepository({ Name: name });
  }

  async deleteRepository(repositoryId: string): Promise<DeleteRepositoryResponse> {
    return this.client.deleteRepository({ RepositoryId: repositoryId });
  }

  async grantRepositoryAccess(
    repositoryId: string,
    userId: string,
    userName: string,
    isApp = false,
  ): Promise<GrantRepositoryAccessResponse> {
    return this.client.grantRepositoryAccess({
      RepositoryId: repositoryId,
      UserId: userId,
      UserName: userName,
      IsApp: isApp,
    });
  }

  async revokeRepositoryAccess(
    repositoryId: string,
    userId: string,
  ): Promise<RevokeRepositoryAccessResponse> {
    return this.client.revokeRepositoryAccess({
      RepositoryId: repositoryId,
      UserId: userId,
    });
  }

  // Folder operations

  async createFolder(
    repositoryId: string,
    name: string,
    parentFolderId?: string,
  ): Promise<CreateFolderResponse> {
    return this.client.createFolder({
      RepositoryId: repositoryId,
      Name: name,
      ParentFolderId: parentFolderId,
    });
  }

  async deleteFolder(folderId: string): Promise<DeleteFolderResponse> {
    return this.client.deleteFolder({ FolderId: folderId });
  }

  // File operations

  async moveFile(
    fileId: string,
    targetRepositoryId: string,
    targetFolderId?: string,
  ): Promise<MoveFileResponse> {
    return this.client.moveFile({
      FileId: fileId,
      TargetRepositoryId: targetRepositoryId,
      TargetFolderId: targetFolderId,
    });
  }

  async listFiles(options?: {
    repositoryId?: string;
    folderId?: string;
    pageSize?: number;
    includeSystemFiles?: boolean;
  }): Promise<ListFilesResponse> {
    return this.client.list({
      RepositoryId: options?.repositoryId,
      FolderId: options?.folderId,
      PageSize: options?.pageSize ?? 50,
      IncludeSystemFiles: options?.includeSystemFiles ?? false,
    });
  }

  async deleteFile(fileId: string): Promise<DeleteFileResponse> {
    return this.client.delete({ FileId: fileId });
  }

  // Trash operations

  async listTrash(pageSize = 50): Promise<ListTrashResponse> {
    return this.client.listTrash({ PageSize: pageSize });
  }

  async restoreFromTrash(fileId: string): Promise<RestoreFromTrashResponse> {
    return this.client.restoreFromTrash({ FileId: fileId });
  }

  async emptyTrash(): Promise<EmptyTrashResponse> {
    return this.client.emptyTrash({});
  }

  // Preview

  async getFilePreview(fileId: string): Promise<GetFilePreviewResponse> {
    return this.client.getFilePreview({ FileId: fileId });
  }

  // Storage & settings

  async getStorageLimits(): Promise<StorageLimits> {
    return this.client.getStorageLimits({});
  }

  async setStorageLimits(
    accountId: string,
    limits: Partial<StorageLimits>,
  ): Promise<any> {
    return this.client.setStorageLimits({
      AccountId: accountId,
      Limits: limits as StorageLimits,
    });
  }

  async getAccountDriveSettings(): Promise<GetAccountDriveSettingsResponse> {
    return this.client.getAccountDriveSettings({});
  }

  async setAccountDriveSettings(
    restrictFolderCreation: boolean,
  ): Promise<SetAccountDriveSettingsResponse> {
    return this.client.setAccountDriveSettings({
      RestrictFolderCreationToManagers: restrictFolderCreation,
    });
  }
}
