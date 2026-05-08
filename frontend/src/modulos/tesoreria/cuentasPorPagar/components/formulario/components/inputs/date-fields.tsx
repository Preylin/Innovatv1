import { DatePicker } from "antd";
import FieldInfo from "../core/errors";
import dayjs from "dayjs";
import { useFieldContext } from "../core/form-context";

interface Props {
  label: string;
  placeholder?: string;
}

export default function DateField({ label, placeholder }: Props) {
  const field = useFieldContext<string>();

  return (
    <div>
      <label className="font-semibold text-xs" htmlFor={field.name}>
        {label}
      </label>
      <DatePicker
        id={field.name}
        name={field.name}
        placeholder={placeholder}
        format="DD/MM/YYYY"
        value={field.state.value ? dayjs(field.state.value) : null}
        onChange={(d) => field.handleChange(d ? d.toISOString() : "")}
        onBlur={field.handleBlur}
        style={{ width: "100%" }}
        allowClear
      />
      <FieldInfo field={field} />
    </div>
  );
}
