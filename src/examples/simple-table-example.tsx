import React from 'react';
import { EnhancedDataTable } from '@/components/data-table/enhanced-data-table';
import { DataTableColumnConfig } from '@/hooks/use-data-table-columns';
import { Badge } from '@/components/ui/badge';

// Simple data type
interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
}

// Mock data
const tasks: Task[] = [
  {
    id: '1',
    title: 'Implement user authentication',
    status: 'in_progress',
    priority: 'high',
    assignee: 'John Doe',
    dueDate: '2024-01-15',
  },
  {
    id: '2',
    title: 'Design landing page',
    status: 'todo',
    priority: 'medium',
    assignee: 'Jane Smith',
    dueDate: '2024-01-20',
  },
  {
    id: '3',
    title: 'Write API documentation',
    status: 'done',
    priority: 'low',
    assignee: 'Bob Johnson',
    dueDate: '2024-01-10',
  },
  {
    id: '4',
    title: 'Set up CI/CD pipeline',
    status: 'todo',
    priority: 'high',
    assignee: 'Alice Brown',
    dueDate: '2024-01-25',
  },
  {
    id: '5',
    title: 'Optimize database queries',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Charlie Wilson',
    dueDate: '2024-01-18',
  },
];

export function SimpleTableExample() {
  const columns: DataTableColumnConfig<Task>[] = [
    {
      id: 'title',
      header: 'Título',
      accessorKey: 'title',
      filterType: 'text',
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      filterType: 'select',
      filterOptions: [
        { label: 'A Fazer', value: 'todo' },
        { label: 'Em Progresso', value: 'in_progress' },
        { label: 'Concluído', value: 'done' },
      ],
      cell: (value) => {
        const statusConfig = {
          todo: { label: 'A Fazer', className: 'bg-gray-100 text-gray-800' },
          in_progress: { label: 'Em Progresso', className: 'bg-blue-100 text-blue-800' },
          done: { label: 'Concluído', className: 'bg-green-100 text-green-800' },
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        return <Badge className={config.className}>{config.label}</Badge>;
      },
    },
    {
      id: 'priority',
      header: 'Prioridade',
      accessorKey: 'priority',
      filterType: 'select',
      filterOptions: [
        { label: 'Baixa', value: 'low' },
        { label: 'Média', value: 'medium' },
        { label: 'Alta', value: 'high' },
      ],
      cell: (value) => {
        const priorityConfig = {
          low: { label: 'Baixa', className: 'bg-green-100 text-green-800' },
          medium: { label: 'Média', className: 'bg-yellow-100 text-yellow-800' },
          high: { label: 'Alta', className: 'bg-red-100 text-red-800' },
        };
        const config = priorityConfig[value as keyof typeof priorityConfig];
        return <Badge className={config.className}>{config.label}</Badge>;
      },
    },
    {
      id: 'assignee',
      header: 'Responsável',
      accessorKey: 'assignee',
      filterType: 'text',
    },
    {
      id: 'dueDate',
      header: 'Data de Entrega',
      accessorKey: 'dueDate',
      cell: (value) => new Date(value).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tarefas</h1>
        <p className="text-muted-foreground">Exemplo simples de tabela com dados estáticos</p>
      </div>

      <EnhancedDataTable
        data={tasks}
        columns={columns}
        
        // Basic configuration
        enableRowSelection
        getRowId={(row) => row.id}
        
        // UI configuration
        showGlobalFilter
        showColumnFilters
        showPagination
        showExport
        showReset
        exportFilename="tarefas"
        
        // State persistence
        enableStatePersistence
        storageKey="tasks-table"
        
        // Row styling based on priority
        getRowProps={(task) => ({
          className: task.priority === 'high' ? 'border-l-4 border-l-red-500' : '',
        })}
      />
    </div>
  );
}