import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { RowActions, IRowActionItem } from '@/components/data-table/row-actions';

export interface IDataTableColumnConfig<TData> {
  id: string;
  header: string;
  accessorKey?: keyof TData;
  accessorFn?: (row: TData) => any;
  cell?: (value: any, row: TData) => React.ReactNode;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: { label: string; value: string }[];
  enableSorting?: boolean;
  enableGrouping?: boolean;
  enableResizing?: boolean;
  enablePinning?: boolean;
  size?: number;
  minSize?: number;
  maxSize?: number;
  meta?: {
    className?: string;
    headerClassName?: string;
    cellClassName?: string;
  };
}

export interface IUseDataTableColumnsProps<TData> {
  columns: IDataTableColumnConfig<TData>[];
  enableRowSelection?: boolean;
  enableRowActions?: boolean;
  rowActions?: IRowActionItem<TData>[];
  onRowAction?: (action: string, row: TData) => void;
  getRowId?: (row: TData, index: number) => string;
}

export function useDataTableColumns<TData>({
  columns,
  enableRowSelection = false,
  enableRowActions = false,
  rowActions = [],
  onRowAction,
  getRowId,
}: IUseDataTableColumnsProps<TData>) {
  return useMemo<ColumnDef<TData>[]>(() => {
    const tableColumns: ColumnDef<TData>[] = [];

    // Add selection column if enabled
    if (enableRowSelection) {
      tableColumns.push({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      });
    }

    // Add data columns
    columns.forEach((column) => {
      tableColumns.push({
        id: column.id,
        accessorKey: column.accessorKey,
        accessorFn: column.accessorFn,
        header: column.header,
        cell: ({ getValue, row }) => {
          const value = getValue();
          if (column.cell) {
            return column.cell(value, row.original);
          }
          return value;
        },
        enableSorting: column.enableSorting ?? true,
        enableGrouping: column.enableGrouping ?? false,
        enableResizing: column.enableResizing ?? true,
        enablePinning: column.enablePinning ?? true,
        size: column.size ?? 150,
        minSize: column.minSize ?? 50,
        maxSize: column.maxSize ?? 500,
        meta: column.meta,
      });
    });

    // Add actions column if enabled
    if (enableRowActions && rowActions.length > 0) {
      tableColumns.push({
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => (
          <RowActions
            row={row.original}
            actions={rowActions.map(action => ({
              ...action,
              onClick: action.onClick || ((rowData) => onRowAction?.(action.action, rowData)),
            }))}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 80,
      });
    }

    return tableColumns;
  }, [columns, enableRowSelection, enableRowActions, rowActions, onRowAction]);
}