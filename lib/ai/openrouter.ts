/**
 * OpenRouter-klienten för chatmodellen.
 *
 * All AI i projektet går via gruppens enda OpenRouter-nyckel (PLAN.md §3
 * beslut 2) — både chat här och embeddings i `retrieval.ts`. Det var valet
 * som gjorde att vi bara behövde dela ut och bevaka en nyckel.
 *
 * Modell-id:t ligger i CHAT_MODEL och är inte hårdkodat. Det var inte
 * förhandsoptimering: tack vare det kunde hela modell-A/B-testet i
 * `docs/model-ab.md` köras som en ren miljövariabeländring, utan en enda rad
 * kod. Slutsatsen blev att behålla `openai/gpt-4o-mini` — den slog både
 * Claude Haiku 4.5 och GPT-5-mini på instruktionsföljning och latens. Ett
 * modellbyte i produktion är fortfarande bara en ändring i Vercels
 * env-inställningar.
 */
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

/**
 * Fallback när CHAT_MODEL saknas. Speglar `.env.example` — ändras den ena
 * ska den andra ändras, annars kör en lokal utvecklare utan `.env.local` en
 * annan modell än den som är dokumenterad.
 */
export const DEFAULT_CHAT_MODEL = 'openai/gpt-4o-mini';

/**
 * Skapar chatmodellen ur miljövariablerna.
 *
 * Nyckeln läses bara här och bara på servern. Den får ALDRIG döpas om till
 * NEXT_PUBLIC_OPENROUTER_API_KEY — Next bakar in allt med det prefixet i
 * klientbundlen, och repot är publikt. Samma sak gäller Supabase-nyckeln i
 * `retrieval.ts`.
 *
 * Kastar hellre än att falla tillbaka tyst: en saknad nyckel är ett
 * konfigurationsfel som ska synas direkt vid första anropet, inte visa sig
 * som märkliga svar senare. Meddelandet pekar ut exakt vad som ska göras,
 * eftersom det är det första felet en ny gruppmedlem möter.
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
