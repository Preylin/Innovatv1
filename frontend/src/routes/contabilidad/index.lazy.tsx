import { createLazyFileRoute, Link, Outlet } from '@tanstack/react-router'
import { IoMdSettings } from "react-icons/io";



export const Route = createLazyFileRoute('/contabilidad/')({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <div>
      <PanelGeneralContabilidad />
      <Outlet />
    </div>
  )
}



function PanelGeneralContabilidad(){
const secciones = [

    {
      titulo: "Ventas y Compras",
      descripcion: "Panel de ingreso a modulo de ventas y compras",
      items: [
        { to: "/contabilidad/ventas", label: "Ventas", color: "text-pink-600" },
        { to: "/contabilidad/compras", label: "Compras", color: "text-orange-600" },

      ]
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-58px)] bg-slate-50">
      
      {/* Lado Izquierdo: Estado del Panel */}
      <div className="lg:w-1/3 p-8 flex flex-col items-center justify-center bg-white border-r border-slate-200">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 animate-bounce">
          <IoMdSettings  size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 text-center leading-tight">
          Panel General <br />
          <span className="text-indigo-600 text-lg font-bold uppercase tracking-widest">En Desarrollo</span>
        </h2>
        <p className="text-slate-400 text-center mt-4 text-sm max-w-62.5">
          Estamos en construccón. Por ahora, utiliza los accesos directos.
        </p>
      </div>

      {/* Lado Derecho: Navegación */}
      <div className="lg:w-2/3 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto grid gap-10">
          
          {secciones.map((seccion, idx) => (
            <div key={idx}>
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{seccion.titulo}</h3>
                <p className="text-slate-500 text-sm">{seccion.descripcion}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {seccion.items.map((item, index) => (
                  <Link 
                    key={index} 
                    to={item.to}
                    className="group bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100 hover:border-indigo-200 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <span className="block font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Acceder ahora →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );

}