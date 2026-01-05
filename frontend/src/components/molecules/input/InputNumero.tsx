import { Input } from "antd";

interface NumericInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
  placeholder?: string;
}

export function NumericInput({
  value,
  onChange,
  onBlur,
  minLength,
  maxLength = 11,
  disabled,
  placeholder,
}: NumericInputProps) {
  return (
    <Input
      value={value}
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={maxLength}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => {
        const next = e.target.value;

        // solo dígitos
        if (!/^\d*$/.test(next)) return;

        // límite máximo de longitud
        if (maxLength && next.length > maxLength) return;

        onChange(next);
      }}
      onBlur={() => {
        // validación mínima al salir
        if (
          minLength !== undefined &&
          value.length > 0 &&
          value.length < minLength
        ) {
          return;
        }
        onBlur?.();
      }}
    />
  );
}
