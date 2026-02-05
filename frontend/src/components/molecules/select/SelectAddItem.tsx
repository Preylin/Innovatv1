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

interface OptionType {
  label: string;
  value: string | number;
}

interface FormSelectCreatableProps extends Omit<SelectProps, "options"> {
  options: OptionType[];
  onCreateOption?: (newValue: string) => void; // Callback para persistir el nuevo item
  placeholderInput?: string;
  addButtonText?: string;
  placeholder?: string;
}


const FormSelectCreatable: React.FC<FormSelectCreatableProps> = ({
  options: initialOptions,
  onCreateOption,
  placeholderInput = "Añadir nuevo item",
  addButtonText = "Añadir",
  placeholder = "Seleccionar",
  ...selectProps
}) => {
  const [items, setItems] = useState<OptionType[]>(initialOptions);
  const [name, setName] = useState("");
  const inputRef = useRef<InputRef>(null);

  React.useEffect(() => {
    setItems(initialOptions);
  }, [initialOptions]);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const addItem = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newItem = { label: name, value: name }; // Usar el nombre original como value suele ser mejor
    setItems([...items, newItem]);
    if (onCreateOption) onCreateOption(name);
    setName("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <Select
      {...selectProps}
      value={selectProps.value === "" ? undefined : selectProps.value}
      placeholder={placeholder}
      options={items}
      style={{ width: '100%', ...selectProps.style }}
      popupRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: "8px 0" }} />
          <div style={{ padding: "0 8px 4px", display: 'flex', gap: '8px' }}>
            <Input
              placeholder={placeholderInput}
              ref={inputRef}
              value={name}
              onChange={onNameChange}
              onKeyDown={(e) => e.stopPropagation()}
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
  );
};

export default FormSelectCreatable;
