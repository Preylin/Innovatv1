import { Button, Flex, Select, Space } from "antd";
import { useMemo } from "react";

export interface DependentOption {
  value: string;
  label: string;
  children: Array<{
    value: string;
    label: string;
  }>;
}

interface DependentSelectProps {
  data: DependentOption[];
  parentValue?: string;
  childValue?: string;
  onParentChange: (value: string) => void;
  onChildChange: (value: string) => void;
  // Añadimos props de blur para control de validación
  onParentBlur?: () => void;
  onChildBlur?: () => void;
  parentPlaceholder?: string;
  childPlaceholder?: string;
  disabled?: boolean;
  handleOpenParent?: () => void;
  handleOpenChild?: () => void;
  ButtonNameParent?: string;
  ButtonNameChild?: string;
}

export function DependentSelectOther({
  data,
  parentValue,
  childValue,
  onParentChange,
  onChildChange,
  onParentBlur,
  onChildBlur,
  parentPlaceholder = "Seleccione",
  childPlaceholder = "Seleccione",
  disabled = false,
  handleOpenParent,
  handleOpenChild,
  ButtonNameParent = "",
  ButtonNameChild = "",
}: DependentSelectProps) {
  const parentOptions = useMemo(
    () => data.map((item) => ({ label: item.label, value: item.label })),
    [data]
  );

  const childOptions = useMemo(() => {
    if (!parentValue) return [];
    return (
      data
        .find((item) => item.label === parentValue)
        ?.children.map((c) => ({
          label: c.label,
          value: c.label,
        })) ?? []
    );
  }, [data, parentValue]);

  return (
    <Space wrap>
      <Select
        style={{ width: 250 }}
        value={parentValue || undefined}
        placeholder={parentPlaceholder}
        options={parentOptions}
        onChange={onParentChange}
        onBlur={onParentBlur} // Importante
        disabled={disabled}
        popupRender={(menu) => (
          <>
            {menu}
            <Flex wrap justify="end" align="center">
              <Button type="primary" onClick={handleOpenParent} >{ButtonNameParent}</Button>
            </Flex>
          </>
        )}
      />

      <Select
        style={{ minWidth: 300 }}
        value={childValue || undefined}
        placeholder={childPlaceholder}
        options={childOptions}
        onChange={onChildChange}
        onBlur={onChildBlur} // Importante
        disabled={!parentValue || disabled}
        popupRender={(menu) => (
          <>
            {menu}
            <Flex wrap justify="end" align="center">
              <Button type="primary" onClick={handleOpenChild}>{ButtonNameChild}</Button>
            </Flex>
          </>
        )}
      />
    </Space>
  );
}
