import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Row } from "antd";
import React from "react";

interface DynamicArrayFieldProps<TItem> {
  label?: string;
  value: TItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (index: number) => React.ReactNode;
  addLabel?: string;
}

export function DynamicArrayField<TItem>({
  value,
  onAdd,
  onRemove,
  renderItem,
  addLabel = "Add",
}: DynamicArrayFieldProps<TItem>) {
  return (
    <Row gutter={8}>
      <Col span={19}>
        {value.map((_, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
            }}
          >
            <div style={{ flex: 1 }}>{renderItem(index)}</div>

            <MinusCircleOutlined
              onClick={() => onRemove(index)}
              style={{
                cursor: "pointer",
                fontSize: 16,
                color: "#ff4d4f",
                marginBottom: 6,
              }}
            />
          </div>
        ))}
      </Col>

      <Col span={5}>
        <Button type="dashed" block icon={<PlusOutlined />} onClick={onAdd}>
          {addLabel}
        </Button>
      </Col>
    </Row>
  );
}
