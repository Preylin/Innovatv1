import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "#components/ui/tabs";
import { UseBarAdministracionIcons } from "#components/atoms/icons/AntDesign/administracion/barAdmIcons";
export const Route = createFileRoute("/administracion/monitoreo/_layout")({
  component: RouteComponent,
});

export function RouteComponent() {
  // 1. Obtenemos la ruta actual para que la pestaña activa coincida con la URL
  const location = useLocation();

  // Extraemos la última parte de la ruta como el valor de la pestaña actual
  const currentTab = location.pathname.split("/").pop() || "inicio";

  return (
    // 2. Vinculamos el valor del Tab al pathname de TanStack Router
    <Tabs value={currentTab} className="w-full h-full">
      <TabsList>
        {/* 3. Usamos el componente Link de TanStack Router con la propiedad 'asChild' */}
        <TabsTrigger value="inicio" asChild>
          <Link to="/administracion/monitoreo/inicio">
            <UseBarAdministracionIcons name="inicio" style={{ color: currentTab === "inicio" ? "#3b82f6" : "#6b7280" }} />
            <span className={`text-mist-500 dark:text-mist-50 ${currentTab === "inicio" ? "font-bold text-mist-900" : ""}`}>
              Inicio
            </span>
          </Link>
        </TabsTrigger>

        <TabsTrigger value="weather" asChild>
          <Link to="/administracion/monitoreo/weather">
            <UseBarAdministracionIcons name="weather" style={{ color: currentTab === "weather" ? "#3b82f6" : "#6b7280" }} />
            <span className={`text-mist-500 dark:text-mist-50 ${currentTab === "weather" ? "font-bold text-mist-900" : ""}`}>
              Weather
            </span>
          </Link>
        </TabsTrigger>

        <TabsTrigger value="pro" asChild>
          <Link to="/administracion/monitoreo/pro">
            <UseBarAdministracionIcons name="pro" style={{ color: currentTab === "pro" ? "#3b82f6" : "#6b7280" }} />
            <span className={`text-mist-500 dark:text-mist-50 ${currentTab === "pro" ? "font-bold text-mist-900" : ""}`}>
              Pro
            </span>
          </Link>
        </TabsTrigger>

        <TabsTrigger value="chips" asChild>
          <Link to="/administracion/monitoreo/chips">
            <UseBarAdministracionIcons name="chips" style={{ color: currentTab === "chips" ? "#3b82f6" : "#6b7280" }} />
            <span className={`text-mist-500 dark:text-mist-50 ${currentTab === "chips" ? "font-bold text-mist-900" : ""}`}>
              Chips
            </span>
          </Link>
        </TabsTrigger>

        <TabsTrigger value="mc" asChild>
          <Link to="/administracion/monitoreo/servicios">
            <UseBarAdministracionIcons name="servicios" style={{ color: currentTab === "servicios" ? "#3b82f6" : "#6b7280" }} />
            <span className={`text-mist-500 dark:text-mist-50 ${currentTab === "servicios" ? "font-bold text-mist-900" : ""}`}>
              M-C
            </span>
          </Link>
        </TabsTrigger>
      </TabsList>
      <div className="h-full w-full px-1">
        <Outlet />
      </div>
    </Tabs>
  );
}
