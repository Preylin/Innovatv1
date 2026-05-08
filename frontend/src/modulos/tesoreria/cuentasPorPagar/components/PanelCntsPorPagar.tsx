import { useState, type JSX } from "react";
import { CuentasPorPagarFijas } from "./ModalFormCntPorPagarFijas/PanelCntsPorCobrarFijas";
import { RxCross2 } from "react-icons/rx";
import { LuMenu } from "react-icons/lu";
import { MdPublishedWithChanges } from "react-icons/md";
import { RiExchangeBoxFill } from "react-icons/ri";
import { VscRequestChanges } from "react-icons/vsc";

interface ShowSidebarProps {
  onSelect: (id: NavigationItem) => void;
  isOpen: boolean;
  toggleMenu: () => void;
}

const Item1: React.FC = () => <CuentasPorPagarFijas />;

const Item2: React.FC = () => <div>: ) En desarrollo</div>;

const Item3: React.FC = () => <div>: ) En desarrollo</div>;

function ShowSidebar({ onSelect, isOpen, toggleMenu }: ShowSidebarProps) {
  const [activeItemId, setActiveItemId] = useState<NavigationItem | null>(
    "item1",
  );

  const menuItems: { id: NavigationItem; label: string; icon: JSX.Element }[] =
    [
      {
        id: "item1",
        label: "Mensuales",
        icon: (
          <MdPublishedWithChanges
            className=" text-red-400"
            fontSize={20}
          />
        ),
      },
      {
        id: "item2",
        label: "Temporales",
        icon: <RiExchangeBoxFill className="" fontSize={20} />,
      },
      {
        id: "item3",
        label: "Otras",
        icon: <VscRequestChanges className="" fontSize={20} />,
      },
    ];

  const handleItemClick = (id: NavigationItem) => {
    setActiveItemId(id);
    onSelect(id);
  };

  return (
    <nav className="flex flex-col p-1 gap-3">
      <div className="flex flex-row items-center justify-between">
        <p className="text-xs font-bold text-mist-700 uppercase tracking-widest pl-1 select-none">
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
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full text-left p-2 rounded-md transition-all flex items-center gap-3 font-medium ${
                  activeItemId === item.id
                    ? "bg-mist-600 text-mist-100 shadow-sm"
                    : "text-gray-600 hover:bg-mist-300 hover:text-mist-800"
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

type NavigationItem = "item1" | "item2" | "item3";

function PanelCntsPorCobrar() {
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
    <div className="flex flex-col w-full h-[calc(100vh-58px)] overflow-hidden">
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
        <section className="pl-1 overflow-auto w-full">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}

export default PanelCntsPorCobrar;
