import { useState } from 'react';
import { TreeDataGrid, type Column } from 'react-data-grid';

interface Row {
  id: number;
  country: string;
  city: string;
  name: string;
  sales: number;
}

const columns: Column<Row>[] = [
  { key: 'country', name: 'Country' },
  { key: 'city', name: 'City' },
  { key: 'name', name: 'Name' },
  { key: 'sales', name: 'Sales' }
];

const rows: Row[] = [
  { id: 1, country: 'USA', city: 'New York', name: 'John', sales: 1000 },
  { id: 2, country: 'USA', city: 'New York', name: 'Jane', sales: 1500 },
  { id: 3, country: 'USA', city: 'Los Angeles', name: 'Bob', sales: 2000 },
  { id: 4, country: 'Canada', city: 'Toronto', name: 'Alice', sales: 1200 },
];

function rowGrouper(rows: readonly Row[], columnKey: string) {
  const groups: Record<string, Row[]> = {};
  for (const row of rows) {
    const key = String(row[columnKey as keyof Row]);
    if (groups[key]) {
      groups[key].push(row);
    } else {
      groups[key] = [row];
    }
  }
  return groups;
}

function MyTreeGrid() {
  const [expandedGroupIds, setExpandedGroupIds] = useState<ReadonlySet<unknown>>(new Set());
  
  return (
    <TreeDataGrid
      columns={columns}
      rows={rows}
      rowKeyGetter={(row) => row.id}
      groupBy={['country', 'city']}
      rowGrouper={rowGrouper}
      expandedGroupIds={expandedGroupIds}
      onExpandedGroupIdsChange={setExpandedGroupIds}
    />
  );
}

export default MyTreeGrid;