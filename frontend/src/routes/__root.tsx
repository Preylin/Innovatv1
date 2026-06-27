// src/routes/__root.tsx
import {
  createRootRouteWithContext,
  Outlet,
  useMatches,
} from "@tanstack/react-router";
import { HelmetProvider, Helmet } from "react-helmet-async";
import type { AuthContextValue } from "../Auth/AuthProvider";
import { AntdProvider } from "../ui/antd";
import { useTheme } from "../Theme/useTheme";
import { Toaster } from "sonner";

interface MyRouterContext {
  auth: AuthContextValue;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RouteComponent,
});

function RouterHead() {
  const matches = useMatches();

  const metaMatch = [...matches]
    .reverse()
    .find((match) => (match.context as any)?.meta?.title);

  const currentTitle =
    (metaMatch?.context as any)?.meta?.title;

  return (
    <Helmet>
      <title>{currentTitle}</title>
    </Helmet>
  );
}

function RouteComponent() {
  const { isDark } = useTheme();
  return (
    <HelmetProvider>
      <RouterHead />
      <AntdProvider dark={isDark}>
        <Outlet />
        <Toaster />
      </AntdProvider>
    </HelmetProvider>
  );
}
