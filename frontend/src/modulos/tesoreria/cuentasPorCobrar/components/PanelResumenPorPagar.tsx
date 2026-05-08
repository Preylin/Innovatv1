import { Link } from "@tanstack/react-router";
import { UseComercialesIconsLO } from "../../../../components/atoms/icons/OtrasLibs/Comerciales";

interface LinkItem {
  to: string;
  label: string;
  icon: "cntCobrar" | "cntPagar";
  bgColor: string;
  hoverColor: string;
}

const LINKS_TESORERIA: LinkItem[] = [
  {
    to: "/tesoreria/cobrar",
    label: "Cuentas por cobrar",
    icon: "cntCobrar",
    bgColor: "bg-emerald-300",
    hoverColor: "hover:bg-emerald-400",
  },
  {
    to: "/tesoreria/pagar",
    label: "Cuentas por pagar",
    icon: "cntPagar",
    bgColor: "bg-rose-300",
    hoverColor: "hover:bg-rose-400",
  },
];

function PanelResumenTesoreria() {
  return (
    <nav className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-md shadow-sm">
      {LINKS_TESORERIA.map((item, index) => (
        <Link
          key={index}
          to={item.to}
          className="group transition-transform duration-200 active:scale-95"
        >
          <div
            className={`
              ${item.bgColor} ${item.hoverColor}
              flex items-center justify-center gap-3 
              p-4 rounded-md font-semibold uppercase text-gray-800
              transition-colors duration-300 shadow-sm
            `}
          >
            <UseComercialesIconsLO
              name={item.icon}
              className="text-xl animate-bounce"
            />
            <span className="tracking-wide">{item.label}</span>
          </div>
        </Link>
      ))}
    </nav>
  );
}

export default PanelResumenTesoreria;
