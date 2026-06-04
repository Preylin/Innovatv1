import { useState, type JSX } from "react";
import { RxCross2, RxDrawingPin } from "react-icons/rx";
import { MdPublishedWithChanges } from "react-icons/md";
import { RiExchangeBoxFill } from "react-icons/ri";
import { VscRequestChanges } from "react-icons/vsc";
import { Link, Outlet, useLocation } from "@tanstack/react-router";

type NavigationItem = "item1" | "item2" | "item3";

interface MenuItem {
  id: NavigationItem;
  label: string;
  icon: JSX.Element;
  to: string;
}

interface ShowSidebarProps {
  isOpen: boolean;
  toggleMenu: () => void;
  currentPath: string;
}

function ShowSidebar({ isOpen, toggleMenu, currentPath }: ShowSidebarProps) {
  const menuItems: MenuItem[] = [
    {
      id: "item1",
      label: "Mensuales",
      icon: <MdPublishedWithChanges className="text-red-400" fontSize={20} />,
      to: "/tesoreria/pagar/mensuales",
    },
    {
      id: "item2",
      label: "Proveedores",
      icon: <RiExchangeBoxFill fontSize={20} />,
      to: "/tesoreria/pagar/proveedores",
    },
    {
      id: "item3",
      label: "Eventuales",
      icon: <VscRequestChanges fontSize={20} />,
      to: "/tesoreria/pagar/eventuales",
    },
  ];

  return (
    <nav className="flex flex-col p-1 gap-3">
      <div className="flex flex-row items-center justify-between">
        <p className="text-xs font-bold text-mist-700 uppercase tracking-widest pl-1 select-none">
          Obligaciones
        </p>
        <button
          onClick={toggleMenu}
          type="button"
          className="text-gray-500 hover:text-red-500 transition-colors text-sm font-bold p-1 border border-gray-200 rounded"
        >
          {isOpen ? <RxCross2 /> : <RxDrawingPin />}
        </button>
      </div>

      <div className="px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            // Evaluamos la coincidencia exacta de la ruta actual del navegador
            const isActive = currentPath === item.to;

            return (
              <li key={item.id}>
                <Link to={item.to}>
                  <button
                    className={`w-full text-left p-2 rounded-md transition-all flex items-center gap-3 font-medium  ${
                      isActive
                        ? "bg-mist-600 text-mist-100 shadow-sm"
                        : "text-gray-600 hover:bg-mist-300 hover:text-mist-800"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function PanelCntsPorPagar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Extraemos de manera reactiva la URL exacta en la que se encuentra el usuario
  const location = useLocation();

  return (
    <div className="flex flex-col w-full h-[calc(100vh-58px)] overflow-hidden">
      <main className="relative flex flex-row w-full h-full overflow-hidden">
        {/* Zona sensible al hover */}
        <div
          className="absolute left-0 top-0 w-3 h-full z-30"
          onMouseEnter={() => setIsHovered(true)}
        />

        {/* SIDEBAR PERSISTENTE */}
        <aside
          onMouseLeave={() => setIsHovered(false)}
          className={`
            h-full bg-mist-100 transition-all duration-300 ease-in-out z-40
            ${isOpen ? "relative w-45 translate-x-0" : "absolute w-45 -translate-x-full"}
            ${!isOpen && isHovered ? "translate-x-0 shadow-2xl" : ""}
          `}
        >
          <ShowSidebar
            isOpen={isOpen}
            toggleMenu={() => setIsOpen(!isOpen)}
            currentPath={location.pathname} // Enviamos el pathname limpio al hijo
          />
        </aside>

        {/* CUERPO PRINCIPAL DINÁMICO */}
        <section className="overflow-auto w-full">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default PanelCntsPorPagar;
