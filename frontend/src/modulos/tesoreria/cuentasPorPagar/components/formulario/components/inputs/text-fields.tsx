import { Input } from "antd";
import FieldInfo from "../core/errors";
import { useFieldContext } from "../core/form-context";

interface Props {
  label: string;
  placeholder?: string;
  maxLenght?: number;
}

export default function TextField({ label, placeholder, maxLenght }: Props) {
  const field = useFieldContext<string>();
  return (
    <div>
      <label className="font-semibold text-xs" htmlFor={field.name}>
        {label}
      </label>
      <Input
      className="bg-amber-50"
        type="text"
        placeholder={placeholder}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        style={{ width: "100%" }}
        maxLength={maxLenght}
        allowClear
      />
      <FieldInfo field={field} />
    </div>
  );
}
