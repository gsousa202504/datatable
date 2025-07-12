import { DataTableColumn, DataTableProps, DataTableState } from '@/components/data-table/types/data-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
	closestCenter,
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext as SortableContextProvider,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getGroupedRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	PaginationState,
	SortingState,
	Updater,
	useReactTable,
} from '@tanstack/react-table';
import {
	CheckSquare,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	CopyCheck,
	GripVertical,
	Minus,
	Plus,
	RotateCcw,
	Square,
	X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { ColumnFilter } from './column-filter';
import { ColumnHeader } from './column-header';
import { ExportButtons } from './export-buttons';

function SortableHeader({
	id,
	children,
	enableColumnDrag,
}: {
	id: string;
	children: React.ReactNode;
	enableColumnDrag?: boolean;
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id,
		disabled: !enableColumnDrag,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<TableHead
			ref={setNodeRef}
			style={style}
			className={cn(
				'bg-amber-50 border-amber-200 text-brown-800 relative',
				isDragging && 'opacity-50',
				'sticky top-0 bg-white border-b border-amber-200',
			)}
		>
			<div className="flex items-center gap-2">
				{enableColumnDrag && (
					<div {...attributes} {...listeners} className="cursor-grab">
						<GripVertical className="h-4 w-4 text-brown-400" />
					</div>
				)}
				{children}
			</div>
		</TableHead>
	);
}

function ResizableHeader({
	header,
	children,
	enableColumnDrag,
}: {
	header: any;
	children: React.ReactNode;
	enableColumnDrag?: boolean;
}) {
	const [isResizing, setIsResizing] = useState(false);

	return (
		<SortableHeader id={header.id} enableColumnDrag={enableColumnDrag}>
			<div className="relative w-full h-full">
				{children}
				{header.column.getCanResize() && (
					<div
						className={cn(
							'absolute right-0 top-0 w-1 h-full cursor-col-resize select-none touch-none',
							isResizing,
						)}
						style={{
							transform: 'translateX(50%)',
						}}
						onMouseDown={(e) => {
							setIsResizing(true);
							header.getResizeHandler()(e);
							const handleMouseUp = () => {
								setIsResizing(false);
								document.removeEventListener('mouseup', handleMouseUp);
							};
							document.addEventListener('mouseup', handleMouseUp);
						}}
						onTouchStart={(e) => {
							setIsResizing(true);
							header.getResizeHandler()(e);
							const handleTouchEnd = () => {
								setIsResizing(false);
								document.removeEventListener('touchend', handleTouchEnd);
							};
							document.addEventListener('touchend', handleTouchEnd);
						}}
					/>
				)}
			</div>
		</SortableHeader>
	);
}

export function DataTable<T extends Record<string, any>>({
	data,
	columns,
	enableMultiRowSelection = true,
	enableExport = false,
	enableReset = true,
	storageKey = 'data-table-state',
	className,
	rowSelection: externalRowSelection,
	onRowSelectionChange,
	onSelectionChange,
	getRowId,
	getRowProps,
	onSortingChange,
	onPaginationChange,
	onGroupingChange,
	onColumnVisibilityChange,
}: DataTableProps<T> & {
	rowSelection?: Record<string, boolean>;
	onRowSelectionChange?: (rowSelection: Record<string, boolean>) => void;
	onSelectionChange?: (selectedRows: T[]) => void;
	getRowId?: (row: T, index: number) => string;
	getRowProps?: (row: T) => { className?: string; disabled?: boolean; [key: string]: any; tooltip?: string };
	onSortingChange?: (updater: Updater<SortingState>) => void;
	onPaginationChange?: (updater: Updater<PaginationState>) => void;
	onGroupingChange?: (updater: Updater<string[]>) => void;
	onColumnVisibilityChange?: (updater: Updater<boolean>) => void;
}) {
	const props = {
		onSortingChange,
		onPaginationChange,
		onGroupingChange,
		onColumnVisibilityChange,
	};

	const [state, setState] = useState<DataTableState>(() => {
		try {
			const saved = localStorage.getItem(storageKey);
			if (saved) return JSON.parse(saved);
		} catch (error) {
			console.error(error);
		}
		return {
			sorting: [],
			columnFilters: [],
			columnVisibility: {},
			columnOrder: enableMultiRowSelection
				? ['select', ...columns.map((col) => col.id)]
				: columns.map((col) => col.id),
			columnPinning: {},
			columnSizing: {},
			pagination: { pageIndex: 0, pageSize: 10 },
			rowSelection: {},
			grouping: [],
			expanded: {},
		};
	});

	const tableColumns = useMemo<ColumnDef<T>[]>(() => {
		const cols: ColumnDef<T>[] = [];
		if (enableMultiRowSelection) {
			cols.push({
				id: 'select',
				header: '',
				cell: ({ row }) => {
					const rowProps = getRowProps?.(row.original) ?? {};
					return (
						<div className="flex items-center justify-center min-h-[40px] p-4">
							<Checkbox
								checked={row.getIsSelected()}
								onCheckedChange={(value) => {
									if (!rowProps.disabled) {
										row.toggleSelected(!!value);
									}
								}}
								disabled={rowProps.disabled}
								aria-label="Select row"
							/>
						</div>
					);
				},

				enableSorting: false,
				enableHiding: false,
				size: 90,
			});
		}
		columns.forEach((column) => {
			cols.push({
				id: column.id,
				accessorKey: column.accessorKey,
				header: ({ column: tableColumn }) => (
					<div className="space-y-2 pt-2 min-h-[40px] flex flex-col items-start justify-start h-full">
						<ColumnHeader
							column={tableColumn}
							title={column.header}
							enableColumnMenu={column.enableColumnMenu}
						/>
						{(column.filterType === 'text' || column.filterType === 'select') && (
							<ColumnFilter
								column={tableColumn}
								filterType={column.filterType}
								filterOptions={column.filterOptions}
							/>
						)}
					</div>
				),
				cell: ({ getValue, row }) => {
					const value = getValue();
					if (column.cell) {
						return column.cell(value, row.original);
					}
					return value;
				},
				filterFn:
					column.filterType === 'select'
						? (row, columnId, filterValue) => {
								if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
									return true;
								}
								const cellValue = row.getValue(columnId);
								return filterValue.includes(String(cellValue));
							}
						: column.filterType === 'text'
							? 'includesString'
							: undefined,
				enableSorting: column.enableSorting ?? true,
				enableGrouping: column.enableGrouping ?? true,
				enableExpanding: true,
				enableResizing: column.enableResizing ?? true,
				enablePinning: column.enablePinning ?? true,
				size: column.size ?? 150,
				minSize: column.minSize ?? 50,
				maxSize: column.maxSize ?? 500,
			});
		});
		return cols;
	}, [columns, enableMultiRowSelection]);

	useEffect(() => {
		localStorage.setItem(storageKey, JSON.stringify(state));
	}, [state, storageKey]);

	const lastSelectedRef = React.useRef<string>('');

	useEffect(() => {
		if (onSelectionChange && externalRowSelection) {
			const selectedRows = data.filter((row, idx) => {
				const id = getRowId ? getRowId(row, idx) : String(idx);
				return externalRowSelection[id];
			});
			const selectedString = JSON.stringify(
				selectedRows.map((r) => (getRowId ? getRowId(r, data.indexOf(r)) : String(data.indexOf(r)))),
			);
			if (lastSelectedRef.current !== selectedString) {
				onSelectionChange(selectedRows);
				lastSelectedRef.current = selectedString;
			}
		}
	}, [externalRowSelection, data, getRowId, onSelectionChange]);

	const table = useReactTable({
		data,
		columns: tableColumns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getGroupedRowModel: getGroupedRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getRowId: getRowId,
		state: {
			sorting: state.sorting,
			columnFilters: state.columnFilters,
			columnVisibility: state.columnVisibility,
			columnOrder: state.columnOrder,
			columnPinning: state.columnPinning,
			columnSizing: state.columnSizing,
			pagination: state.pagination,
			rowSelection: externalRowSelection || state.rowSelection,
			grouping: state.grouping,
			expanded: state.expanded,
		},
		enableRowSelection: true,
		enableMultiRowSelection: true,
		enableColumnResizing: true,
		enableColumnPinning: true,
		enableGrouping: true,
		enableExpanding: true,
		columnResizeMode: 'onChange',
		onRowSelectionChange: (updater) => {
			let newRowSelection: Record<string, boolean>;
			if (typeof updater === 'function') {
				newRowSelection = updater(externalRowSelection || state.rowSelection);
			} else {
				newRowSelection = updater;
			}
			if (onRowSelectionChange) onRowSelectionChange(newRowSelection);
		},
		onSortingChange: (updater) => {
			if (props.onSortingChange) {
				props.onSortingChange(updater);
			} else {
				setState((prev) => ({
					...prev,
					sorting: typeof updater === 'function' ? updater(prev.sorting) : updater,
				}));
			}
		},
		onPaginationChange: (updater) => {
			if (props.onPaginationChange) {
				props.onPaginationChange(updater);
			} else {
				setState((prev) => ({
					...prev,
					pagination: typeof updater === 'function' ? updater(prev.pagination) : updater,
				}));
			}
		},
		onGroupingChange: (updater) => {
			if (props.onGroupingChange) {
				props.onGroupingChange(updater);
			} else {
				setState((prev) => ({
					...prev,
					grouping: typeof updater === 'function' ? updater(prev.grouping) : updater,
				}));
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (props.onColumnVisibilityChange) {
				props.onColumnVisibilityChange(updater);
			} else {
				setState((prev) => ({
					...prev,
					columnVisibility: typeof updater === 'function' ? updater(prev.columnVisibility) : updater,
				}));
			}
		},
		onColumnFiltersChange: (updater) => {
			setState((prev) => ({
				...prev,
				columnFilters: typeof updater === 'function' ? updater(prev.columnFilters) : updater,
			}));
		},
		onExpandedChange: (updater) => {
			if (typeof updater === 'function') {
				setState((prev) => ({
					...prev,
					expanded: updater(prev.expanded),
				}));
			} else {
				setState((prev) => ({
					...prev,
					expanded: updater,
				}));
			}
		},
	});

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (active && over && active.id !== over.id) {
			const oldIndex = state.columnOrder.indexOf(active.id as string);
			const newIndex = state.columnOrder.indexOf(over.id as string);
			const newOrder = arrayMove(state.columnOrder, oldIndex, newIndex);
			setState((prev: DataTableState) => ({ ...prev, columnOrder: newOrder }));
		}
	};

	const resetTable = () => {
		const initialState: DataTableState = {
			sorting: [],
			columnFilters: [],
			columnVisibility: {},
			columnOrder: enableMultiRowSelection
				? ['select', ...columns.map((col) => col.id)]
				: columns.map((col) => col.id),
			columnPinning: {},
			columnSizing: {},
			pagination: { pageIndex: 0, pageSize: 10 },
			rowSelection: {},
			grouping: [],
			expanded: {},
		};
		setState(initialState);
	};

	const selectedRowsCount = table.getSelectedRowModel().rows.length;

	return (
		<div className={cn('space-y-4', className)}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					{enableReset && (
						<Button
							variant="outline"
							size="sm"
							onClick={resetTable}
							className="bg-beige-50 border-amber-200 text-brown-700 hover:bg-amber-100"
						>
							<RotateCcw className="h-4 w-4 mr-2" />
							Resetar tabela
						</Button>
					)}
					{enableMultiRowSelection && (
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => table.toggleAllRowsSelected()}
								className="bg-beige-50 border-amber-200 text-brown-700 hover:bg-amber-100"
							>
								{table.getIsAllPageRowsSelected() ? (
									<>
										<Square className="h-4 w-4 mr-2" />
										Desmarcar Todas
									</>
								) : (
									<>
										<CheckSquare className="h-4 w-4 mr-2" />
										Selecionar Todas
									</>
								)}
							</Button>
							{selectedRowsCount > 0 && (
								<div className="flex items-center gap-2 px-3 py-1 bg-amber-100 border border-amber-300 rounded-md">
									<CopyCheck className="h-4 w-4 text-amber-700" />
									<span className="text-sm font-medium text-amber-800">
										{selectedRowsCount} linha{selectedRowsCount !== 1 ? 's' : ''} selecionada
										{selectedRowsCount !== 1 ? 's' : ''}
									</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => table.resetRowSelection()}
										className="h-6 w-6 p-0 hover:bg-amber-200"
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							)}
						</div>
					)}
				</div>
				<div className="flex items-center gap-2">{enableExport && <ExportButtons table={table} />}</div>
			</div>
			<div className="rounded-lg border border-amber-200 bg-white shadow-sm">
				<div className="overflow-x-auto w-full max-h-[500px] overflow-y-auto">
					<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
						<SortableContextProvider items={state.columnOrder} strategy={verticalListSortingStrategy}>
							<Table className="min-w-full w-full">
								<TableHeader>
									{table.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id} className="border-amber-200">
											{headerGroup.headers.map((header) => {
												const column = columns.find(
													(col: DataTableColumn<T>) => col.id === header.id,
												);
												return (
													<ResizableHeader
														key={header.id}
														header={header}
														enableColumnDrag={column?.enableColumnDrag}
													>
														<div className="h-full flex flex-col justify-center">
															{header.isPlaceholder
																? null
																: flexRender(
																		header.column.columnDef.header,
																		header.getContext(),
																	)}
														</div>
													</ResizableHeader>
												);
											})}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									{table.getRowModel().rows?.length ? (
										table.getRowModel().rows.map((row) => {
											const rowProps = getRowProps?.(row.original) ?? {};

											return (
												<TooltipProvider delayDuration={500}>
													<Tooltip>
														<TooltipTrigger asChild>
															<TableRow
																key={row.id}
																data-state={row.getIsSelected() && 'selected'}
																{...rowProps}
																className={cn(
																	'border-amber-100 hover:bg-amber-50 transition-colors',
																	row.getIsSelected() &&
																		'bg-amber-100 hover:bg-amber-150',
																	rowProps.className,
																)}
															>
																{row.getVisibleCells().map((cell) => {
																	const columnDef = columns.find(
																		(col) => col.id === cell.column.id,
																	) as DataTableColumn<T> | undefined;

																	const styleClass =
																		typeof columnDef?.styleFn === 'function'
																			? columnDef.styleFn(
																					cell.getValue(),
																					row.original,
																				)
																			: '';

																	return (
																		<TableCell
																			key={cell.id}
																			className={cn(
																				'text-brown-700 px-2 py-1 border-r border-amber-100',
																				styleClass,
																			)}
																			style={{
																				width: columnDef?.size,
																			}}
																		>
																			{cell.getIsGrouped() ? (
																				<div className="flex items-center gap-2">
																					<Button
																						variant="ghost"
																						size="sm"
																						className="h-6 w-6 p-0"
																						onClick={row.getToggleExpandedHandler()}
																					>
																						{row.getIsExpanded() ? (
																							<Minus className="h-4 w-4" />
																						) : (
																							<Plus className="h-4 w-4" />
																						)}
																					</Button>
																					{flexRender(
																						cell.column.columnDef.cell,
																						cell.getContext(),
																					)}{' '}
																					({row.subRows.length})
																				</div>
																			) : cell.getIsAggregated() ? (
																				flexRender(
																					cell.column.columnDef
																						.aggregatedCell ??
																						cell.column.columnDef.cell,
																					cell.getContext(),
																				)
																			) : cell.getIsPlaceholder() ? null : (
																				flexRender(
																					cell.column.columnDef.cell,
																					cell.getContext(),
																				)
																			)}
																		</TableCell>
																	);
																})}
															</TableRow>
														</TooltipTrigger>
														{rowProps.tooltip && (
															<TooltipContent side='bottom'>
																<p>{rowProps.tooltip}</p>
															</TooltipContent>
														)}
													</Tooltip>
												</TooltipProvider>
											);
										})
									) : (
										<TableRow>
											<TableCell
												colSpan={tableColumns.length}
												className="h-24 text-center text-brown-500"
											>
												Nenhum resultado encontrado.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</SortableContextProvider>
					</DndContext>
				</div>
			</div>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<p className="text-sm text-brown-600">
						Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} até{' '}
						{Math.min(
							(table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
							table.getFilteredRowModel().rows.length,
						)}{' '}
						de {table.getFilteredRowModel().rows.length} registros
					</p>
					{enableMultiRowSelection && (
						<div className="flex items-center gap-2">
							<div className="h-4 w-px bg-amber-300" />
							<p className="text-sm font-medium text-amber-700">
								{selectedRowsCount} selecionada{selectedRowsCount !== 1 ? 's' : ''}
							</p>
						</div>
					)}
				</div>
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-2">
						<p className="text-sm text-brown-600">Linhas por página:</p>
						<select
							value={table.getState().pagination.pageSize}
							onChange={(e) => {
								table.setPageSize(Number(e.target.value));
							}}
							className="h-8 w-10 rounded-md border border-amber-200 bg-beige-50 text-brown-700 text-sm"
						>
							{[10, 20, 30, 40, 50].map((pageSize) => (
								<option key={pageSize} value={pageSize}>
									{pageSize}
								</option>
							))}
						</select>
					</div>
					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
							className="bg-beige-50 border-amber-200 text-brown-700 hover:bg-amber-100"
						>
							<ChevronsLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							className="bg-beige-50 border-amber-200 text-brown-700 hover:bg-amber-100"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							className="bg-beige-50 border-amber-200 text-brown-700 hover:bg-amber-100"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
							className="bg-beige-50 border-amber-200 text-brown-700 hover:bg-amber-100"
						>
							<ChevronsRight className="h-4 w-4" />
						</Button>
					</div>
					<div className="flex items-center gap-2">
						<p className="text-sm text-brown-600">
							Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
						</p>
						<Input
							type="number"
							min="1"
							max={table.getPageCount()}
							value={table.getState().pagination.pageIndex + 1}
							onChange={(e) => {
								const page = e.target.value ? Number(e.target.value) - 1 : 0;
								table.setPageIndex(page);
							}}
							className="h-8 w-16 bg-beige-50 border-amber-200 text-brown-700"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
