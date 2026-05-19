import { useEffect, useState } from "react";
import FieldInfo from "../core/errors";
import { useFieldContext } from "../core/form-context";

interface Props {
  label: string;
  placeholder?: string;
  // Fuente exterior: puede ser una URL de API o un array de strings directo
  externalSource: string | string[]; 
}

export default function SearchField({ label, placeholder, externalSource }: Props) {
  const field = useFieldContext<string>();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Simulamos la carga desde la fuente exterior si es una URL, o la asignamos si es un array
  useEffect(() => {
    if (Array.isArray(externalSource)) {
      setSuggestions(externalSource);
    } else if (typeof externalSource === "string") {
      // Si es una URL externa, hacemos el fetch
      fetch(externalSource)
        .then((res) => res.json())
        .then((data) => {
          // Asumiendo que la API devuelve un array de strings (ej: ["opcion1", "opcion2"])
          setSuggestions(data);
        })
        .catch((err) => console.error("Error cargando sugerencias externas:", err));
    }
  }, [externalSource]);

  // Generamos un ID único para vincular el input con su lista de opciones
  const datalistId = `list-${field.name}`;

  return (
    <div className="flex flex-col gap-1 w-full relative">
      {/* Label estilizado con Tailwind */}
      <label className="font-semibold text-xs text-gray-700" htmlFor={field.name}>
        {label}
      </label>

      {/* Input puro estilizado con Tailwind imitando una barra de búsqueda limpia */}
      <input
        id={field.name}
        name={field.name}
        type="text"
        placeholder={placeholder}
        value={field.state.value || ""}
        list={datalistId} // Vinculación clave al datalist
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        className="w-full px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-full 
                   shadow-sm transition-all duration-200 outline-none
                   placeholder-gray-400
                   hover:border-gray-400 
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:shadow-md"
      />

      {/* El Datalist nativo de HTML que contiene las alternativas externas */}
      <datalist id={datalistId}>
        {suggestions.map((option, index) => (
          <option key={`${option}-${index}`} value={option} />
        ))}
      </datalist>

      <FieldInfo field={field} />
    </div>
  );
}