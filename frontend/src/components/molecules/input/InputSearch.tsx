import { Button, Flex, Select } from "antd";

interface InputSearchProps {
  value?: string | number;
  options: {
    value: string | number;
    label: string;
  }[];
  onChange?: (value: string | number | undefined) => void;
  onBlur?: () => void;
  placeholder: string;
  handleOpen?: () => void;
  ButtonName?: string;
}

function InputSearch({
  options,
  placeholder,
  value,
  onChange,
  onBlur,
  handleOpen,
  ButtonName = "",
}: InputSearchProps) {
  return (
    <Select
      placeholder={placeholder}
      value={value === "" ? undefined : value}
      onChange={onChange}
      onBlur={onBlur}
      allowClear
      showSearch={{
        filterOption: (input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
      }}
      style={{ width: "100%" }}
      options={options}
      popupRender={(menu) => (
        <>
          {menu}
          <Flex wrap justify="end" align="center">
            <Button type="primary" onClick={handleOpen}>{ButtonName}</Button>
          </Flex>
        </>
      )}
    />
  );
}

export default InputSearch;
