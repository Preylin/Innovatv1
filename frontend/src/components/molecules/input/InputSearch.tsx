import { Select } from "antd";

interface InputSearchProps {
  value?: string | number;
  options: {
    value: string | number;
    label: string;
  }[];
  onChange?: (value: string | number | undefined) => void;
  onBlur?: () => void;
  placeholder: string;
}

function InputSearch({
  options,
  placeholder,
  value,
  onChange,
  onBlur,
}: InputSearchProps) {
  return (
    <Select
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      allowClear
      showSearch={{
        filterOption: (input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
      }}
      style={{ width: "100%" }}
      options={options}
    />
  );
}

export default InputSearch;
