import React from 'react';
import { EnhancedDataTable } from '@/components/data-table/enhanced-data-table';
import { DataTableColumnConfig } from '@/hooks/use-data-table-columns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

// Mock product data type
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  sku: string;
  description: string;
}

// Generate large dataset for virtualization demo
const generateProducts = (count: number): Product[] => {
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys'];
  const statuses: Product['status'][] = ['in_stock', 'low_stock', 'out_of_stock'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `product-${i + 1}`,
    name: `Product ${i + 1}`,
    category: categories[i % categories.length],
    price: Math.random() * 1000 + 10,
    stock: Math.floor(Math.random() * 100),
    status: statuses[i % statuses.length],
    sku: `SKU-${String(i + 1).padStart(6, '0')}`,
    description: `Description for product ${i + 1}`,
  }));
};

export function ProductsTableVirtualized() {
  // Generate 10,000 products for virtualization demo
  const products = React.useMemo(() => generateProducts(10000), []);
  
  const columns: DataTableColumnConfig<Product>[] = [
    {
      id: 'sku',
      header: 'SKU',
      accessorKey: 'sku',
      filterType: 'text',
      size: 120,
    },
    {
      id: 'name',
      header: 'Nome do Produto',
      accessorKey: 'name',
      filterType: 'text',
      size: 200,
    },
    {
      id: 'category',
      header: 'Categoria',
      accessorKey: 'category',
      filterType: 'select',
      filterOptions: [
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Clothing', value: 'Clothing' },
        { label: 'Books', value: 'Books' },
        { label: 'Home & Garden', value: 'Home & Garden' },
        { label: 'Sports', value: 'Sports' },
        { label: 'Toys', value: 'Toys' },
      ],
      size: 150,
    },
    {
      id: 'price',
      header: 'Preço',
      accessorKey: 'price',
      cell: (value) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value),
      size: 120,
    },
    {
      id: 'stock',
      header: 'Estoque',
      accessorKey: 'stock',
      cell: (value, row) => (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          {row.status === 'low_stock' && value < 10 && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              Baixo
            </Badge>
          )}
        </div>
      ),
      size: 100,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      filterType: 'select',
      filterOptions: [
        { label: 'Em Estoque', value: 'in_stock' },
        { label: 'Estoque Baixo', value: 'low_stock' },
        { label: 'Sem Estoque', value: 'out_of_stock' },
      ],
      cell: (value) => {
        const statusConfig = {
          in_stock: { label: 'Em Estoque', className: 'bg-green-100 text-green-800' },
          low_stock: { label: 'Estoque Baixo', className: 'bg-yellow-100 text-yellow-800' },
          out_of_stock: { label: 'Sem Estoque', className: 'bg-red-100 text-red-800' },
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        return <Badge className={config.className}>{config.label}</Badge>;
      },
      size: 130,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos (Virtualizado)</h1>
          <p className="text-muted-foreground">
            Demonstração com 10.000 produtos usando virtualização para performance
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Virtualização Ativada</h3>
            <p className="text-sm text-blue-700">
              Esta tabela usa virtualização para renderizar apenas as linhas visíveis, 
              permitindo performance otimizada mesmo com milhares de registros.
            </p>
          </div>
        </div>
      </div>

      <EnhancedDataTable
        data={products}
        columns={columns}
        
        // Enable virtualization for large datasets
        enabled={true}
        estimateSize={50}
        overscan={10}
        
        // Row selection
        enableRowSelection
        getRowId={(row) => row.id}
        
        // UI configuration
        showGlobalFilter
        showColumnFilters
        showPagination={false} // Disable pagination when using virtualization
        showExport
        showReset
        exportFilename="produtos"
        
        // State persistence
        enableStatePersistence
        storageKey="products-table-virtualized"
        
        // Custom empty state
        emptyState={
          <div className="flex flex-col items-center gap-2 py-8">
            <Package className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros ou adicionar novos produtos.</p>
          </div>
        }
        
        // Row styling based on stock status
        getRowProps={(product) => ({
          className: product.status === 'out_of_stock' ? 'opacity-60' : '',
        })}
      />
    </div>
  );
}