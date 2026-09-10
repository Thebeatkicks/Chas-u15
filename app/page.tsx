// Tunn route: de tre chattzonerna (header / meddelanden / input) ägs av Chat
// så / och /profile kan dela AppShell utan att duplicera layout.
import { Chat } from "@/components/chat";

export default function Home() {
  return <Chat />;
}
