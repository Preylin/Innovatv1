"use client";

import * as React from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "#components/ui/input";
import { ChevronDown, X } from "lucide-react";
import { cn } from "#lib/utils";

export type ComboboxOption = {
  value: string; // ID mapeado a string
  label: string; // Texto legible
};

interface CustomComboboxProps {
  items: ComboboxOption[];
  // Modificado: Ahora acepta el ID plano del formulario (string, number, null o undefined)
  value: string | number | null | undefined;
  // Modificado: Devuelve el valor primitivo seleccionado (o null si se limpia)
  onValueChange: (value: string | null) => void;
  onBlur?: () => void; // Integración nativa con handleBlur de TanStack Form
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
}

export function CustomComboboxForm({
  items,
  value,
  onValueChange,
  onBlur,
  placeholder = "Seleccionar...",
  emptyText = "No se encontraron resultados.",
  disabled = false,
}: CustomComboboxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Encontrar el objeto ComboboxOption real basado en el "value" primitivo recibido
  const selectedOption = useMemo(() => {
    if (value === undefined || value === null) return null;
    return items.find((item) => item.value === String(value)) || null;
  }, [items, value]);

  // Sincroniza el input cuando cambia la opción seleccionada
  useEffect(() => {
    setQuery(selectedOption ? selectedOption.label : "");
  }, [selectedOption]);

  // Filtrado de ítems en tiempo real
  const filteredItems = useMemo(() => {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm || (selectedOption && selectedOption.label === query)) return items;

    return items.filter((item) =>
      item.label.toLowerCase().includes(searchTerm)
    );
  }, [items, query, selectedOption]);

  // Manejo de clic exterior para cerrar y restaurar texto original si no seleccionó nada nuevo
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery(selectedOption ? selectedOption.label : "");
        // Disparar el evento Blur para que TanStack Form marque el campo como 'touched'
        if (onBlur) onBlur(); 
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedOption, onBlur]);

  const handleSelect = (item: ComboboxOption) => {
    onValueChange(item.value); // Devuelve el string ID
    setQuery(item.label);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(null);
    setQuery("");
    setIsOpen(false);
    if (onBlur) onBlur();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Input
          type="text"
          autoComplete="off"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pr-9 bg-background focus-visible:ring-1"
          placeholder={placeholder}
        />
        
        <div className="absolute right-2.5 flex items-center gap-1 text-muted-foreground">
          {selectedOption && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-sm hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200 pointer-events-none",
              isOpen && "transform rotate-180"
            )} />
          )}
        </div>
      </div>

      {isOpen && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-60 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 duration-100">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const isSelected = selectedOption?.value === item.value;
              return (
                <li
                  key={item.value}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "relative flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground transition-colors",
                    isSelected && "bg-accent/60 font-medium text-accent-foreground"
                  )}
                >
                  <span className="truncate">{item.label}</span>
                </li>
              );
            })
          ) : (
            <li className="px-2 py-4 text-center text-xs text-muted-foreground italic">
              {emptyText}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}