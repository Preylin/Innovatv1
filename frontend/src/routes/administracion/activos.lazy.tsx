import { createLazyFileRoute } from "@tanstack/react-router";
import TablaActivosPersonal from "../../modulos/administracion/activos/components/activosPersonal";
import TablaActivosMoviles from "../../modulos/administracion/activos/components/activosMoviles";
import TablaActivosDispositivos from "../../modulos/administracion/activos/components/activosDispositivos";
import { useState, type JSX } from "react";
import { RxCross2 } from "react-icons/rx";
import { LuMenu } from "react-icons/lu";

export const Route = createLazyFileRoute("/administracion/activos")({
  component: RouteComponent,
});

type NavigationItem = "item1" | "item2" | "item3";

export function RouteComponent() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<NavigationItem>("item1");

  const renderContent = (): JSX.Element => {
    switch (selectedItem) {
      case "item2":
        return <Item2 />;
      case "item3":
        return <Item3 />;
      default:
        return <Item1 />;
    }
  };

  return (
    <div className="flex flex-col w-full h-dvh overflow-hidden">
      <main className="relative flex flex-row w-full h-full overflow-hidden">
        {/* Zona sensible al hover */}
        <div
          className="absolute left-0 top-0 w-3 h-full z-30"
          onMouseEnter={() => setIsHovered(true)}
        />

        {/* SIDEBAR */}
        <aside
          onMouseLeave={() => setIsHovered(false)}
          className={`
            h-full bg-mist-100 border-r border-mist-500 transition-all duration-300 ease-in-out z-40
            ${isOpen ? "relative w-45 translate-x-0" : "absolute w-45 -translate-x-full"}
            ${!isOpen && isHovered ? "translate-x-0 shadow-2xl" : ""}
          `}
        >
          {/* Pasamos isOpen y la función para cerrar al Sidebar */}
          <ShowSidebar
            onSelect={setSelectedItem}
            isOpen={isOpen}
            toggleMenu={() => setIsOpen(!isOpen)}
          />
        </aside>

        {/* CUERPO PRINCIPAL */}
        <section className="flex-1 pl-1 overflow-auto relative">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}

interface ShowSidebarProps {
  onSelect: (id: NavigationItem) => void;
  isOpen: boolean;
  toggleMenu: () => void;
}

function ShowSidebar({ onSelect, isOpen, toggleMenu }: ShowSidebarProps) {
  const [activeItemId, setActiveItemId] = useState<NavigationItem | null>(
    "item1",
  );

  const menuItems: { id: NavigationItem; label: string; icon: string }[] = [
    { id: "item1", label: "Activos", icon: "📁" },
    { id: "item2", label: "Tabla", icon: "📊" },
    { id: "item3", label: "Ventana", icon: "🪟" },
  ];

  const handleItemClick = (id: NavigationItem) => {
    setActiveItemId(id);
    onSelect(id);
  };

  return (
    <nav className="flex flex-col p-1 gap-3">
      <div className="flex flex-row items-center justify-between">
        <p className="text-xs font-bold text-mist-700 uppercase tracking-widest pl-1">
          Navegación
        </p>
        <button
          onClick={toggleMenu}
          className="text-gray-500 hover:text-red-500 transition-colors text-sm font-bold p-1 border border-gray-200 rounded"
        >
          {isOpen ? <RxCross2 /> : <LuMenu />}
        </button>
      </div>

      <div className="px-2">
        <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleItemClick(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xs transition-all flex items-center gap-3 font-medium ${
                activeItemId === item.id
                  ? "bg-mist-600 text-mist-100 shadow-sm" // Estilo Activo
                  : "text-gray-600 hover:bg-mist-300 hover:text-mist-800" // Estilo Inactivo/Hover
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      </div>
    </nav>
  );
}

const Item1: React.FC = () => (
  <div className="flex flex-col gap-3">
    <div>
      : ) En desarrollo datos de prueba
    </div>
    <TablaActivosPersonal />
    <TablaActivosMoviles />
    <TablaActivosDispositivos />
  </div>
);

const Item2: React.FC = () => (
  <div>
    : ) En desarrollo
  </div>
);

const Item3: React.FC = () => (
  <div>
    : ) En desarrollo
  </div>
);
