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
  const meta = field.state.meta;
  
  const hasErrors = meta.errors.length > 0 || !!meta.errorMap?.onSubmit;
  const isInvalid = meta.isTouched && hasErrors;

  return (
    <div className="flex flex-col w-full gap-1">
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
        status={isInvalid ? "error" : undefined} 
      />
      <FieldInfo field={field} />
    </div>
  );
}