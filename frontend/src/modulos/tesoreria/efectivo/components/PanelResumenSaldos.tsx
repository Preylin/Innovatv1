import { Link } from "@tanstack/react-router";
import { UseComercialesIconsLO } from "../../../../components/atoms/icons/OtrasLibs/Comerciales";
import { useCajaChicaSaldoNeto } from "../data/api.cajaChica";

interface CardConfig {
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  currency: "PEN" | "USD";
  link: string;
}

export const ResumenSaldoEfectivo: React.FC = () => {
  const { data, isLoading } = useCajaChicaSaldoNeto();

  const formatCurrency = (
    value: number = 0,
    currency: string = "PEN",
  ): string => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 w-full bg-slate-100 animate-pulse rounded-2xl"
          />
        ))}
      </div>
    );
  }

  const cards: CardConfig[] = [
    {
      title: "Caja Chica",
      value: data?.saldo_caja_chica,
      icon: (
        <UseComercialesIconsLO
          name="cajaChica"
          className="text-amber-600 animate-bounce"
          fontSize={20}
        />
      ),
      color: "bg-amber-50 border-amber-100",
      hoverColor: "hover:bg-amber-200",
      currency: "PEN",
      link: "/tesoreria/movimiento/caja",
    },
    {
      title: "BCP Soles",
      value: data?.saldo_bcp_soles,
      icon: (
        <UseComercialesIconsLO
          name="soles"
          className="text-blue-600 animate-bounce"
          fontSize={20}
        />
      ),
      color: "bg-blue-50 border-blue-100",
      hoverColor: "hover:bg-blue-200",
      currency: "PEN",
      link: "/tesoreria/movimiento/soles",
    },
    {
      title: "BCP Dólares",
      value: data?.saldo_bcp_dolares,
      icon: (
        <UseComercialesIconsLO
          name="dolar"
          className="text-emerald-600 animate-bounce"
          fontSize={20}
        />
      ),
      color: "bg-emerald-50 border-emerald-100",
      hoverColor: "hover:bg-emerald-200",
      currency: "USD",
      link: "/tesoreria/movimiento/dolares",
    },
  ];

  return (
    <div className="p-2 space-y-2 rounded-md dark:bg-mist-600 bg-mist-100/70 border border-mist-300 dark:border-mist-600 shadow-xs">
      <h2 className="md:text-lg lg:text-xl text-base font-bold dark:text-mist-50 text-mist-900  uppercase tracking-tight">
        Estado de Cuentas
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {cards.map((card, index) => {
          const isNegative = (card.value ?? 0) < 0;

          return (
            <div
              key={index}
              className={`relative overflow-hidden p-5 rounded-md border shadow-sm transition-all hover:shadow-md ${card.color} ${card.hoverColor}`}
            >
              <Link to={card.link}>
                <div className="flex justify-between items-center mb-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase text-mist-50 bg-zinc-500 px-2 py-1 rounded-md">
                    {card.title}
                  </span>
                </div>

                <div
                  className={`md:text-xl lg:text-2xl text-base font-bold tracking-tight ${isNegative ? "text-red-600" : "text-slate-900"}`}
                >
                  {formatCurrency(card.value, card.currency)}
                </div>

                <p className="text-xs text-slate-500 mt-1">Saldo disponible</p>

                {/* Decoración sutil de fondo */}
                <div className="absolute -right-2 -bottom-2 opacity-5 scale-150">
                  {card.icon}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ResumenSaldoEfectivo;
