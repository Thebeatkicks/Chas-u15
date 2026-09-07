/**
 * All synlig svensk copy på ett ställe så skissen (`docs/ui-sketch.md`) och
 * koden inte divergerar. `guestBanner` är medvetet ärlig (#33): ingen
 * inloggning finns, lovas inte. `suggestions` är samma tre frågor som
 * demo-manuset och retrieval-sanity kör.
 */
export const COPY = {
  wordmark: "JS Sensei",
  tagline: "Förklarar, löser inte",
  emptyTitle: "Ställ din första fråga",
  emptyBody:
    "Din nivå syns alltid uppe till höger. Jag förklarar JavaScript med MDN som källa — jag skriver inte färdig kod åt dig.",
  suggestions: [
    "Vad är en closure?",
    "Skillnad let vs const",
    "Hur fungerar map()?",
  ],
  inputPlaceholder: "Fråga om JavaScript…",
  guestBanner:
    "Du frågar som gäst — dina chattar sparas bara i den här webbläsaren. Skapa en profil för att anpassa svaren.",
  guestBannerAction: "Skapa profil",
  sourcesLabel: "Källor",
  footer: "Källor: MDN Web Docs · CC-BY-SA",
  send: "Skicka",
  streaming: "Sensei skriver…",
} as const;
