import type { Route } from "./+types/auth";
import { Auth } from "../auth/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function AuthPage() {
  return <Auth />;
}
