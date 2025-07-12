import { useVirtualizer } from '@tanstack/react-virtual';
import { Table } from '@tanstack/react-table';
import { useRef } from 'react';

export interface UseDataTableVirtualizationProps {
  enabled?: boolean;
  estimateSize?: number;
  overscan?: number;
}

export function useDataTableVirtualization<TData>(
  table: Table<TData>,
  { enabled = false, estimateSize = 50, overscan = 5 }: UseDataTableVirtualizationProps = {}
) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => estimateSize,
    overscan,
    enabled,
  });

  return {
    tableContainerRef,
    rowVirtualizer,
    virtualRows: enabled ? rowVirtualizer.getVirtualItems() : null,
    totalSize: enabled ? rowVirtualizer.getTotalSize() : null,
  };
}