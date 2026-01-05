import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/contabilidad")({
  beforeLoad: async ({ context }) => {
    const auth = context.auth;
    await auth.ensureReady();

    if (!auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});


function RouteComponent() {
 return <div>Hello "/contabilidad"!</div>
}
