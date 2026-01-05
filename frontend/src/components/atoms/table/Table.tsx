import {
  BaseTable,
  type UITableProps,
} from "../../../ui/antd/table/TableWrapper";
import EmptyAtom from "../empty/Empty";

export interface TableAtomProps<RecordType extends object = any>
  extends UITableProps<RecordType> {
  /** Oculta paginación */
  noPagination?: boolean;
}

export function TableAtom<RecordType extends object = any>({
  noPagination = false,
  pagination,
  locale,
  size = "middle",
  ...rest
}: TableAtomProps<RecordType>) {
  return (
    <BaseTable<RecordType>
      {...rest}
      size={size}
      pagination={noPagination ? false : pagination}
      locale={{
        emptyText: <EmptyAtom />,
        ...locale,
      }}
    />
  );
}

export default TableAtom;


/* 
* props criticas:
columns	Definición de columnas
dataSource	Datos
rowKey	Clave única
loading	Estado async
pagination	Control paginación
scroll	Tablas grandes
rowSelection	Selección
onChange	Sort / filter
*/