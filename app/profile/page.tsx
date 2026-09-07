// Egen route så profilen kan bokmärkas; state ligger i ProfileProvider,
// inte i URL:en (ingen auth, #33).
import { ProfileForm } from "@/components/profile-form";

export default function ProfilePage() {
  return <ProfileForm />;
}
