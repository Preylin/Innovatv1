// src/main.tsx
import "./index.css";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from "./api/queryClient";
import { routeTree } from "./routeTree.gen";
import { AuthProvider, useAuth, type AuthContextValue } from "./Auth/AuthProvider";
import PageNoExiste from "./components/pages/resultado/PageNotExiste";
import { StrictMode, useMemo } from "react";
import { ThemeProvider } from "./Theme/useTheme";
import { App as AntdApp } from "antd";

interface MyRouterContext {
  auth: AuthContextValue;
}

// Define tu componente 404 personalizado
function NotFoundPage() {
  return (
    <div className="flex justify-center">
      <PageNoExiste />
    </div>
  );
}

const router = createRouter({
  routeTree,
  context: { auth: null as any as AuthContextValue } as MyRouterContext,
  defaultNotFoundComponent: NotFoundPage
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();
  const routerContext = useMemo(() => ({ auth }) as MyRouterContext, [auth]);
  return <RouterProvider router={router} context={routerContext} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AntdApp>
            <InnerApp />
            {import.meta.env.DEV && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </AntdApp>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
