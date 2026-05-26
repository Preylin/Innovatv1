import { InputNumber, type InputNumberProps } from "antd";
import FieldInfo from "../core/errors";
import { useFieldContext } from "../core/form-context";

// Extendemos de InputNumberProps para que tu componente sea elástico
interface Props extends Omit<InputNumberProps<number>, "onChange" | "value"> {
  label: string;
  placeholder?: string;
  max?: number;
}

export default function NumberFloatField({ label, placeholder, max, ...rest }: Props) {
  const field = useFieldContext<number>();

  const handleChange = (value: number | null) => {
    const newValue = value ?? 0; 
    field.handleChange(newValue);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="font-semibold text-xs" htmlFor={field.name}>
        {label}
      </label>
      <InputNumber<number>
        id={field.name}
        name={field.name}
        placeholder={placeholder}
        value={field.state.value}
        style={{ width: "100%" }}
        precision={2}
        min={0}
        max={max}
        onChange={handleChange}
        onBlur={field.handleBlur}
        {...rest}
      />
      <FieldInfo field={field} />
    </div>
  );
}