
import { Table as AntdTable } from "antd";
import type { TableProps as AntdTableProps } from "antd";

export type UITableProps<RecordType extends object = any> =
  AntdTableProps<RecordType>;

export function BaseTable<RecordType extends object = any>(
  props: UITableProps<RecordType>
) {
  return <AntdTable {...props} />;
}

export default BaseTable;
