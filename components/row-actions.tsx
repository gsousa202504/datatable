import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export interface IRowActionItem<TData = unknown> {
  action: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: (row: TData) => void;
  className?: string;
  disabled?: boolean;
  render?: () => React.ReactNode; // custom render function
}

interface IRowActionsProps<TData> {
  row: TData;
  actions?: IRowActionItem<TData>[];
  preferRender?: boolean; // flag to prefer render when available
}

export function RowActions<TData>({ row, actions, preferRender }: IRowActionsProps<TData>) {
  if (!actions || actions.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-amber-100"
        >
          <MoreHorizontal className="h-4 w-4 text-brown-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white border-amber-200">
        {actions.map((item, idx) => {
          if (preferRender && typeof item.render === 'function') {
            // Render custom node directly (e.g., a Link)
            return (
              <React.Fragment key={item.action + '-' + idx}>
                {item.render()}
              </React.Fragment>
            );
          }
          return (
            <DropdownMenuItem
              key={item.action + '-' + idx}
              onClick={() => item.onClick && item.onClick(row)}
              className={item.className || 'flex items-center gap-2 hover:bg-amber-100 text-brown-700'}
              disabled={item.disabled}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}