import { Select, type SelectProps } from "antd";
import { useFieldContext } from "../core/form-context";
import FieldInfo from "../core/errors";

interface OptionType {
  label: string;
  value: string | number;
}

interface ProsSelect extends Omit<SelectProps, "options"> {
  options: OptionType[];
  placeholder?: string;
  label: string;
}

export default function SelectFormFields({
  options: initialOptions,
  placeholder = "Seleccionar",
  label,
  ...props
}: ProsSelect) {
  const field = useFieldContext<string>();

  return (
    <div>
      <label className="font-semibold text-xs" htmlFor={field.name}>
        {label}
      </label>
      <Select
        {...props}
        showSearch={{
          optionFilterProp: "label",
          filterOption: (input, option) => {
            return (option?.label ?? "")
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase());
          },
        }}
        placeholder={placeholder}
        options={initialOptions}
        value={field.state.value || undefined}
        onChange={(value) => {
          field.handleChange(value);
        }}
        onBlur={field.handleBlur}
        style={{ width: "100%", ...props.style }}
      />
      <FieldInfo field={field} />
    </div>
  );
}
