import { Input } from "antd";
import FieldInfo from "../core/errors";
import { useFieldContext } from "../core/form-context";

interface Props {
  label: string;
  placeholder?: string;
  maxLenght?: number;
}

export default function NumberField({ label, placeholder, maxLenght }: Props) {
  const field = useFieldContext<number>();
  return (
    <div>
      <label className="font-semibold text-xs" htmlFor={field.name}>
        {label}
      </label>
      <Input
        type="number"
        placeholder={placeholder}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => {
          const val = e.target.valueAsNumber;
          field.handleChange(Number.isNaN(val) ? 0 : val);
        }}
        onBlur={field.handleBlur}
        style={{ width: "100%" }}
        maxLength={maxLenght}
      />
      <FieldInfo field={field} />
    </div>
  );
}
