import { Input, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

export type SearchOption = {
  label: string;
  value: string;
};

type SearchBarProps = {
  options: SearchOption[];
  onSearch: (params: { field: string; value: string }) => void;
  defaultField?: string;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
};

export function SearchBar({
  options,
  onSearch,
  defaultField,
  placeholder = "Buscar...",
  debounceMs = 400,
  disabled = false,
}: SearchBarProps) {
  // 1. Inicializamos el campo basándonos en defaultField o la primera opción disponible
  const [field, setField] = useState<string>(() => {
    return defaultField ?? options[0]?.value ?? "";
  });
  
  const [value, setValue] = useState("");

  // 2. Usamos useEffect para el debounce
  useEffect(() => {
    // Evitamos ejecutar si no hay campo definido
    if (!field) return;

    const timer = setTimeout(() => {
      onSearch({ field, value });
    }, debounceMs);

    return () => clearTimeout(timer);
    // onSearch debe estar en las dependencias, asegúrate de que el padre 
    // la pase envuelta en useCallback o que sea estable.
  }, [field, value, debounceMs, onSearch]);

  return (
    <Space.Compact style={{ width: "100%" }}>
      <Select
        value={field}
        onChange={(val) => setField(val)}
        options={options}
        style={{ width: 120, background: "#0891b2"}}
        disabled={disabled}
        placeholder="Campo"
      />
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
    </Space.Compact>
  );
}