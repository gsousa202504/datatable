import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersTableExample } from '@/examples/users-table-example';
import { ProductsTableVirtualized } from '@/examples/products-table-virtualized';
import { SimpleTableExample } from '@/examples/simple-table-example';
import { Table, Users, Package, CheckSquare } from 'lucide-react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function App() {
  const [activeExample, setActiveExample] = useState('overview');

  const examples = [
    {
      id: 'overview',
      title: 'Visão Geral',
      description: 'Introdução ao Enhanced DataTable',
      icon: <Table className="h-5 w-5" />,
    },
    {
      id: 'users',
      title: 'Usuários (Server-side)',
      description: 'Tabela com React Query e server-side operations',
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: 'products',
      title: 'Produtos (Virtualizado)',
      description: 'Performance com 10.000+ registros',
      icon: <Package className="h-5 w-5" />,
    },
    {
      id: 'tasks',
      title: 'Tarefas (Simples)',
      description: 'Exemplo básico com dados estáticos',
      icon: <CheckSquare className="h-5 w-5" />,
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Enhanced DataTable</h1>
            <p className="text-xl text-muted-foreground">
              Componente de tabela modular, escalável e rico em recursos
            </p>
          </div>

          <Tabs value={activeExample} onValueChange={setActiveExample}>
            <TabsList className="grid w-full grid-cols-4">
              {examples.map((example) => (
                <TabsTrigger key={example.id} value={example.id} className="flex items-center gap-2">
                  {example.icon}
                  <span className="hidden sm:inline">{example.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {examples.slice(1).map((example) => (
                  <Card key={example.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {example.icon}
                        {example.title}
                      </CardTitle>
                      <CardDescription>{example.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setActiveExample(example.id)}
                      >
                        Ver Exemplo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recursos Principais</CardTitle>
                  <CardDescription>
                    O Enhanced DataTable oferece uma solução completa para exibição e manipulação de dados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Performance</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Virtualização para grandes datasets</li>
                        <li>• Server-side pagination e filtering</li>
                        <li>• Otimizações de renderização</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Funcionalidades</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Seleção múltipla de linhas</li>
                        <li>• Filtros por coluna e global</li>
                        <li>• Ordenação e agrupamento</li>
                        <li>• Exportação (Excel, PDF, CSV)</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Customização</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Células customizáveis</li>
                        <li>• Ações por linha</li>
                        <li>• Temas e estilos flexíveis</li>
                        <li>• Componentes substituíveis</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Integração</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• React Query / SWR</li>
                        <li>• TanStack Router</li>
                        <li>• TypeScript completo</li>
                        <li>• shadcn/ui components</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <UsersTableExample />
            </TabsContent>

            <TabsContent value="products">
              <ProductsTableVirtualized />
            </TabsContent>

            <TabsContent value="tasks">
              <SimpleTableExample />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;