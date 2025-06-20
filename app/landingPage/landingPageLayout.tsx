import { useState } from "react";
import { Auth } from "../auth/auth";
import { Dashboard } from "../components/Dashboard";

export default function LandingPageLayout() {
  const [user, setUser] = useState<{ id: number; username: string } | null>(
    null
  );

  return user ? (
    <Dashboard user={user} onLogout={() => setUser(null)} />
  ) : (
    <Auth onAuthSuccess={setUser} />
  );
}
