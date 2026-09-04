"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { COPY } from "./copy";
import { EmptyState } from "./empty-state";
import { LevelPicker } from "./level-picker";
import { MarkdownMessage } from "./markdown-message";
import { useProfile } from "./profile-store";
import { SourceChips } from "./source-chips";

function messageText(message: { parts: { type: string; text?: string }[] }) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

function asThreadTitle(messages: UIMessage[]) {
  const first = messages.find((message) => message.role === "user");
  const text = first ? messageText(first) : "Ny tråd";
  return text.slice(0, 42) || "Ny tråd";
}

export function Chat() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-[var(--ink-soft)]">
        Öppnar dojon…
      </div>
    );
  }
  return <ChatSession />;
}

function ChatSession() {
  const { profile, setLevel, threads, saveThread, removeThread } = useProfile();
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exported, setExported] = useState(false);
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, setMessages, status, error, clearError } =
    useChat({
      transport,
    });

  const busy = status === "submitted" || status === "streaming";
  const questionCount = messages.filter((message) => message.role === "user")
    .length;

  const archiveCurrent = () => {
    if (messages.length === 0) return;
    const last = messages.at(-1);
    saveThread({
      id: crypto.randomUUID(),
      title: asThreadTitle(messages),
      updatedAt: new Date().toISOString(),
      preview: last ? messageText(last).slice(0, 80) : "",
      messages,
    });
  };

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    clearError();
    sendMessage({ text }, { body: { level: profile.level } });
    setInput("");
  };

  const copyText = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1400);
  };

  const exportChat = async () => {
    const body = messages
      .map((message) => {
        const who = message.role === "user" ? "Du" : "Sensei";
        return `${who}:\n${messageText(message)}`;
      })
      .join("\n\n");
    await navigator.clipboard.writeText(body || "(tom konversation)");
    setExported(true);
    window.setTimeout(() => setExported(false), 1400);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 pt-5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--seal)] uppercase">
            {questionCount === 0
              ? "Ny session"
              : `${questionCount} fråga${questionCount === 1 ? "" : "or"}`}
          </p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Svaren anpassas efter din nivå.
          </p>
        </div>
        <LevelPicker value={profile.level} onChange={setLevel} />
      </div>

      {!profile.name.trim() ? (
        <div className="mx-auto mt-4 w-full max-w-3xl px-4">
          <p className="rounded-2xl bg-[var(--paper-raised)] px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
            {COPY.guestBanner}{" "}
            <Link
              href="/profile"
              className="font-medium text-[var(--seal)] hover:underline"
            >
              {COPY.guestBannerAction}
            </Link>
          </p>
        </div>
      ) : null}

      <main className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-6 pb-48 scroll-smooth">
        {messages.length === 0 ? (
          <EmptyState onPickSuggestion={setInput} />
        ) : (
          <ol className="flex flex-1 flex-col gap-6">
            {messages.map((message) => {
              const text = messageText(message);
              const isUser = message.role === "user";
              return (
                <li
                  key={message.id}
                  className={isUser ? "flex justify-end" : "block"}
                >
                  {isUser ? (
                    <p className="max-w-[85%] rounded-2xl bg-[var(--moss)] px-4 py-2.5 text-sm text-[var(--paper-raised)]">
                      {text}
                    </p>
                  ) : (
                    <div className="max-w-[40rem] rounded-3xl border border-[var(--line)] bg-[var(--paper-raised)]/80 px-4 py-4 shadow-[0_12px_40px_rgba(22,19,15,0.04)]">
                      <MarkdownMessage
                        text={text}
                        streaming={
                          status === "streaming" &&
                          message.id === messages.at(-1)?.id
                        }
                      />
                      <SourceChips message={message} />
                      {text && status !== "streaming" ? (
                        <button
                          type="button"
                          onClick={() => copyText(message.id, text)}
                          className="mt-3 text-xs text-[var(--ink-soft)] hover:text-[var(--seal)]"
                        >
                          {copiedId === message.id
                            ? "Kopierat"
                            : "Kopiera svaret"}
                        </button>
                      ) : null}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {threads.length > 0 && messages.length === 0 ? (
          <section className="mt-8 border-t border-[var(--line)] pt-5">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--ink-soft)] uppercase">
              Tidigare i den här webbläsaren
            </p>
            <ul className="mt-3 space-y-2">
              {threads.map((thread) => (
                <li
                  key={thread.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] px-3 py-2"
                >
                  <button
                    type="button"
                    className="min-w-0 text-left"
                    onClick={() =>
                      setMessages(thread.messages as UIMessage[])
                    }
                  >
                    <span className="block truncate text-sm">{thread.title}</span>
                    <span className="block truncate text-xs text-[var(--ink-soft)]">
                      {thread.preview}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeThread(thread.id)}
                    className="text-xs text-[var(--ink-soft)] hover:text-[var(--seal)]"
                  >
                    Ta bort
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>

      <footer className="pointer-events-none absolute bottom-0 left-0 right-0 z-10">
        <div className="pointer-events-auto mx-auto w-full max-w-3xl px-4 pb-4 pt-6"
          style={{ background: "linear-gradient(to top, var(--paper) 60%, transparent)" }}>
          {error ? (
            <p
              className="mb-2 rounded-xl bg-[#f3e2d6] px-3 py-2 text-sm text-[var(--seal-deep)]"
              role="alert"
            >
              {error.message || "Något gick fel. Försök igen."}
            </p>
          ) : null}
          {status === "streaming" ? (
            <p className="mb-2 text-xs tracking-wide text-[var(--ink-soft)]">
              {COPY.streaming}
            </p>
          ) : null}

          <div className="mb-2 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              disabled={busy || messages.length === 0}
              onClick={() => {
                archiveCurrent();
                setMessages([]);
                setInput("");
                clearError();
              }}
              className="rounded-full border border-[var(--line)] px-3 py-1 text-[var(--ink-soft)] hover:border-[var(--ink)] disabled:opacity-40"
            >
              Ny fråga
            </button>
            <button
              type="button"
              disabled={messages.length === 0}
              onClick={exportChat}
              className="rounded-full border border-[var(--line)] px-3 py-1 text-[var(--ink-soft)] hover:border-[var(--ink)] disabled:opacity-40"
            >
              {exported ? "Kopierad tråd" : "Exportera"}
            </button>
          </div>

          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <textarea
              value={input}
              rows={1}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return;
                if (event.shiftKey) return;
                if (event.key !== "Enter") return;
                event.preventDefault();
                event.stopPropagation();
                submit();
              }}
              placeholder={COPY.inputPlaceholder}
              disabled={busy}
              className="max-h-40 min-h-12 flex-1 resize-none rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm outline-none focus:border-[var(--seal)] disabled:bg-[var(--paper-deep)]"
            />
            <button
              type="submit"
              disabled={busy || input.trim() === ""}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--seal)] text-[var(--paper-raised)] disabled:cursor-not-allowed disabled:bg-[var(--paper-deep)] disabled:text-[var(--ink-soft)]"
              aria-label={COPY.send}
            >
              <SendIcon />
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-[var(--ink-soft)]">
            Enter skickar · Shift+Enter ny rad · {COPY.footer}
          </p>
        </div>
      </footer>
    </div>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M3.2 9.2 16.4 3.4c.6-.3 1.2.3.9.9L11.5 17c-.2.5-.9.5-1.1 0L8.2 11.8 3.2 9.6c-.5-.2-.5-.9 0-1.1Z" />
    </svg>
  );
}
