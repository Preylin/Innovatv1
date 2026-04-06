// src/components/organisms/ShowMessage.tsx
import { useQuery } from "@tanstack/react-query";
import { Tooltip } from "antd";
import { useEffect, useState } from "react";

function Sincronizando() {
  return (
    <div className=" ml-2 absolute left-0 top-1/2 -translate-y-1/2 p-2">
      <div className="flex flex-row text-xs gap-2">
        <div className="size-3 animate-ping animate-ease-in rounded-2xl bg-red-500"></div>
        <div>Sincronizando...</div>
      </div>
    </div>
  );
}

function Sincronizado() {
  const [mostrarSegundo, setMostrarSegundo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarSegundo(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className=" ml-2 absolute left-0 top-1/2 -translate-y-1/2 p-2">
      <div className="flex flex-row text-xs gap-2">
        <Tooltip title="Sincronizado" placement="right">
          <div className="size-3 animate-ping animate-ease-in rounded-2xl bg-green-500"></div>
        </Tooltip>{" "}
        <div>{mostrarSegundo ? "" : "Sincronizado"}</div>
      </div>
    </div>
  );
}

export function ShowMessage() {
  const { data } = useQuery({
    queryKey: ["sync-status"],
    // Agregamos una función que simplemente retorna el estado inicial
    queryFn: () => ({ isSyncing: false, lastUpdate: 0 }),
    enabled: false,
    initialData: { isSyncing: false, lastUpdate: 0 },
  });

  if (!data || data.lastUpdate === 0) return null;

  return (
    <div
      style={{
        padding: "2px",
        color: "#F7F7F7"
      }}
    >
      {data.isSyncing ? <Sincronizando /> : <Sincronizado />}
    </div>
  );
}


