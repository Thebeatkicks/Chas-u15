"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { COPY } from "./copy";
import { LEVELS, levelLabel } from "./levels";
import { initials, useProfile, type Profile } from "./profile-store";

/* ── icons ────────────────────────────────────────────────────── */
function DojoIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 fill-current" aria-hidden>
      <path d="M10 2a8 8 0 1 1 0 16A8 8 0 0 1 10 2Zm0 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 2a1 1 0 0 1 1 1v3.17l2.12 2.12a1 1 0 1 1-1.41 1.42L9.29 10.7A1 1 0 0 1 9 10V6.5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0 fill-current opacity-40" aria-hidden>
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── level colour accent ──────────────────────────────────────── */
const LEVEL_DOT: Record<string, string> = {
  beginner:  "bg-emerald-500",
  student:   "bg-amber-500",
  developer: "bg-[var(--seal)]",
};

const NAV = [
  { href: "/", label: "Dojo", Icon: DojoIcon },
] as const;

/* ══════════════════════════════════════════════════════════════ */
/* Welcome modal — shown once to first-time visitors             */
/* ══════════════════════════════════════════════════════════════ */
function WelcomeModal() {
  const { setProfile, dismissGreeting } = useProfile();
  const router = useRouter();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<Profile["level"]>("beginner");
  const [step, setStep] = useState<"welcome" | "setup">("welcome");

  const saveAndGo = () => {
    if (name.trim()) setProfile({ name: name.trim(), level });
    dismissGreeting();
  };

  const continueAsGuest = () => {
    dismissGreeting();
  };

  const goSetup = () => {
    setStep("setup");
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/40 backdrop-blur-sm">
      {/* Card */}
      <div className="relative mx-4 w-full max-w-md rounded-3xl bg-[var(--paper-raised)] p-8 shadow-2xl">

        {step === "welcome" ? (
          <>
            <p className="font-serif text-3xl tracking-tight">Välkommen till JS&nbsp;Sensei</p>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              Vill du sätta upp din profil? Det tar 20&nbsp;sekunder och gör att
              svaren anpassas till dig.
            </p>
            <div className="mt-7 flex flex-col gap-3">
              <button
                onClick={goSetup}
                className="h-12 w-full rounded-2xl bg-[var(--ink)] text-sm font-medium text-[var(--paper-raised)] hover:bg-[var(--ink-soft)] transition-colors"
              >
                Sätt upp min profil
              </button>
              <button
                onClick={continueAsGuest}
                className="h-12 w-full rounded-2xl border border-[var(--line)] text-sm text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors"
              >
                Fortsätt som gäst
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-serif text-2xl tracking-tight">Lite om dig</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">Sparas bara i den här webbläsaren.</p>

            <div className="mt-6 space-y-4">
              {/* Name */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Namn</span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="T.ex. Ernest"
                  className="h-11 w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 text-sm outline-none focus:border-[var(--seal)]"
                />
              </label>

              {/* Level */}
              <fieldset>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Din nivå</legend>
                <div className="grid gap-2">
                  {LEVELS.map((lvl) => {
                    const sel = level === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setLevel(lvl.id)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
                          sel
                            ? "border-[var(--seal)] bg-[#f3e2d6]"
                            : "border-[var(--line)] bg-[var(--paper)] hover:border-[var(--gold)]"
                        }`}
                      >
                        <span>
                          <span className="font-medium">{lvl.label}</span>
                          <span className="ml-2 text-xs text-[var(--ink-soft)]">{lvl.hint}</span>
                        </span>
                        {sel && <span className="text-xs font-semibold text-[var(--seal)]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                onClick={saveAndGo}
                className="h-11 flex-1 rounded-2xl bg-[var(--ink)] text-sm font-medium text-[var(--paper-raised)] hover:bg-[var(--ink-soft)] transition-colors"
              >
                Spara och börja
              </button>
              <button
                onClick={continueAsGuest}
                className="h-11 rounded-2xl border border-[var(--line)] px-4 text-sm text-[var(--ink-soft)] hover:border-[var(--ink)] transition-colors"
              >
                Hoppa över
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* AppShell                                                       */
/* ══════════════════════════════════════════════════════════════ */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, ready, greeted, threads, activeThreadId, openThread, removeThread } = useProfile();
  const displayName = profile.name.trim() || "Gäst";
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setOpen(true);
  };

  const handleLeave = () => {
    leaveTimer.current = setTimeout(() => setOpen(false), 80);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">

      {/* First-visit modal */}
      {ready && !greeted && <WelcomeModal />}

      {/* ── Hover-open sidenav ───────────────────────────────── */}
      <aside
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="relative flex h-full flex-col border-r border-[var(--line)] bg-[var(--paper-raised)] overflow-hidden"
        style={{
          width: open ? "var(--nav-expanded)" : "var(--nav-collapsed)",
          transition: "width 220ms cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "2px 0 20px rgba(22,19,15,0.06)",
        }}
      >
        {/* Brand mark */}
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-5"
          aria-label={COPY.wordmark}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--ink)] font-serif text-sm text-[var(--paper-raised)]">
            師
          </span>
          <span className={`transition-opacity duration-150 ${open ? "opacity-100 delay-75" : "opacity-0"}`}>
            <span className="block font-serif text-base leading-none tracking-tight whitespace-nowrap">
              {COPY.wordmark}
            </span>
            <span className="block text-[10px] italic text-[var(--ink-soft)] whitespace-nowrap">
              {COPY.tagline}
            </span>
          </span>
        </Link>

        {/* Divider */}
        <div className="mx-3 h-px bg-[var(--line)]" />

        {/* Nav items */}
        <nav className="mt-3 flex flex-col gap-1 px-2">
          {NAV.map(({ href, label, Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors ${
                  active
                    ? "bg-[var(--ink)] text-[var(--paper-raised)]"
                    : "text-[var(--ink-soft)] hover:bg-[var(--paper-deep)] hover:text-[var(--ink)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon />
                <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-150 ${open ? "opacity-100 delay-75" : "opacity-0"}`}>
                  {label}
                </span>
                {active && (
                  <span className={`ml-auto transition-opacity duration-150 ${open ? "opacity-100 delay-75" : "opacity-0"}`}>
                    <ChevronIcon />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {threads.length > 0 ? (
          <div className="mt-4 min-h-0 px-2">
            <p
              className={`px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)] transition-opacity duration-150 ${
                open ? "opacity-100 delay-75" : "opacity-0"
              }`}
            >
              Trådar
            </p>
            <ul className="mt-1 max-h-56 space-y-0.5 overflow-y-auto">
              {threads.map((thread) => {
                const active = thread.id === activeThreadId;
                return (
                  <li key={thread.id} className="flex items-center gap-0.5">
                    <button
                      type="button"
                      title={thread.title}
                      onClick={() => {
                        openThread(thread.id);
                        if (pathname !== "/") router.push("/");
                      }}
                      className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                        active
                          ? "bg-[var(--paper-deep)] text-[var(--ink)]"
                          : "text-[var(--ink-soft)] hover:bg-[var(--paper-deep)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          active ? "bg-[var(--seal)]" : "bg-[var(--gold)]"
                        }`}
                      />
                      <span
                        className={`truncate text-sm transition-opacity duration-150 ${
                          open ? "opacity-100 delay-75" : "opacity-0"
                        }`}
                      >
                        {thread.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Ta bort ${thread.title}`}
                      onClick={() => removeThread(thread.id)}
                      className={`shrink-0 px-1.5 text-xs text-[var(--ink-soft)] hover:text-[var(--seal)] transition-opacity duration-150 ${
                        open ? "opacity-100 delay-75" : "opacity-0 pointer-events-none"
                      }`}
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Level dot row ─────────────────────────────────── */}
        {/* collapsed: 56px wide → dot centred; expanded: dot + label */}
        <div className="flex items-center gap-3 px-[17px] py-3">
          {/* dot: bigger + ring for visibility */}
          <span
            className={`h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-offset-1 ring-offset-[var(--paper-raised)] ${
              LEVEL_DOT[profile.level] ?? "bg-[var(--seal)]"
            } ${profile.level === "beginner" ? "ring-emerald-300" : profile.level === "student" ? "ring-amber-300" : "ring-[var(--seal)]/40"}`}
          />
          <span className={`min-w-0 transition-opacity duration-150 ${open ? "opacity-100 delay-75" : "opacity-0"}`}>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)] whitespace-nowrap">
              Din nivå
            </span>
            <span className="block text-sm font-medium whitespace-nowrap">
              {levelLabel(profile.level)}
            </span>
          </span>
        </div>

        {/* ── Profile row ───────────────────────────────────── */}
        {/* collapsed: avatar centred; expanded: avatar + name/focus */}
        <Link
          href="/profile"
          className="flex items-center gap-3 px-[14px] py-3 mb-2 rounded-xl mx-1 hover:bg-[var(--paper-deep)] transition-colors"
        >
          {/* avatar: slightly smaller so it doesn't clip nav edges */}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--moss)] font-serif text-xs text-[var(--paper-raised)]">
            {initials(profile.name)}
          </span>
          <span className={`min-w-0 transition-opacity duration-150 ${open ? "opacity-100 delay-75" : "opacity-0"}`}>
            <span className="block truncate text-sm font-medium whitespace-nowrap leading-tight">{displayName}</span>
            <span className="block truncate text-[11px] text-[var(--ink-soft)] whitespace-nowrap">
              {profile.focus.trim() || "Ingen inriktning"}
            </span>
          </span>
        </Link>
      </aside>

      {/* ── Main pane ─────────────────────────────────────────── */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
