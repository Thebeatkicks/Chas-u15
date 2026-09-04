"use client";

import {
  Children,
  isValidElement,
  useState,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

/**
 * Progressive markdown: re-parse the full buffer on every stream chunk.
 * Incomplete fences (` ``` ` without a closer) would otherwise swallow the
 * rest of the answer — close them so the open block still highlights.
 */
function closeOpenFences(markdown: string) {
  const fences = markdown.match(/```/g)?.length ?? 0;
  return fences % 2 === 1 ? `${markdown}\n\`\`\`` : markdown;
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    return extractText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const child = Children.toArray(children)[0];
  let language = "kod";
  if (isValidElement(child)) {
    const className =
      (child.props as { className?: string }).className ?? "";
    const match = className.match(/language-([a-z0-9+#-]+)/i);
    if (match?.[1]) language = match[1];
  }
  const code = extractText(children).replace(/\n$/, "");

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="sensei-code">
      <div className="sensei-code-bar">
        <span className="sensei-code-lang">{language}</span>
        <button
          type="button"
          onClick={copy}
          className="sensei-code-copy"
        >
          {copied ? "Kopierat" : "Kopiera"}
        </button>
      </div>
      <pre>{children}</pre>
    </div>
  );
}

export function MarkdownMessage({
  text,
  streaming = false,
}: {
  text: string;
  streaming?: boolean;
}) {
  return (
    <div className="sensei-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        }}
      >
        {closeOpenFences(text)}
      </ReactMarkdown>
      {streaming ? (
        <span className="sensei-caret ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-[var(--seal)] align-middle" />
      ) : null}
    </div>
  );
}
