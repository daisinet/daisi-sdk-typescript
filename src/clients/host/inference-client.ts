import { createClientFactory, type Channel } from "nice-grpc";
import type { ClientMiddleware } from "nice-grpc-common";
import {
  InferencesProtoDefinition,
  type InferencesProtoClient,
} from "../../generated/Protos/V1/Inferences";
import type {
  CreateInferenceRequest,
  CreateInferenceResponse,
  SendInferenceRequest,
  SendInferenceResponse,
  InferenceStatsRequest,
  InferenceStatsResponse,
  CloseInferenceRequest,
  CloseInferenceResponse,
} from "../../generated/Protos/V1/Models/InferenceModels";
import { ThinkLevels, InferenceCloseReasons } from "../../generated/Protos/V1/Models/InferenceModels";
import type { InferenceSessionManager } from "../../session/inference-session-manager";
import { DaisiSessionError } from "../../errors";
import { createDefaultSendInferenceRequest } from "../../extensions/send-inference-request";

export class InferenceClient {
  private orcClient: InferencesProtoClient;
  private dcClient: InferencesProtoClient | null = null;

  public sessionManager: InferenceSessionManager;
  public inferenceId: string | null = null;

  constructor(
    sessionManager: InferenceSessionManager,
    orcChannel: Channel,
    middleware: ClientMiddleware,
  ) {
    this.sessionManager = sessionManager;
    this.orcClient = createClientFactory().use(middleware).create(InferencesProtoDefinition, orcChannel);
  }

  private get activeClient(): InferencesProtoClient {
    if (this.sessionManager.useDirectConnect && this.dcClient) {
      return this.dcClient;
    }
    return this.orcClient;
  }

  /** Initialize the direct-connect client after session negotiation. */
  setupDirectConnect(channel: Channel, middleware: ClientMiddleware): void {
    this.dcClient = createClientFactory().use(middleware).create(InferencesProtoDefinition, channel);
  }

  /** Create an inference session on the host. */
  async create(request?: Partial<CreateInferenceRequest>): Promise<CreateInferenceResponse> {
    if (!this.sessionManager.checkIsConnected()) {
      throw new DaisiSessionError("Client must be connected before creating an inference session.");
    }

    const req: Partial<CreateInferenceRequest> = {
      ...request,
      SessionId: request?.SessionId || this.sessionManager.sessionId || "",
    };

    const response = await this.activeClient.create(req);
    this.inferenceId = response.InferenceId;
    return response;
  }

  /**
   * Send text to the model and receive streaming responses.
   * Auto-creates an inference session if needed.
   */
  send(text: string, thinkLevel?: ThinkLevels): AsyncIterable<SendInferenceResponse>;
  send(request: Partial<SendInferenceRequest>): AsyncIterable<SendInferenceResponse>;
  send(
    textOrRequest: string | Partial<SendInferenceRequest>,
    thinkLevel: ThinkLevels = ThinkLevels.ThinkLevelsBasic,
  ): AsyncIterable<SendInferenceResponse> {
    let request: Partial<SendInferenceRequest>;

    if (typeof textOrRequest === "string") {
      request = createDefaultSendInferenceRequest();
      request.Text = textOrRequest;
      request.ThinkLevel = thinkLevel;
    } else {
      request = textOrRequest;
    }

    // We need to return an AsyncIterable that handles the auto-create logic
    const self = this;
    return {
      [Symbol.asyncIterator]() {
        return self._sendInternal(request);
      },
    };
  }

  private async *_sendInternal(
    request: Partial<SendInferenceRequest>,
  ): AsyncGenerator<SendInferenceResponse> {
    if (!this.sessionManager.checkIsConnected()) {
      throw new DaisiSessionError("Client must be connected before sending an inference.");
    }

    request.SessionId = request.SessionId || this.sessionManager.sessionId || "";

    // Auto-create inference if not yet created
    if (!this.inferenceId && !request.InferenceId) {
      const createResponse = await this.activeClient.create({
        SessionId: this.sessionManager.sessionId || "",
        ThinkLevel: request.ThinkLevel ?? ThinkLevels.ThinkLevelsBasic,
      });
      this.inferenceId = createResponse.InferenceId;
    }

    request.InferenceId = request.InferenceId || this.inferenceId || "";

    yield* this.activeClient.send(request);
  }

  /** Get statistics for the current inference session. */
  async stats(request?: Partial<InferenceStatsRequest>): Promise<InferenceStatsResponse> {
    if (!this.sessionManager.checkIsConnected()) {
      throw new DaisiSessionError("Client must be connected before getting stats.");
    }

    const req: Partial<InferenceStatsRequest> = {
      ...request,
      SessionId: request?.SessionId || this.sessionManager.sessionId || "",
    };

    if (!req.InferenceId) {
      if (!this.inferenceId) {
        return { Success: true } as InferenceStatsResponse;
      }
      req.InferenceId = this.inferenceId;
    }

    return this.activeClient.stats(req);
  }

  /** Close the inference session. */
  async close(closeOrcSession = true): Promise<CloseInferenceResponse> {
    const result = await this.activeClient.close({
      SessionId: this.sessionManager.sessionId || "",
      InferenceId: this.inferenceId || "",
      Reason: InferenceCloseReasons.CloseRequestedByClient,
    });

    this.inferenceId = null;

    if (closeOrcSession) {
      await this.sessionManager.close();
    }

    return result;
  }
}
