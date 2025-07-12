import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ColumnDef,
  PaginationState,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  GroupingState,
  ExpandedState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  Updater,
} from '@tanstack/react-table';

export interface IUseDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  
  // Server-side support
  pageCount?: number;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  
  // Event handlers for server-side operations
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  onGlobalFilterChange?: (filter: string) => void;
  
  // Row selection
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  getRowId?: (row: TData, index: number) => string;
  
  // State persistence
  enableStatePersistence?: boolean;
  storageKey?: string;
  
  // Initial state
  initialState?: {
    pagination?: PaginationState;
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
    rowSelection?: RowSelectionState;
    grouping?: GroupingState;
    expanded?: ExpandedState;
  };
}

export interface IDataTableState {
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  grouping: GroupingState;
  expanded: ExpandedState;
  globalFilter: string;
}

const defaultInitialState: IDataTableState = {
  pagination: { pageIndex: 0, pageSize: 10 },
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
  rowSelection: {},
  grouping: [],
  expanded: {},
  globalFilter: '',
};

export function useDataTable<TData>({
  data,
  columns,
  pageCount,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  onGlobalFilterChange,
  enableRowSelection = false,
  enableMultiRowSelection = true,
  onRowSelectionChange,
  getRowId,
  enableStatePersistence = true,
  storageKey = 'data-table-state',
  initialState = {},
}: IUseDataTableProps<TData>) {
  // Load initial state from localStorage if persistence is enabled
  const [state, setState] = useState<IDataTableState>(() => {
    if (enableStatePersistence) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedState = JSON.parse(saved);
          return { ...defaultInitialState, ...parsedState, ...initialState };
        }
      } catch (error) {
        console.warn('Failed to load table state from localStorage:', error);
      }
    }
    return { ...defaultInitialState, ...initialState };
  });

  // Persist state to localStorage
  useEffect(() => {
    if (enableStatePersistence) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.warn('Failed to save table state to localStorage:', error);
      }
    }
  }, [state, enableStatePersistence, storageKey]);

  // State update handlers
  const handlePaginationChange = useCallback((updater: Updater<PaginationState>) => {
    const newPagination = typeof updater === 'function' ? updater(state.pagination) : updater;
    setState(prev => ({ ...prev, pagination: newPagination }));
    onPaginationChange?.(newPagination);
  }, [state.pagination, onPaginationChange]);

  const handleSortingChange = useCallback((updater: Updater<SortingState>) => {
    const newSorting = typeof updater === 'function' ? updater(state.sorting) : updater;
    setState(prev => ({ ...prev, sorting: newSorting }));
    onSortingChange?.(newSorting);
  }, [state.sorting, onSortingChange]);

  const handleColumnFiltersChange = useCallback((updater: Updater<ColumnFiltersState>) => {
    const newFilters = typeof updater === 'function' ? updater(state.columnFilters) : updater;
    setState(prev => ({ ...prev, columnFilters: newFilters }));
    onColumnFiltersChange?.(newFilters);
  }, [state.columnFilters, onColumnFiltersChange]);

  const handleGlobalFilterChange = useCallback((filter: string) => {
    setState(prev => ({ ...prev, globalFilter: filter }));
    onGlobalFilterChange?.(filter);
  }, [onGlobalFilterChange]);

  const handleRowSelectionChange = useCallback((updater: Updater<RowSelectionState>) => {
    const newSelection = typeof updater === 'function' ? updater(state.rowSelection) : updater;
    setState(prev => ({ ...prev, rowSelection: newSelection }));
    onRowSelectionChange?.(newSelection);
  }, [state.rowSelection, onRowSelectionChange]);

  const handleColumnVisibilityChange = useCallback((updater: Updater<VisibilityState>) => {
    const newVisibility = typeof updater === 'function' ? updater(state.columnVisibility) : updater;
    setState(prev => ({ ...prev, columnVisibility: newVisibility }));
  }, [state.columnVisibility]);

  const handleGroupingChange = useCallback((updater: Updater<GroupingState>) => {
    const newGrouping = typeof updater === 'function' ? updater(state.grouping) : updater;
    setState(prev => ({ ...prev, grouping: newGrouping }));
  }, [state.grouping]);

  const handleExpandedChange = useCallback((updater: Updater<ExpandedState>) => {
    const newExpanded = typeof updater === 'function' ? updater(state.expanded) : updater;
    setState(prev => ({ ...prev, expanded: newExpanded }));
  }, [state.expanded]);

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    pageCount,
    manualPagination,
    manualSorting,
    manualFiltering,
    getRowId,
    state: {
      pagination: state.pagination,
      sorting: state.sorting,
      columnFilters: state.columnFilters,
      columnVisibility: state.columnVisibility,
      rowSelection: state.rowSelection,
      grouping: state.grouping,
      expanded: state.expanded,
      globalFilter: state.globalFilter,
    },
    enableRowSelection,
    enableMultiRowSelection,
    enableColumnResizing: true,
    enableColumnPinning: true,
    enableGrouping: true,
    enableExpanding: true,
    columnResizeMode: 'onChange',
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onRowSelectionChange: handleRowSelectionChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onGroupingChange: handleGroupingChange,
    onExpandedChange: handleExpandedChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  // Reset table state
  const resetTable = useCallback(() => {
    setState(defaultInitialState);
  }, []);

  // Get selected rows data
  const selectedRows = useMemo(() => {
    return table.getSelectedRowModel().rows.map(row => row.original);
  }, [table]);

  return {
    table,
    state,
    selectedRows,
    resetTable,
    // Expose individual state setters for advanced use cases
    setPagination: (pagination: PaginationState) => setState(prev => ({ ...prev, pagination })),
    setSorting: (sorting: SortingState) => setState(prev => ({ ...prev, sorting })),
    setColumnFilters: (filters: ColumnFiltersState) => setState(prev => ({ ...prev, columnFilters: filters })),
    setGlobalFilter: (filter: string) => setState(prev => ({ ...prev, globalFilter: filter })),
    setRowSelection: (selection: RowSelectionState) => setState(prev => ({ ...prev, rowSelection: selection })),
  };
}