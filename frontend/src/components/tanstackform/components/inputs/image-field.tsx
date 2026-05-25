import { type ChangeEvent, type DragEvent, useState, useRef } from "react";
import { AiOutlineInbox } from "react-icons/ai";
import { IoCloseCircle } from "react-icons/io5"; // Un icono de cerrar más profesional
import FieldInfo from "../core/errors";
import { useFieldContext } from "../core/form-context";

interface Props {
  label: string;
  maxSizeMB?: number;
}

export default function ImageField({ label, maxSizeMB = 20 }: Props) {
  const field = useFieldContext<any>();
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const allowedExtensions = ["image/jpeg", "image/png", "image/webp"];

  const validateAndProcessFile = (file: File) => {
    const isAllowedType = allowedExtensions.includes(file.type);
    if (!isAllowedType) {
      alert("Solo puedes subir archivos JPG, PNG o WEBP.");
      return;
    }

    const isLtSize = file.size / 1024 / 1024 < maxSizeMB;
    if (!isLtSize) {
      alert(`La imagen debe ser menor a ${maxSizeMB}MB.`);
      return;
    }

    field.handleChange(file);

    if (typeof field.handleBlur === "function") {
      field.handleBlur();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Función dedicada a limpiar el campo de forma segura
  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Evita que el click se propague al contenedor drag & drop

    field.handleChange(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Resetea el elemento del DOM
    }
  };

  const fileName =
    field.state.value instanceof File
      ? field.state.value.name
      : field.state.value
        ? "imagen_seleccionada.png"
        : null;

  return (
    <div className="flex flex-col gap-1.5 w-45 relative">
      <label
        className="font-semibold text-xs text-slate-700 dark:text-zinc-300"
        htmlFor={field.name}
      >
        {label}
      </label>

      {/* Botón de limpiar posicionado en la esquina superior derecha del área de carga */}
      {fileName && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-7 right-2 z-20 p-0.5 text-slate-400 hover:text-red-500 rounded-full bg-white dark:bg-zinc-900 shadow-sm transition-colors cursor-pointer"
          title="Eliminar imagen"
        >
          <IoCloseCircle size={18} />
        </button>
      )}

      {/* Contenedor Drag and Drop */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col justify-center items-center p-2 text-center rounded-lg border-2 border-dashed transition-colors duration-200 h-full
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/10"
              : "border-slate-200 hover:border-blue-500 bg-slate-50 dark:bg-zinc-900/50"
          }`}
      >
        {/* Input Oculto - Deshabilitado temporalmente si hay archivo para no estorbar clics */}
        <input
          ref={fileInputRef}
          type="file"
          id={field.name}
          name={field.name}
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleChange}
          disabled={!!fileName} // Si ya hay archivo, el input no se activa por encima
          className={`absolute inset-0 w-full h-full opacity-0 z-10 ${fileName ? "pointer-events-none" : "cursor-pointer"}`}
        />

        {/* Contenido Visual */}
        <div className="flex flex-col justify-center items-center pointer-events-none select-none">
          {fileName ? (
            <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 max-w-35 truncate">
              <img
              className="w-18 h-12 object-cover rounded-md"
                src={URL.createObjectURL(field.state.value)}
                alt="Imagen Seleccionada"
              />
              {fileName}
            </p>
          ) : (
            <>
              <p className={fileName ? "text-blue-500" : "text-slate-400"}>
                <AiOutlineInbox fontSize={30} />
              </p>
              <p className="text-[8px] font-medium text-slate-700 dark:text-zinc-300 mt-1">
                Haz clic o arrastra una imagen aquí
              </p>
              <p className="text-[8px] text-slate-400">
                Soporta JPG, PNG o WEBP (Máx. {maxSizeMB}MB)
              </p>
            </>
          )}
        </div>
      </div>

      <FieldInfo field={field} />
    </div>
  );
}
