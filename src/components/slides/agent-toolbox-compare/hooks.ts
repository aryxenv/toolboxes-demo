import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkServerOnline,
  evaluateFull,
  evaluateQuick,
  streamAgent,
} from "./api";
import type { SimAgent } from "./simulate";
import { getScenario } from "./simulate";
import type { AgentKind, FullScores, QuickScores, StreamState } from "./types";
import { INITIAL_STREAM } from "./types";

type StreamSetter = (updater: (prev: StreamState) => StreamState) => void;

function estimateTokens(text: string): number {
  return text ? Math.ceil(text.length / 4) : 0;
}

/** Manages the two concurrent agent streams and the two-phase evaluation.
 * A single `send` fans out to both agents at once so they can be compared live.
 *
 * When the backend is reachable it runs fully live (real streaming, evals,
 * tokens, real errors surface as-is). When it is offline, it falls back to a
 * scripted simulation so the deck is self-contained. */
export function useAgentCompare() {
  const [toolbox, setToolbox] = useState<StreamState>(INITIAL_STREAM);
  const [plain, setPlain] = useState<StreamState>(INITIAL_STREAM);

  const [toolboxEval, setToolboxEval] = useState<QuickScores | null>(null);
  const [plainEval, setPlainEval] = useState<QuickScores | null>(null);
  const [toolboxFull, setToolboxFull] = useState<FullScores | null>(null);
  const [plainFull, setPlainFull] = useState<FullScores | null>(null);

  const [isToolboxEvaluating, setIsToolboxEvaluating] = useState(false);
  const [isPlainEvaluating, setIsPlainEvaluating] = useState(false);
  const [isFullEvaluating, setIsFullEvaluating] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [mode, setMode] = useState<"real" | "sim" | null>(null);

  const toolboxAbort = useRef<AbortController | null>(null);
  const plainAbort = useRef<AbortController | null>(null);
  const evalAbort = useRef<AbortController | null>(null);
  const startTime = useRef(0);
  const hasEverSent = useRef(false);
  const lastQueryRef = useRef("");
  const quickDone = useRef<Record<AgentKind, boolean>>({
    toolbox: false,
    plain: false,
  });
  const fullDone = useRef(false);
  const timers = useRef<number[]>([]);
  const modeRef = useRef<"real" | "sim">("real");
  const sendToken = useRef(0);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => clearTimeout(id));
    timers.current = [];
  }, []);

  const setterFor = useCallback((kind: AgentKind) => {
    return kind === "toolbox" ? setToolbox : setPlain;
  }, []);

  const startStream = useCallback(
    (kind: AgentKind, query: string) => {
      const setState = setterFor(kind);
      let firstChunk = true;

      return streamAgent(kind, query, {
        onChunk: (chunk) => {
          setState((prev) => {
            const ttft =
              firstChunk && prev.ttft === null
                ? (performance.now() - startTime.current) / 1000
                : prev.ttft;
            firstChunk = false;
            const text = prev.text + chunk;
            return { ...prev, text, ttft, tokens: estimateTokens(text) };
          });
        },
        onContext: (context) => setState((prev) => ({ ...prev, context })),
        onUsage: (usage) =>
          setState((prev) => ({
            ...prev,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
          })),
        onError: (message) =>
          setState((prev) => ({ ...prev, error: message, isStreaming: false })),
        onDone: () => setState((prev) => ({ ...prev, isStreaming: false })),
      });
    },
    [setterFor],
  );

  // Scripted playback used only when the backend is offline.
  const runSimulation = useCallback((query: string) => {
    const scenario = getScenario(query);

    const play = (
      sim: SimAgent,
      setState: StreamSetter,
      setEvaluating: (value: boolean) => void,
      setQuick: (scores: QuickScores) => void,
    ) => {
      const parts = sim.text.match(/\S+\s*/g) ?? [sim.text];
      const start = performance.now();
      parts.forEach((part, index) => {
        const at = sim.ttftMs + (sim.streamMs * index) / parts.length;
        timers.current.push(
          window.setTimeout(() => {
            setState((prev) => {
              const ttft = prev.ttft ?? (performance.now() - start) / 1000;
              const text = prev.text + part;
              return { ...prev, ttft, text, tokens: estimateTokens(text) };
            });
          }, at),
        );
      });

      const endAt = sim.ttftMs + sim.streamMs + 80;
      timers.current.push(
        window.setTimeout(() => {
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            inputTokens: sim.inputTokens,
            outputTokens: sim.outputTokens,
            context: sim.context ?? "",
          }));
          setEvaluating(true);
        }, endAt),
      );
      timers.current.push(
        window.setTimeout(() => {
          setQuick(sim.quick);
          setEvaluating(false);
        }, endAt + 700),
      );
    };

    play(scenario.toolbox, setToolbox, setIsToolboxEvaluating, setToolboxEval);
    play(scenario.plain, setPlain, setIsPlainEvaluating, setPlainEval);

    const doneAt =
      Math.max(
        scenario.toolbox.ttftMs + scenario.toolbox.streamMs,
        scenario.plain.ttftMs + scenario.plain.streamMs,
      ) + 300;
    timers.current.push(
      window.setTimeout(() => setIsFullEvaluating(true), doneAt),
    );
    timers.current.push(
      window.setTimeout(() => {
        setToolboxFull(scenario.toolbox.full);
        setPlainFull(scenario.plain.full);
        setIsFullEvaluating(false);
      }, doneAt + 1100),
    );
  }, []);

  const send = useCallback(
    (rawQuery: string) => {
      const query = rawQuery.trim();
      if (!query) return;

      toolboxAbort.current?.abort();
      plainAbort.current?.abort();
      evalAbort.current?.abort();
      clearTimers();

      hasEverSent.current = true;
      quickDone.current = { toolbox: false, plain: false };
      fullDone.current = false;
      startTime.current = performance.now();
      lastQueryRef.current = query;

      setLastQuery(query);
      setMode(null);
      setToolboxEval(null);
      setPlainEval(null);
      setToolboxFull(null);
      setPlainFull(null);
      setToolbox({ ...INITIAL_STREAM, isStreaming: true });
      setPlain({ ...INITIAL_STREAM, isStreaming: true });

      const token = (sendToken.current += 1);
      void (async () => {
        const online = await checkServerOnline();
        if (token !== sendToken.current) return; // superseded by a newer send

        if (online) {
          modeRef.current = "real";
          setMode("real");
          toolboxAbort.current = startStream("toolbox", query);
          plainAbort.current = startStream("plain", query);
        } else {
          modeRef.current = "sim";
          setMode("sim");
          runSimulation(query);
        }
      })();
    },
    [clearTimers, runSimulation, startStream],
  );

  const stop = useCallback(() => {
    sendToken.current += 1;
    toolboxAbort.current?.abort();
    plainAbort.current?.abort();
    clearTimers();
    setToolbox((prev) => ({ ...prev, isStreaming: false }));
    setPlain((prev) => ({ ...prev, isStreaming: false }));
  }, [clearTimers]);

  // Abort any in-flight work if the slide unmounts.
  useEffect(() => {
    return () => {
      toolboxAbort.current?.abort();
      plainAbort.current?.abort();
      evalAbort.current?.abort();
      clearTimers();
    };
  }, [clearTimers]);

  // Phase 1 quick eval, fires per agent as soon as it finishes streaming.
  // Real path only; the simulation sets its own scores.
  const runQuick = useCallback(
    (
      kind: AgentKind,
      state: StreamState,
      setEval: (scores: QuickScores) => void,
      setEvaluating: (value: boolean) => void,
    ) => {
      if (modeRef.current !== "real" || !hasEverSent.current) return;
      if (state.isStreaming || !state.text || state.error) return;
      if (quickDone.current[kind]) return;
      quickDone.current[kind] = true;
      setEvaluating(true);
      evaluateQuick(lastQueryRef.current, state.text)
        .then(setEval)
        .catch(() => undefined)
        .finally(() => setEvaluating(false));
    },
    [],
  );

  useEffect(() => {
    runQuick("toolbox", toolbox, setToolboxEval, setIsToolboxEvaluating);
  }, [toolbox.isStreaming, toolbox.text, toolbox.error, runQuick, toolbox]);

  useEffect(() => {
    runQuick("plain", plain, setPlainEval, setIsPlainEvaluating);
  }, [plain.isStreaming, plain.text, plain.error, runQuick, plain]);

  // Phase 2 full eval, fires once both agents have settled successfully.
  useEffect(() => {
    if (
      modeRef.current !== "real" ||
      !hasEverSent.current ||
      fullDone.current
    ) {
      return;
    }
    if (toolbox.isStreaming || plain.isStreaming) return;
    if (!toolbox.text || !plain.text || toolbox.error || plain.error) return;

    fullDone.current = true;
    const controller = new AbortController();
    evalAbort.current = controller;
    setIsFullEvaluating(true);
    evaluateFull(
      {
        query: lastQueryRef.current,
        toolboxResponse: toolbox.text,
        plainResponse: plain.text,
        toolboxContext: toolbox.context,
        plainContext: plain.context,
      },
      controller.signal,
    )
      .then((result) => {
        setToolboxFull(result.toolbox);
        setPlainFull(result.plain);
      })
      .catch(() => undefined)
      .finally(() => setIsFullEvaluating(false));
  }, [toolbox, plain]);

  return {
    toolbox,
    plain,
    toolboxEval,
    plainEval,
    toolboxFull,
    plainFull,
    isToolboxEvaluating,
    isPlainEvaluating,
    isFullEvaluating,
    lastQuery,
    mode,
    isStreaming: toolbox.isStreaming || plain.isStreaming,
    send,
    stop,
  };
}
