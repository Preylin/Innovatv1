  import { Select, type SelectProps } from "antd";
  import { useFieldContext } from "../core/form-context";
  import FieldInfo from "../core/errors";

  interface OptionType {
    label: string | React.ReactNode;
    value: string | number;
  }

  interface ProsSelect extends Omit<SelectProps, "options"> {
    options: OptionType[];
    placeholder?: string;
    label: string;
    modeSelect?: SelectProps["mode"];
  }

  export default function SelectFormFields({
    options: initialOptions,
    placeholder = "Seleccionar",
    label,
    modeSelect = undefined,
    ...props
  }: ProsSelect) {
    const field = useFieldContext<string | string[]>();

    return (
      <div>
        <label className="font-semibold text-xs" htmlFor={field.name}>
          {label}
        </label>
        <Select
          {...props}
          mode={modeSelect}
          id={field.name}
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
