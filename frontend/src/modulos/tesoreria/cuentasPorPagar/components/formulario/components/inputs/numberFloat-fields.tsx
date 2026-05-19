import { InputNumber } from "antd";
import FieldInfo from "../core/errors";
import { useFieldContext } from "../core/form-context";

interface Props {
  label: string;
  placeholder?: string;
  maxLength?: number;
}

export default function NumberFloatField({ label, placeholder, maxLength }: Props) {
  const field = useFieldContext<number>();

  return (
    <div>
      <label className="font-semibold text-xs" htmlFor={field.name}>
        {label}
      </label>
      <InputNumber
        id={field.name}
        name={field.name}
        placeholder={placeholder}
        value={field.state.value}
        maxLength={maxLength}
        style={{ width: "100%" }}
        precision={2} 
        stringMode
        onChange={(val) => {
          const numValue = val ? parseFloat(val as unknown as string) : 0;
          field.handleChange(Number.isNaN(numValue) ? 0 : numValue);
        }}
        onBlur={field.handleBlur}
      />
      <FieldInfo field={field} />
    </div>
  );
}