import React, { useRef, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Input,
  Select,
  type InputRef,
  type SelectProps,
} from "antd";
import { useFieldContext } from "../core/form-context";
import FieldInfo from "../core/errors";

interface OptionType {
  label: string;
  value: string | number;
}

interface FormSelectCreatableProps extends Omit<SelectProps, "options"> {
  options: OptionType[];
  onCreateOption?: (newValue: string) => void;
  placeholderInput?: string;
  addButtonText?: string;
  placeholder?: string;
  label: string;
  maxLength?: number; // Corregido el typo
}

export default function SelectFormWithInputFields({
  options: initialOptions,
  onCreateOption,
  placeholderInput = "Añadir nuevo item",
  addButtonText = "Añadir",
  placeholder = "Seleccionar",
  label,
  maxLength,
  ...selectProps
}: FormSelectCreatableProps) {
  const [items, setItems] = useState<OptionType[]>(initialOptions);
  const [tempName, setTempName] = useState(""); // Estado local solo para el input de creación
  const inputRef = useRef<InputRef>(null);
  
  // Obtenemos el estado del campo de TanStack Form desde tu contexto
  const field = useFieldContext<string | number>();

  React.useEffect(() => {
    setItems(initialOptions);
  }, [initialOptions]);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(event.target.value); // Solo actualiza el estado local del input
  };

  const addItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    e.preventDefault();
    if (!tempName.trim()) return;

    const newItem = { label: tempName, value: tempName };
    setItems([...items, newItem]);
    
    // Notificamos a TanStack Form que ahora este es el valor seleccionado
    field.handleChange(tempName);
    
    if (onCreateOption) onCreateOption(tempName);
    
    setTempName("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="font-semibold text-xs" htmlFor={field.name}>
        {label}
      </label>
      
      <Select
        {...selectProps}
        id={field.name}
        showSearch={{
          optionFilterProp: "label",
          filterOption: (input, option) => {
            return (option?.label ?? "")
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase());
          },
        }}
        value={field.state.value || undefined} 
        onChange={(val) => field.handleChange(val)}
        onBlur={field.handleBlur}
        
        placeholder={placeholder}
        options={items}
        style={{ width: "100%", ...selectProps.style }}
        popupRender={(menu) => (
          <>
            {menu}
            <Divider style={{ margin: "8px 0" }} />
            <div style={{ padding: "0 8px 4px", display: "flex", gap: "8px" }}>
              <Input
                placeholder={placeholderInput}
                ref={inputRef}
                value={tempName}
                onChange={onNameChange}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    // @ts-ignore
                    addItem(e);
                  }
                }}
                maxLength={maxLength}
              />
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={addItem}
                style={{ flexShrink: 0 }}
              >
                {addButtonText}
              </Button>
            </div>
          </>
        )}
      />
      <FieldInfo field={field} />
    </div>
  );
}