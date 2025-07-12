export interface DataTableColumn<T> {
	id: string;
	header: string;
	accessorKey?: keyof T;
	accessorFn?: (row: T) => any;
	cell?: (value: any, row: T) => React.ReactNode;
	filterType?: 'text' | 'select';
	filterOptions?: { label: string; value: string }[];
	styleFn?: (value: any, row: T) => string;
	enableSorting?: boolean;
	enableGrouping?: boolean;
	enableColumnMenu?: boolean;
	enableColumnDrag?: boolean;
	enableResizing?: boolean;
	enablePinning?: boolean;
	size?: number;
	minSize?: number;
	maxSize?: number;
}

export interface DataTableState {
	sorting: { id: string; desc: boolean }[];
	columnFilters: { id: string; value: any }[];
	columnVisibility: Record<string, boolean>;
	columnOrder: string[];
	columnPinning: { left?: string[]; right?: string[] };
	columnSizing: Record<string, number>;
	pagination: { pageIndex: number; pageSize: number };
	rowSelection: Record<string, boolean>;
	grouping: string[];
	expanded: Record<string, boolean>;
}

export interface DataTableProps<T> {
	data: T[];
	columns: DataTableColumn<T>[];
	enableMultiRowSelection?: boolean;
	enableExport?: boolean;
	enableReset?: boolean;
	enableActions?: boolean;
	onRowAction?: (action: string, row: T) => void;
	onSelectionChange?: (selected: T[]) => void;
	storageKey?: string;
	className?: string;
	getRowProps?: (row: T) => { className?: string; disabled?: boolean; [key: string]: any; tooltip?: string };
}