// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { AuthContextValue } from "../Auth/AuthProvider";
import { AntdProvider } from "../ui/antd";
import { useTheme } from "../Theme/useTheme";

interface MyRouterContext {
  auth: AuthContextValue;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RouteComponent,
});

function RouteComponent() {
  const { isDark } = useTheme();
  return (
    <AntdProvider dark={isDark}>
      <Outlet />
    </AntdProvider>
  );
}
