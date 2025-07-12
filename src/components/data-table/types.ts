import { RowActionItem } from './row-actions';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => any;
  cell?: (value: any, row: T) => React.ReactNode;
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

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  
  // Server-side support
  pageCount?: number;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  
  // Row selection
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  getRowId?: (row: T, index: number) => string;
  
  // Row actions
  enableRowActions?: boolean;
  rowActions?: RowActionItem<T>[];
  onRowAction?: (action: string, row: T) => void;
  
  // UI Configuration
  className?: string;
  showGlobalFilter?: boolean;
  showColumnFilters?: boolean;
  showPagination?: boolean;
  showExport?: boolean;
  showReset?: boolean;
  
  // State persistence
  enableStatePersistence?: boolean;
  storageKey?: string;
  
  // Virtualization
  enableVirtualization?: boolean;
  estimateSize?: number;
  overscan?: number;
  
  // Custom components
  toolbar?: React.ReactNode;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  
  // Loading state
  isLoading?: boolean;
  
  // Event handlers
  onSelectionChange?: (selectedRows: T[]) => void;
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  onSortingChange?: (sorting: { id: string; desc: boolean }[]) => void;
  onFilterChange?: (filters: { id: string; value: any }[]) => void;
  onGlobalFilterChange?: (filter: string) => void;
  
  // Row configuration
  getRowProps?: (row: T) => {
    className?: string;
    onClick?: () => void;
    [key: string]: any;
  };
}