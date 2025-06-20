import {
  type RouteConfig,
  index,
  layout,
  route,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("routes/auth.tsx"),
  // layout("routes/landingPageLayout.tsx", [
  //   route("home", "landingPage/landingPageLayout.tsx"),
  // ]),
  ...prefix("home", [index("routes/landingPageLayout.tsx")]),
] satisfies RouteConfig;
