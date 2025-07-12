import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Column } from '@tanstack/react-table';
import { Check, ChevronDown, X } from 'lucide-react';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  filterType?: 'text' | 'select';
  filterOptions?: { label: string; value: string }[];
}

export function ColumnFilter<TData, TValue>({
  column,
  filterType = 'text',
  filterOptions = [],
}: IColumnFilterProps<TData, TValue>) {
  const filterValue = column.getFilterValue() as string | string[];

  if (filterType === 'text') {
    return (
      <div className="relative pb-4">
        <Input
          placeholder="Filtrar..."
          value={(filterValue as string) ?? ''}
          onChange={(e) => column.setFilterValue(e.target.value)}
          className="h-8 w-full bg-beige-50 border-amber-200 text-brown-800 placeholder:text-brown-100 focus:border-amber-400 focus:ring-amber-200"
        />
        {filterValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-amber-100"
            onClick={() => column.setFilterValue('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  if (filterType === 'select') {
    const selectedValues = Array.isArray(filterValue) ? filterValue : [];
    
    return (
      <div className="pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full justify-between bg-beige-50 border-amber-200 text-brown-800 hover:bg-amber-100"
            >
              <span className="truncate">
                {selectedValues.length === 0 
                  ? 'Selecionar...' 
                  : selectedValues.length === 1
                  ? filterOptions.find(opt => opt.value === selectedValues[0])?.label || selectedValues[0]
                  : `${selectedValues.length} selecionados`}
              </span>
              <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white border-amber-200 max-h-64 overflow-y-auto">
            <div className="p-2">
              {/* Header com ações */}
              <div className="pb-2 border-b border-amber-200 mb-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const allValues = filterOptions.map(opt => opt.value);
                    column.setFilterValue(allValues);
                  }}
                  className="flex-1 h-7 text-xs text-brown-600 hover:bg-amber-100"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Todos
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => column.setFilterValue([])}
                  className="flex-1 h-7 text-xs text-brown-600 hover:bg-amber-100"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              </div>

              {/* Lista de opções */}
              <div className="space-y-1">
                {filterOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2 py-1.5 px-2 hover:bg-amber-100 rounded cursor-pointer"
                      onClick={() => {
                        const newValue = isSelected
                          ? selectedValues.filter((v) => v !== option.value)
                          : [...selectedValues, option.value];
                        column.setFilterValue(newValue.length > 0 ? newValue : undefined);
                      }}
                    >
                      <Checkbox
                        id={`filter-${option.value}`}
                        checked={isSelected}
                        onChange={() => {}}
                        className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <label
                        htmlFor={`filter-${option.value}`}
                        className="text-sm text-brown-700 cursor-pointer flex-1"
                      >
                        {option.label}
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Footer com contador */}
              {selectedValues.length > 0 && (
                <div className="pt-2 border-t border-amber-200 mt-2">
                  <p className="text-xs text-brown-500 text-center">
                    {selectedValues.length} de {filterOptions.length} selecionados
                  </p>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return null;
}