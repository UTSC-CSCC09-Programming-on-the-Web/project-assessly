import { Content, GenerativeContentBlob, Part } from "@google/generative-ai";
import { EventEmitter } from "eventemitter3";
import { difference } from "lodash";
import {
  ClientContentMessage,
  isInterrupted,
  isModelTurn,
  isServerContentMessage,
  isSetupCompleteMessage,
  isToolCallMessage,
  isTurnComplete,
  LiveIncomingMessage,
  ModelTurn,
  RealtimeInputMessage,
  ServerContent,
  SetupMessage,
  StreamingLog,
  ToolCall,
  ToolResponseMessage,
  type LiveConfig,
  type MultimodalLiveAPIClientConnection,
} from "../types/liveapi";
import { blobToJSON, base64ToArrayBuffer } from "../utils/liveapi-utils";

/**
 * Events that this client will emit
 */
interface MultimodalLiveClientEventTypes {
  open: () => void;
  log: (log: StreamingLog) => void;
  close: (event: CloseEvent) => void;
  audio: (data: ArrayBuffer) => void;
  content: (data: ServerContent) => void;
  interrupted: () => void;
  setupcomplete: () => void;
  turncomplete: () => void;
  toolcall: (toolCall: ToolCall) => void;
  error: (error: Error) => void;
}

/**
 * Event-emitting class that manages WebSocket connection to Multimodal Live API
 * Adapted for Vue.js integration
 */
export class MultimodalLiveClient extends EventEmitter<MultimodalLiveClientEventTypes> {
  public ws: WebSocket | null = null;
  protected config: LiveConfig | null = null;
  public url: string = "";
  
  public getConfig() {
    return { ...this.config };
  }

  constructor({ url, apiKey }: MultimodalLiveAPIClientConnection) {
    super();
    
    const baseUrl = url || 
      `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;
    this.url = `${baseUrl}?key=${apiKey}`;
    
    this.send = this.send.bind(this);
  }

  log(type: string, message: StreamingLog["message"]) {
    const log: StreamingLog = {
      date: new Date(),
      type,
      message,
    };
    this.emit("log", log);
  }

  connect(config: LiveConfig): Promise<boolean> {
    this.config = config;

    const ws = new WebSocket(this.url);

    ws.addEventListener("message", async (evt: MessageEvent) => {
      if (evt.data instanceof Blob) {
        this.receive(evt.data);
      } else {
        console.log("Non-blob message received", evt);
      }
    });

    return new Promise((resolve, reject) => {
      const onError = () => {
        this.disconnect(ws);
        const message = `Could not connect to "${this.url}"`;
        this.log(`server.error`, message);
        const error = new Error(message);
        this.emit("error", error);
        reject(error);
      };

      ws.addEventListener("error", onError);
      
      ws.addEventListener("open", () => {
        if (!this.config) {
          const error = new Error("Invalid config sent to connect()");
          reject(error);
          return;
        }
        
        this.log(`client.open`, `Connected to socket`);
        this.emit("open");

        this.ws = ws;

        const setupMessage: SetupMessage = {
          setup: this.config,
        };
        this._sendDirect(setupMessage);
        this.log("client.send", "setup");

        ws.removeEventListener("error", onError);
        
        ws.addEventListener("close", (ev: CloseEvent) => {
          this.disconnect(ws);
          let reason = ev.reason || "";
          
          if (reason.toLowerCase().includes("error")) {
            const prelude = "ERROR]";
            const preludeIndex = reason.indexOf(prelude);
            if (preludeIndex > 0) {
              reason = reason.slice(preludeIndex + prelude.length + 1, Infinity);
            }
          }
          
          this.log(
            `server.close`,
            `Disconnected ${reason ? `with reason: ${reason}` : ``}`
          );
          this.emit("close", ev);
        });
        
        resolve(true);
      });
    });
  }

  disconnect(ws?: WebSocket) {
    if ((!ws || this.ws === ws) && this.ws) {
      this.ws.close();
      this.ws = null;
      this.log("client.close", `Disconnected`);
      return true;
    }
    return false;
  }

  protected async receive(blob: Blob) {
    try {
      const response: LiveIncomingMessage = await blobToJSON(blob) as LiveIncomingMessage;
      
      if (isToolCallMessage(response)) {
        this.log("server.toolCall", response);
        this.emit("toolcall", response.toolCall);
        return;
      }

      if (isSetupCompleteMessage(response)) {
        this.log("server.setupComplete", "setupComplete");
        this.emit("setupcomplete");
        return;
      }

      if (isServerContentMessage(response)) {
        const { serverContent } = response;
        
        if (isInterrupted(serverContent)) {
          this.log("receive.serverContent", "interrupted");
          this.emit("interrupted");
          return;
        }
        
        if (isTurnComplete(serverContent)) {
          this.log("server.turnComplete", "turnComplete");
          this.emit("turncomplete");
        }

        if (isModelTurn(serverContent)) {
          let parts: Part[] = serverContent.modelTurn.parts;

          // Handle audio parts
          const audioParts = parts.filter(
            (p) => p.inlineData && p.inlineData.mimeType.startsWith("audio/pcm")
          );
          const base64s = audioParts.map((p) => p.inlineData?.data);

          // Strip audio parts from modelTurn
          const otherParts = difference(parts, audioParts);

          base64s.forEach((b64) => {
            if (b64) {
              const data = base64ToArrayBuffer(b64);
              this.emit("audio", data);
              this.log(`server.audio`, `Buffer (${data.byteLength} bytes)`);
            }
          });

          if (!otherParts.length) {
            return;
          }

          parts = otherParts;
          const content: ModelTurn = { modelTurn: { parts } };
          this.emit("content", content);
          this.log(`server.content`, response);
        }
      } else {
        console.log("Received unmatched message", response);
      }
    } catch (error) {
      console.error("Error processing received message:", error);
      this.emit("error", error as Error);
    }
  }

  /**
   * Send realtime input (audio/video chunks)
   */
  sendRealtimeInput(chunks: GenerativeContentBlob[]) {
    let hasAudio = false;
    let hasVideo = false;
    
    for (const chunk of chunks) {
      if (chunk.mimeType.includes("audio")) {
        hasAudio = true;
      }
      if (chunk.mimeType.includes("image")) {
        hasVideo = true;
      }
      if (hasAudio && hasVideo) {
        break;
      }
    }

    const message = hasAudio && hasVideo 
      ? "audio + video" 
      : hasAudio 
        ? "audio" 
        : hasVideo 
          ? "video" 
          : "unknown";

    const data: RealtimeInputMessage = {
      realtimeInput: {
        mediaChunks: chunks,
      },
    };
    
    this._sendDirect(data);
    this.log(`client.realtimeInput`, message);
  }

  /**
   * Send tool response
   */
  sendToolResponse(toolResponse: ToolResponseMessage["toolResponse"]) {
    const message: ToolResponseMessage = {
      toolResponse,
    };

    this._sendDirect(message);
    this.log(`client.toolResponse`, message);
  }

  /**
   * Send content parts (text/other)
   */
  send(parts: Part | Part[], turnComplete: boolean = true) {
    parts = Array.isArray(parts) ? parts : [parts];
    const content: Content = {
      role: "user",
      parts,
    };

    const clientContentRequest: ClientContentMessage = {
      clientContent: {
        turns: [content],
        turnComplete,
      },
    };

    this._sendDirect(clientContentRequest);
    this.log(`client.send`, clientContentRequest);
  }

  /**
   * Internal method to send messages directly
   */
  _sendDirect(request: object) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }
    const str = JSON.stringify(request);
    this.ws.send(str);
  }
} 