import React from 'react';
import { flexRender } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  File,
} from 'lucide-react';
import { useDataTable, IUseDataTableProps } from '@/hooks/use-data-table';
import { useDataTableColumns, IUseDataTableColumnsProps, IDataTableColumnConfig } from '@/hooks/use-data-table-columns';
import { useDataTableVirtualization, IUseDataTableVirtualizationProps } from '@/hooks/use-data-table-virtualization';
import { useDataTableExport } from '@/hooks/use-data-table-export';
import { ColumnHeader } from './column-header';
import { ColumnFilter } from './column-filter';

export interface IEnhancedDataTableProps<TData> 
  extends Omit<IUseDataTableProps<TData>, 'columns'>,
    Omit<IUseDataTableColumnsProps<TData>, 'columns'>,
    IUseDataTableVirtualizationProps {
  columns: IDataTableColumnConfig<TData>[];
  
  // UI Configuration
  className?: string;
  showGlobalFilter?: boolean;
  showColumnFilters?: boolean;
  showPagination?: boolean;
  showExport?: boolean;
  showReset?: boolean;
  showRowCount?: boolean;
  
  // Export configuration
  exportFilename?: string;
  
  // Custom components
  toolbar?: React.ReactNode;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  
  // Loading state
  isLoading?: boolean;
  
  // Row configuration
  getRowProps?: (row: TData) => {
    className?: string;
    onClick?: () => void;
    [key: string]: any;
  };
}

export function EnhancedDataTable<TData>({
  // Data and columns
  data,
  columns,
  
  // Server-side props
  pageCount,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  onGlobalFilterChange,
  
  // Row selection
  enableRowSelection = false,
  enableMultiRowSelection = true,
  onRowSelectionChange,
  getRowId,
  
  // Row actions
  enableRowActions = false,
  rowActions = [],
  onRowAction,
  
  // State persistence
  enableStatePersistence = true,
  storageKey = 'enhanced-data-table',
  initialState,
  
  // Virtualization
  enabled: virtualizationEnabled = false,
  estimateSize = 50,
  overscan = 5,
  
  // UI Configuration
  className,
  showGlobalFilter = true,
  showColumnFilters = true,
  showPagination = true,
  showExport = false,
  showReset = true,
  showRowCount = true,
  
  // Export
  exportFilename = 'data-export',
  
  // Custom components
  toolbar,
  emptyState,
  loadingState,
  
  // Loading state
  isLoading = false,
  
  // Row configuration
  getRowProps,
}: IEnhancedDataTableProps<TData>) {
  
  // Generate table columns with selection and actions
  const tableColumns = useDataTableColumns({
    columns,
    enableRowSelection,
    enableRowActions,
    rowActions,
    onRowAction,
    getRowId,
  });

  // Initialize table with hooks
  const {
    table,
    state,
    selectedRows,
    resetTable,
    setGlobalFilter,
  } = useDataTable({
    data,
    columns: tableColumns,
    pageCount,
    manualPagination,
    manualSorting,
    manualFiltering,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    enableRowSelection,
    enableMultiRowSelection,
    onRowSelectionChange,
    getRowId,
    enableStatePersistence,
    storageKey,
    initialState,
  });

  // Virtualization
  const { tableContainerRef, rowVirtualizer, virtualRows, totalSize } = useDataTableVirtualization(
    table,
    { enabled: virtualizationEnabled, estimateSize, overscan }
  );

  // Export functionality
  const { exportToExcel, exportToPDF, exportToCSV } = useDataTableExport({
    table,
    filename: exportFilename,
  });

  const rows = virtualRows || table.getRowModel().rows;
  const selectedCount = selectedRows.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Global Filter */}
          {showGlobalFilter && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar em todas as colunas..."
                value={state.globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          )}
          
          {/* Reset Button */}
          {showReset && (
            <Button variant="outline" size="sm" onClick={resetTable}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
          )}
          
          {/* Selection Info */}
          {enableRowSelection && selectedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-md">
              <span className="text-sm font-medium">
                {selectedCount} linha{selectedCount !== 1 ? 's' : ''} selecionada{selectedCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Custom Toolbar */}
          {toolbar}
          
          {/* Export Buttons */}
          {showExport && (
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <File className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div
          ref={tableContainerRef}
          className={cn(
            "overflow-auto",
            virtualizationEnabled && "max-h-[600px]"
          )}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "sticky top-0 bg-background",
                        header.column.columnDef.meta?.headerClassName
                      )}
                      style={{ width: header.getSize() }}
                    >
                      <div className="space-y-2">
                        {header.isPlaceholder ? null : (
                          <ColumnHeader
                            column={header.column}
                            title={typeof header.column.columnDef.header === 'string' 
                              ? header.column.columnDef.header 
                              : header.id
                            }
                          />
                        )}
                        
                        {showColumnFilters && header.column.getCanFilter() && (
                          <ColumnFilter column={header.column} />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                    {loadingState || "Carregando..."}
                  </TableCell>
                </TableRow>
              ) : virtualizationEnabled && virtualRows ? (
                <>
                  {/* Virtual spacer before */}
                  {rowVirtualizer.getVirtualItems()[0]?.start > 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={table.getAllColumns().length}
                        style={{ height: rowVirtualizer.getVirtualItems()[0]?.start }}
                      />
                    </TableRow>
                  )}
                  
                  {/* Virtual rows */}
                  {virtualRows.map((virtualRow) => {
                    const row = table.getRowModel().rows[virtualRow.index];
                    const rowProps = getRowProps?.(row.original) || {};
                    
                    return (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={cn(rowProps.className)}
                        onClick={rowProps.onClick}
                        style={{ height: virtualRow.size }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cn(cell.column.columnDef.meta?.cellClassName)}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                  
                  {/* Virtual spacer after */}
                  {(() => {
                    const lastItem = rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1];
                    const end = lastItem ? lastItem.end : 0;
                    const remaining = (totalSize || 0) - end;
                    
                    return remaining > 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={table.getAllColumns().length}
                          style={{ height: remaining }}
                        />
                      </TableRow>
                    ) : null;
                  })()}
                </>
              ) : rows.length ? (
                rows.map((row) => {
                  const rowProps = getRowProps?.(row.original) || {};
                  
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(rowProps.className)}
                      onClick={rowProps.onClick}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(cell.column.columnDef.meta?.cellClassName)}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                    {emptyState || "Nenhum resultado encontrado."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showRowCount && (
              <div className="text-sm text-muted-foreground">
                Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} até{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{' '}
                de {table.getFilteredRowModel().rows.length} registros
              </div>
            )}
            
            {enableRowSelection && selectedCount > 0 && (
              <div className="text-sm font-medium text-primary">
                {selectedCount} selecionada{selectedCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Linhas por página</p>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="h-8 w-[70px] rounded border border-input bg-background px-3 py-1 text-sm"
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}