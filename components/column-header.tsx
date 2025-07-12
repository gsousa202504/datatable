import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, EyeOff, Group, Settings2 } from 'lucide-react';

interface ColumnHeaderProps<TData, TValue> {
	column: Column<TData, TValue>;
	title: string;
	enableColumnMenu?: boolean;
}

export function ColumnHeader<TData, TValue>({
	column,
	title,
	enableColumnMenu = true,
}: ColumnHeaderProps<TData, TValue>) {
	const sorted = column.getIsSorted();
	const canSort = column.getCanSort();
	const canGroup = column.getCanGroup();
	const canHide = column.getCanHide();

	if (!enableColumnMenu) {
		return (
			<div className="flex items-center space-x-2">
				<span className="font-medium text-brown-800">{title}</span>
				{sorted && (
					<div className="flex items-center">
						{sorted === 'asc' && <ArrowUp className="h-4 w-4 text-amber-600" />}
						{sorted === 'desc' && <ArrowDown className="h-4 w-4 text-amber-600" />}
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="flex items-center space-x-2">
			<span className="font-medium text-brown-800">{title}</span>
			{sorted && (
				<div className="flex items-center">
					{sorted === 'asc' && <ArrowUp className="h-4 w-4 text-amber-600" />}
					{sorted === 'desc' && <ArrowDown className="h-4 w-4 text-amber-600" />}
				</div>
			)}

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-amber-100">
						<Settings2 className="h-4 w-4 text-brown-600" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-48 bg-white border-amber-200">
					{canSort && (
						<>
							<DropdownMenuItem
								onClick={() => column.toggleSorting(false)}
								className="flex items-center gap-2 hover:bg-amber-100 text-brown-700"
							>
								<ArrowUp className="h-4 w-4" />
								Ordenar Crescente
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => column.toggleSorting(true)}
								className="flex items-center gap-2 hover:bg-amber-100 text-brown-700"
							>
								<ArrowDown className="h-4 w-4" />
								Ordenar Decrescente
							</DropdownMenuItem>
						</>
					)}
					{canGroup && (
						<DropdownMenuItem
							onClick={() => column.getToggleGroupingHandler()()}
							className="flex items-center gap-2 hover:bg-amber-100 text-brown-700"
						>
							<Group className="h-4 w-4" />
							Agrupar por esta Coluna
						</DropdownMenuItem>
					)}
					{canHide && (
						<DropdownMenuItem
							onClick={() => column.toggleVisibility(false)}
							className="flex items-center gap-2 hover:bg-amber-100 text-brown-700"
						>
							<EyeOff className="h-4 w-4" />
							Ocultar Coluna
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
