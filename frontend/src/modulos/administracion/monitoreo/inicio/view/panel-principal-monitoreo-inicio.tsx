import { useEffect } from "react";
import { Skeleton } from "#components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "#components/ui/card";
import { Badge } from "#components/ui/badge";
import { Separator } from "#components/ui/separator";
import { toast } from "sonner";
import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Layers, 
  CloudSun, 
  Cpu, 
  ShieldAlert, 
  Terminal 
} from "lucide-react";
import { useManagerVencimientoMonitoreo } from "../hooks/use-manager-data";
import { 
  useCalendarioVencimientosChips, 
  useCalendarioVencimientosMC, 
  useCalendarioVencimientosPro, 
  useCalendarioVencimientosWeather 
} from "../model/api/monitoreo-inicio-api";
import { Progress } from "#components/ui/progress";

// ------------------------------------------------------------
// Configuración visual por panel: icono, color y descripción
// ------------------------------------------------------------
const PANEL_CONFIG: Record<string, { icon: any; color: string; desc: string }> = {
  Weather: { icon: CloudSun, color: "text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800", desc: "Monitoreo de servicios weather" },
  Pro:     { icon: ShieldAlert, color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800", desc: "Monitoreo de licencias Pro" },
  MC:      { icon: Terminal, color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800", desc: "Monitoreo de servicios de mantenimiento y calibración" },
  Chips:   { icon: Cpu, color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800", desc: "Monitoreo de servicios de chips para estaciones" },
};

interface CardMonitoreoProps {
  title: string;
  isLoading: boolean;
  isError: boolean;
  managerData: any; 
}

// ------------------------------------------------------------
// Componente individual para cada panel del dashboard
// ------------------------------------------------------------
function CardMonitoreo({ title, isLoading, isError, managerData }: CardMonitoreoProps) {
  useEffect(() => {
    if (isError) {
      toast.error(`Error al cargar vencimientos de ${title}`, { position: "top-center" });
    }
  }, [isError, title]);

  const datos = managerData.getData();
  const config = PANEL_CONFIG[title] || { 
    icon: Layers, 
    color: "text-muted-foreground bg-muted border-muted", 
    desc: "Panel de control" 
  };
  const IconComponent = config.icon;

  // Extraemos solo la clase de color de texto y de fondo para el acento
  const [accentText, accentBg, accentBorder] = config.color.split(' ');

  return (
    <Card className="group relative flex flex-col overflow-hidden border border-border/50 bg-card/70 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-lg hover:border-border hover:bg-card/90">
      {/* Banda lateral de acento en lugar de la línea superior */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBg.replace('bg-', 'bg-')}`} />

      <CardHeader className="flex flex-row items-start space-y-0 gap-4 pb-3 pt-5">
        {/* Icono con fondo de acento */}
        <div className={`p-3 rounded-2xl ${accentBg} ${accentBorder} border shadow-sm`}>
          <IconComponent className={`h-5 w-5 ${accentText}`} />
        </div>

        <div className="flex-1 space-y-1">
          <CardTitle className="text-xl font-bold tracking-tight leading-tight">{title}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground line-clamp-1">{config.desc}</CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 pb-5">
        {isLoading ? (
          <div className="space-y-3 pt-1">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          datos.map((d: any, i: number) => {
            const total = d.total_registros ?? (d.menores_cero + d.iguales_cero + d.mayores_cero_hasta_30 + d.mayores_30);
            
            // Elementos en riesgo = vencidos + vencen hoy
            const elementosEnRiesgo = d.menores_cero + d.iguales_cero;
            const porcentajeRiesgo = total > 0 ? (elementosEnRiesgo / total) * 100 : 0;

            // Color dinámico de la barra de criticidad
            const getRiskColor = (value: number) => {
              if (value >= 50) return "bg-red-500";
              if (value >= 30) return "bg-amber-500";
              return "bg-emerald-500";
            };

            return (
              <div key={i} className="space-y-5">
                {/* Total de registros */}
                <div className="flex items-center justify-between rounded-xl bg-muted/40 border border-muted/30 px-4 py-3">
                  <span className="text-sm font-medium text-muted-foreground">Total Registros</span>
                  <Badge variant="secondary" className="font-bold text-sm px-3 py-1">
                    {total}
                  </Badge>
                </div>

                {/* Lista de métricas con iconos mejorados */}
                <div className="space-y-3">
                  <Metrica 
                    icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
                    label="Vencidos"
                    value={d.menores_cero}
                    valueColor="text-red-600 dark:text-red-400"
                    bgColor="bg-red-500/10"
                  />

                  <Metrica 
                    icon={<Clock className="h-4 w-4 text-amber-500" />}
                    label="Vencen Hoy"
                    value={d.iguales_cero}
                    valueColor="text-amber-600 dark:text-amber-400"
                    bgColor="bg-amber-500/10"
                  />

                  <Metrica 
                    icon={<Calendar className="h-4 w-4 text-blue-500" />}
                    label="Próximos (1 a 30 días)"
                    value={d.mayores_cero_hasta_30}
                    valueColor="text-blue-600 dark:text-blue-400"
                    bgColor="bg-blue-500/10"
                  />

                  <Metrica 
                    icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    label="Al día (&gt; 30 días)"
                    value={d.mayores_30}
                    valueColor="text-emerald-600 dark:text-emerald-400"
                    bgColor="bg-emerald-500/10"
                  />
                </div>

                <Separator className="bg-muted/50" />

                {/* Barra de criticidad */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tasa de Riesgo</span>
                    <span className={porcentajeRiesgo > 50 ? "text-red-600 font-semibold" : "font-medium"}>
                      {porcentajeRiesgo.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={porcentajeRiesgo} 
                    className="h-1.5 bg-muted [&>div]:transition-all [&>div]:duration-500"
                    style={{ ["--progress-color" as any]: getRiskColor(porcentajeRiesgo) }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// Pequeño subcomponente para cada métrica (evita repetición)
function Metrica({ icon, label, value, valueColor, bgColor }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  valueColor: string;
  bgColor: string;
}) {
  return (
    <div className="flex justify-between items-center group px-1 py-0.5 rounded-lg hover:bg-muted/20 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="shrink-0">{icon}</span>
        <span className="text-muted-foreground text-sm truncate group-hover:text-foreground transition-colors">
          {label}
        </span>
      </div>
      <span className={`font-semibold tabular-nums ${valueColor} ${bgColor} px-2 py-0.5 rounded-md text-xs ml-2 shrink-0`}>
        {value}
      </span>
    </div>
  );
}

// ------------------------------------------------------------
// Panel principal que orquesta los 4 dashboards
// ------------------------------------------------------------
export default function PanelPrincipalMonitoreoInicio() {
  const { data: vWeather, isLoading: loadWeather, isError: errWeather } = useCalendarioVencimientosWeather();
  const { managerData: DataWeather } = useManagerVencimientoMonitoreo(vWeather);

  const { data: vPro, isLoading: loadPro, isError: errPro } = useCalendarioVencimientosPro();
  const { managerData: DataPro } = useManagerVencimientoMonitoreo(vPro);

  const { data: vMC, isLoading: loadMC, isError: errMC } = useCalendarioVencimientosMC();
  const { managerData: DataMC } = useManagerVencimientoMonitoreo(vMC);

  const { data: vChips, isLoading: loadChips, isError: errChips } = useCalendarioVencimientosChips();
  const { managerData: DataChips } = useManagerVencimientoMonitoreo(vChips);

  return (
    <div className="w-fulltext-foreground selection:bg-primary/10 px-2">
      {/* Encabezado */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b pb-5 border-muted/40 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-linear-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Panel de Monitoreo General
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 max-w-xl">
            Estado analítico de vencimientos en tiempo real de los servicios pendientes.
          </p>
        </div>
        
        {/* Indicador de sincronización */}
        <div className="flex items-center gap-2 self-start md:self-center mt-3 md:mt-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Sincronizado</span>
        </div>
      </div>

      {/* Cuadrícula de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <CardMonitoreo title="Weather" isLoading={loadWeather} isError={errWeather} managerData={DataWeather} />
        <CardMonitoreo title="Pro"     isLoading={loadPro}     isError={errPro}     managerData={DataPro} />
        <CardMonitoreo title="MC" isLoading={loadMC} isError={errMC} managerData={DataMC} />
        <CardMonitoreo title="Chips"   isLoading={loadChips}   isError={errChips}   managerData={DataChips} />
      </div>
    </div>
  );
}