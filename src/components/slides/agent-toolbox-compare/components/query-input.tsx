import { useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QueryInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  suggestions: string[];
}

export function QueryInput({
  onSend,
  onStop,
  isStreaming,
  suggestions,
}: QueryInputProps) {
  const [value, setValue] = useState("");

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={isStreaming}
            onClick={() => submit(suggestion)}
            className={cn(
              "max-w-full truncate rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors",
              "hover:border-primary/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
            )}
            title={suggestion}
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit(value);
            }
          }}
          rows={1}
          placeholder="Ask both agents the same question…"
          className="no-scrollbar max-h-28 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        {isStreaming ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onStop}
            aria-label="Stop"
          >
            <Square aria-hidden="true" className="h-4 w-4" />
            Stop
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={() => submit(value)}
            disabled={!value.trim()}
            aria-label="Send"
          >
            <ArrowUp aria-hidden="true" className="h-4 w-4" />
            Compare
          </Button>
        )}
      </div>
    </div>
  );
}
