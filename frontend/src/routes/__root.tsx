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
        <div className="bg-gray-100, dark:bg-gray-950">
          <Outlet />
        </div>
    </AntdProvider>
  );
}
