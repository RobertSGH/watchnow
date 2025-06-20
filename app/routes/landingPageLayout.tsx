import type { Route } from "./+types/landingPageLayout";
import LandingPageLayout from "../landingPage/landingPageLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function LandingPage() {
  return <LandingPageLayout />;
}
