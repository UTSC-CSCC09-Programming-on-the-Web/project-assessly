import type {
  Content,
  FunctionCall,
  GenerationConfig,
  GenerativeContentBlob,
  Part,
  Tool,
} from "@google/generative-ai";

/**
 * Live API Configuration and Types
 */

// Configuration types
export type LiveConfig = {
  model: string;
  systemInstruction?: { parts: Part[] };
  generationConfig?: Partial<LiveGenerationConfig>;
  tools?: Array<Tool | { googleSearch: {} } | { codeExecution: {} }>;
};

export type LiveGenerationConfig = GenerationConfig & {
  responseModalities: "text" | "audio" | "image";
  speechConfig?: {
    voiceConfig?: {
      prebuiltVoiceConfig?: {
        voiceName: "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede" | string;
      };
    };
  };
};

// Message types
export type LiveOutgoingMessage =
  | SetupMessage
  | ClientContentMessage
  | RealtimeInputMessage
  | ToolResponseMessage;

export type SetupMessage = {
  setup: LiveConfig;
};

export type ClientContentMessage = {
  clientContent: {
    turns: Content[];
    turnComplete: boolean;
  };
};

export type RealtimeInputMessage = {
  realtimeInput: {
    mediaChunks: GenerativeContentBlob[];
  };
};

export type ToolResponseMessage = {
  toolResponse: {
    functionResponses: LiveFunctionResponse[];
  };
};

export type LiveFunctionResponse = {
  response: object;
  id: string;
};

// Incoming message types
export type LiveIncomingMessage =
  | ToolCallCancellationMessage
  | ToolCallMessage
  | ServerContentMessage
  | SetupCompleteMessage;

export type SetupCompleteMessage = { setupComplete: {} };

export type ServerContentMessage = {
  serverContent: ServerContent;
};

export type ServerContent = ModelTurn | TurnComplete | Interrupted;

export type ModelTurn = {
  modelTurn: {
    parts: Part[];
  };
};

export type TurnComplete = { turnComplete: boolean };

export type Interrupted = { interrupted: true };

export type ToolCallCancellationMessage = {
  toolCallCancellation: {
    ids: string[];
  };
};

export type ToolCallMessage = {
  toolCall: ToolCall;
};

export type LiveFunctionCall = FunctionCall & {
  id: string;
};

export type ToolCall = {
  functionCalls: LiveFunctionCall[];
};

// Log types
export type StreamingLog = {
  date: Date;
  type: string;
  count?: number;
  message: string | LiveOutgoingMessage | LiveIncomingMessage;
};

// Type guards
export const isSetupCompleteMessage = (a: unknown): a is SetupCompleteMessage =>
  typeof a === "object" && a !== null && "setupComplete" in a;

export const isServerContentMessage = (a: any): a is ServerContentMessage =>
  typeof a === "object" && a !== null && "serverContent" in a;

export const isToolCallMessage = (a: any): a is ToolCallMessage =>
  typeof a === "object" && a !== null && "toolCall" in a;

export const isModelTurn = (a: any): a is ModelTurn =>
  typeof a === "object" && a !== null && "modelTurn" in a;

export const isTurnComplete = (a: any): a is TurnComplete =>
  typeof a === "object" && a !== null && "turnComplete" in a;

export const isInterrupted = (a: any): a is Interrupted =>
  typeof a === "object" && a !== null && "interrupted" in a;

// Connection types
export type MultimodalLiveAPIClientConnection = {
  url?: string;
  apiKey: string;
}; 