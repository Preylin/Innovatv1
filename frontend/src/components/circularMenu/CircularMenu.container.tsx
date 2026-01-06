import { lazy, Suspense, useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CircularMenuUI } from "./CircularMenu.ui";
import { Modulos, type LoginResult, type Modulo } from "./types";
import SpinAtom from "../atoms/spin/Spin";
import { useCircularSizes } from "./sizeResponsive";
import { useCircularLayout } from "./useCircularLayout";

const LoginModal = lazy(() => import("../../Auth/Login"));

export default function CircularMenuContainer() {
  const navigate = useNavigate();

  const { radius, childSize, mainSize, wrapperSize } = useCircularSizes();
  const positions = useCircularLayout(Modulos, radius);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Modulo | null>(null);

  const handleModuleClick = useCallback((mod: Modulo) => {
    setOpen(false);
    setTimeout(() => setSelected(mod), 400);
  }, []);

  const handleLogin = useCallback(
    async ({ route, isAllowed }: LoginResult) => {
      if (isAllowed) {
        // 1. Navegamos PRIMERO (importante: esperar a que termine)
        await navigate({ to: route });
        // 2. Cerramos el modal SOLO después de que la ruta cambió
        setSelected(null);
      } else {
        console.error("Acceso denegado: El permiso no coincide con el módulo");
        setSelected(null);
      }
    },
    [navigate]
  );

  return (
    <>
      <CircularMenuUI
        modulos={Modulos}
        positions={positions}
        open={open}
        mainSize={mainSize}
        childSize={childSize}
        wrapperSize={wrapperSize}
        onToggle={() => setOpen((s) => !s)}
        onModuleClick={handleModuleClick}
      />

      {selected && (
        <Suspense
          fallback={
            <div className="fixed inset-0 grid place-items-center z-50">
              <SpinAtom size="large" />
            </div>
          }
        >
          <LoginModal
            name={selected.name}
            to={selected.to}
            onClose={() => setSelected(null)}
            onLogin={handleLogin}
          />
        </Suspense>
      )}
    </>
  );
}
