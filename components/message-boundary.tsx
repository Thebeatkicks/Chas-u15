"use client";

import { Component, type ReactNode } from "react";

/**
 * Felgräns runt ett enskilt assistentsvar (issue #64).
 *
 * Skyddsnät, inte huvudfix: rotorsaken till kraschen var en kapplöpning i
 * `chat.tsx` som avbröt strömmen mitt i ett svar. Men smoke-testets §3 kräver
 * att inget rått felmeddelande, stacktrace eller nyckelnamn någonsin syns i
 * UI:t — och den garantin ska inte hänga på att varje framtida renderingsbugg
 * är känd i förväg. Kraschar ett svar visas en läsbar rad i stället för
 * React-felet, och resten av chatten (övriga svar, inputfältet, trådlistan)
 * fortsätter fungera eftersom gränsen sitter runt ett meddelande i taget.
 *
 * Måste vara en klasskomponent — React har ingen hook-motsvarighet till
 * componentDidCatch.
 */
export class MessageBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Detaljerna hör hemma i konsolen för oss, aldrig i chattbubblan.
    console.error("[chat] rendering av svar misslyckades:", error);
  }

  render() {
    if (this.state.failed) {
      return (
        <p className="text-sm text-[var(--ink-soft)]">
          Svaret kunde inte visas. Ställ gärna frågan igen.
        </p>
      );
    }
    return this.props.children;
  }
}
