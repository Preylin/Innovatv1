import { Input } from "antd";
import FieldInfo from "../core/errors";
import { useFieldContext } from "../core/form-context";
const { TextArea } = Input;

interface Props {
  label: string;
  placeholder?: string;
  maxLenght?: number;
  height?: string;
}

export default function TextAreaField({ label, placeholder, maxLenght, height="32px" }: Props) {
  const field = useFieldContext<string>();
  return (
    <div>
      <label className="font-semibold text-xs" htmlFor={field.name}>
        {label}
      </label>
      <TextArea
      className="bg-amber-50"
        placeholder={placeholder}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        style={{ width: "100%", height: `${height}`}}
        maxLength={maxLenght}
        allowClear
      />
      <FieldInfo field={field} />
    </div>
  );
}
