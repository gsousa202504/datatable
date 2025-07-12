import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/router';
import { EnhancedDataTable } from '@/components/data-table/enhanced-data-table';
import { IDataTableColumnConfig } from '@/hooks/use-data-table-columns';
import { IRowActionItem } from '@/components/data-table/row-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Trash2, Eye, UserPlus } from 'lucide-react';

// Mock user data type
interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

// Mock API function
const fetchUsers = async (params: {
  page: number;
  pageSize: number;
  sorting?: { id: string; desc: boolean }[];
  filters?: { id: string; value: any }[];
  globalFilter?: string;
}): Promise<{ data: IUser[]; totalCount: number }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data
  const mockUsers: IUser[] = Array.from({ length: 100 }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ['admin', 'user', 'moderator'][i % 3] as IUser['role'],
    status: ['active', 'inactive', 'pending'][i % 3] as IUser['status'],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    lastLogin: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 1000000000).toISOString() : undefined,
  }));

  // Apply filters and sorting (simplified for demo)
  let filteredUsers = mockUsers;
  
  if (params.globalFilter) {
    filteredUsers = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(params.globalFilter!.toLowerCase()) ||
      user.email.toLowerCase().includes(params.globalFilter!.toLowerCase())
    );
  }

  // Apply pagination
  const start = params.page * params.pageSize;
  const end = start + params.pageSize;
  const paginatedUsers = filteredUsers.slice(start, end);

  return {
    data: paginatedUsers,
    totalCount: filteredUsers.length,
  };
};

export function UsersTableExample() {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = React.useState<{ id: string; desc: boolean }[]>([]);
  const [columnFilters, setColumnFilters] = React.useState<{ id: string; value: any }[]>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});

  // React Query for server-side data fetching
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', pagination, sorting, columnFilters, globalFilter],
    queryFn: () => fetchUsers({
      page: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      filters: columnFilters,
      globalFilter,
    }),
    keepPreviousData: true,
  });

  // Column definitions
  const columns: IDataTableColumnConfig<IUser>[] = [
    {
      id: 'avatar',
      header: '',
      accessorKey: 'avatar',
      cell: (value, row) => (
        <Avatar className="h-8 w-8">
          <AvatarImage src={value} alt={row.name} />
          <AvatarFallback>{row.name.charAt(0)}</AvatarFallback>
        </Avatar>
      ),
      enableSorting: false,
      size: 60,
    },
    {
      id: 'name',
      header: 'Nome',
      accessorKey: 'name',
      filterType: 'text',
      cell: (value, row) => (
        <div className="font-medium">
          <div>{value}</div>
          <div className="text-sm text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Função',
      accessorKey: 'role',
      filterType: 'select',
      filterOptions: [
        { label: 'Admin', value: 'admin' },
        { label: 'Usuário', value: 'user' },
        { label: 'Moderador', value: 'moderator' },
      ],
      cell: (value) => {
        const roleColors = {
          admin: 'bg-red-100 text-red-800',
          moderator: 'bg-blue-100 text-blue-800',
          user: 'bg-gray-100 text-gray-800',
        };
        return (
          <Badge className={roleColors[value as keyof typeof roleColors]}>
            {value === 'admin' ? 'Admin' : value === 'moderator' ? 'Moderador' : 'Usuário'}
          </Badge>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      filterType: 'select',
      filterOptions: [
        { label: 'Ativo', value: 'active' },
        { label: 'Inativo', value: 'inactive' },
        { label: 'Pendente', value: 'pending' },
      ],
      cell: (value) => {
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          pending: 'bg-yellow-100 text-yellow-800',
        };
        const statusLabels = {
          active: 'Ativo',
          inactive: 'Inativo',
          pending: 'Pendente',
        };
        return (
          <Badge className={statusColors[value as keyof typeof statusColors]}>
            {statusLabels[value as keyof typeof statusLabels]}
          </Badge>
        );
      },
    },
    {
      id: 'createdAt',
      header: 'Criado em',
      accessorKey: 'createdAt',
      cell: (value) => new Date(value).toLocaleDateString('pt-BR'),
    },
    {
      id: 'lastLogin',
      header: 'Último Login',
      accessorKey: 'lastLogin',
      cell: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : 'Nunca',
    },
  ];

  // Row actions
  const rowActions: IRowActionItem<IUser>[] = [
    {
      action: 'view',
      label: 'Visualizar',
      icon: <Eye className="h-4 w-4" />,
      render: () => (
        <Link to="/users/$userId" params={{ userId: 'user-1' }} className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
          <Eye className="h-4 w-4" />
          Visualizar
        </Link>
      ),
    },
    {
      action: 'edit',
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      onClick: (user) => {
        console.log('Edit user:', user);
        // Navigate to edit page or open modal
      },
    },
    {
      action: 'delete',
      label: 'Excluir',
      icon: <Trash2 className="h-4 w-4" />,
      className: 'text-destructive hover:bg-destructive/10',
      onClick: (user) => {
        console.log('Delete user:', user);
        // Show confirmation dialog
      },
    },
  ];

  const handleRowAction = (action: string, user: IUser) => {
    console.log(`Action: ${action}`, user);
  };

  const handleSelectionChange = (selectedRows: IUser[]) => {
    console.log('Selected users:', selectedRows);
  };

  const selectedUsers = data?.data.filter((user, index) => rowSelection[user.id]) || [];

  if (error) {
    return <div className="text-center py-8 text-destructive">Erro ao carregar usuários</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <EnhancedDataTable
        data={data?.data || []}
        columns={columns}
        
        // Server-side configuration
        pageCount={Math.ceil((data?.totalCount || 0) / pagination.pageSize)}
        manualPagination
        manualSorting
        manualFiltering
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onColumnFiltersChange={setColumnFilters}
        onGlobalFilterChange={setGlobalFilter}
        
        // Row selection
        enableRowSelection
        enableMultiRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onSelectionChange={handleSelectionChange}
        getRowId={(row) => row.id}
        
        // Row actions
        enableRowActions
        rowActions={rowActions}
        onRowAction={handleRowAction}
        
        // UI configuration
        showGlobalFilter
        showColumnFilters
        showPagination
        showExport
        showReset
        exportFilename="usuarios"
        
        // State persistence
        enableStatePersistence
        storageKey="users-table"
        
        // Loading state
        isLoading={isLoading}
        
        // Custom toolbar
        toolbar={
          selectedUsers.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Exportar Selecionados
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                Excluir Selecionados
              </Button>
            </div>
          )
        }
        
        // Row styling
        getRowProps={(user) => ({
          className: user.status === 'inactive' ? 'opacity-60' : '',
          onClick: () => console.log('Row clicked:', user),
        })}
      />
    </div>
  );
}