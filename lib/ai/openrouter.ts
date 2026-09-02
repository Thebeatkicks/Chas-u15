/**
 * OpenRouter-klienten för JS Sensei.
 *
 * All AI går via gruppens OpenRouter-nyckel (PLAN.md §3, beslut 2) — en nyckel,
 * en provider, både chat och embeddings.
 *
 * Modell-id:t ligger i env-variabeln CHAT_MODEL och inte hårdkodat, för att
 * wave 2 ska kunna A/B-testa modeller utan kodändring (PLAN.md §3, beslut 4).
 */
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

/** Används om CHAT_MODEL inte är satt. Samma värde som i .env.example. */
export const DEFAULT_CHAT_MODEL = 'openai/gpt-4o-mini';

/**
 * Skapar chatmodellen ur miljövariablerna.
 *
 * Nyckeln läses bara här och bara på servern. Den får aldrig hamna i en
 * NEXT_PUBLIC_-variabel — då bakas den in i klientbundlen och blir publik.
 */
export function getChatModel() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY saknas. Lägg den i .env.local (gitignorad) — ' +
        'se .env.example. Nyckeln delas i gruppens privata kanal, aldrig i GitHub.',
    );
  }

  const modelId = process.env.CHAT_MODEL ?? DEFAULT_CHAT_MODEL;
  const openrouter = createOpenRouter({ apiKey });

  return { model: openrouter.chat(modelId), modelId };
}
