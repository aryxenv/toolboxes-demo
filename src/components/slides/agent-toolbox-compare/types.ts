/** Per-agent streaming state for the live comparison. */
export interface StreamState {
  text: string;
  isStreaming: boolean;
  error: string | null;
  /** Time to first token, in seconds. */
  ttft: number | null;
  /** Live estimated token count (chars / 4) until the server sends exact usage. */
  tokens: number;
  inputTokens: number | null;
  outputTokens: number | null;
  /** Retrieved evidence (toolbox agent only), used for grounded evaluation. */
  context: string;
}

export const INITIAL_STREAM: StreamState = {
  text: "",
  isStreaming: false,
  error: null,
  ttft: null,
  tokens: 0,
  inputTokens: null,
  outputTokens: null,
  context: "",
};

/** Phase 1 evaluation, available as soon as one agent finishes. */
export interface QuickScores {
  relevance: number;
  coherence: number;
}

/** Phase 2 evaluation, available once both agents finish. */
export interface FullScores {
  groundedness: number;
  similarity: number;
  retrieval: number;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

/** Which side of the comparison a panel represents. */
export type AgentKind = "toolbox" | "plain";
