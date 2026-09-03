"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { COPY } from "./copy";
import { EmptyState } from "./empty-state";
import { LevelPicker } from "./level-picker";
import { type Level } from "./levels";
import { SourceChips } from "./source-chips";

function messageText(message: { parts: { type: string; text?: string }[] }) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

export function Chat() {
  const [level, setLevel] = useState<Level>("beginner");
  const [input, setInput] = useState("");
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, error, clearError } = useChat({
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    clearError();
    sendMessage({ text }, { body: { level } });
    setInput("");
  };

  return (
    <div className="flex min-h-full flex-col bg-[#f7f6f2] text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-[#fffef9]">
        <div className="mx-auto flex w-full max-w-[42rem] items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="font-serif text-xl leading-none">{COPY.wordmark}</p>
            <p className="mt-1 text-xs text-zinc-500">{COPY.tagline}</p>
          </div>
          <LevelPicker value={level} onChange={setLevel} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[42rem] flex-1 flex-col px-4 py-6">
        {messages.length === 0 ? (
          <EmptyState onPickSuggestion={setInput} />
        ) : (
          <ol className="flex flex-1 flex-col gap-5">
            {messages.map((message) => {
              const text = messageText(message);
              const isUser = message.role === "user";
              return (
                <li
                  key={message.id}
                  className={isUser ? "flex justify-end" : "block"}
                >
                  {isUser ? (
                    <p className="max-w-[85%] rounded-2xl bg-emerald-100 px-4 py-2.5 text-sm text-emerald-950">
                      {text}
                    </p>
                  ) : (
                    <div className="max-w-[40rem]">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-800">
                        {text}
                        {status === "streaming" &&
                        message.id === messages.at(-1)?.id ? (
                          <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-teal-700 align-middle" />
                        ) : null}
                      </p>
                      <SourceChips message={message} />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-[#fffef9]">
        <div className="mx-auto w-full max-w-[42rem] px-4 py-3">
          {error ? (
            <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error.message || "Något gick fel. Försök igen."}
            </p>
          ) : null}
          {status === "streaming" ? (
            <p className="mb-2 text-xs text-zinc-500">{COPY.streaming}</p>
          ) : null}
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={COPY.inputPlaceholder}
              disabled={busy}
              className="h-12 flex-1 rounded-full border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-teal-700 disabled:bg-zinc-100"
            />
            <button
              type="submit"
              disabled={busy || input.trim() === ""}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-700 text-lg text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
              aria-label={COPY.send}
            >
              ➤
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-zinc-400">
            {COPY.footer}
          </p>
        </div>
      </footer>
    </div>
  );
}
