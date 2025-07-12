import React from 'react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

interface ExportButtonsProps<TData> {
  table: Table<TData>;
}

export function ExportButtons<TData>({ table }: ExportButtonsProps<TData>) {
  const exportToExcel = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const visibleColumns = table.getVisibleLeafColumns();
    
    // Get data to export (selected rows or all filtered rows)
    const dataToExport = selectedRows.length > 0 
      ? selectedRows.map(row => row.original)
      : table.getFilteredRowModel().rows.map(row => row.original);
    
    // Create worksheet data
    const worksheetData = dataToExport.map(row => {
      const rowData: any = {};
      visibleColumns.forEach(column => {
        const header = typeof column.columnDef.header === 'string' 
          ? column.columnDef.header 
          : column.id;
        const value = column.getValue ? column.getValue(row) : '';
        rowData[header] = value;
      });
      return rowData;
    });
    
    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados');
    XLSX.writeFile(wb, 'exportacao-tabela.xlsx');
  };

  const exportToPDF = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const visibleColumns = table.getVisibleLeafColumns();
    
    const dataToExport = selectedRows.length > 0 
      ? selectedRows.map(row => row.original)
      : table.getFilteredRowModel().rows.map(row => row.original);
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Exportação de Dados', 20, 20);
    
    // Add headers
    const headers = visibleColumns.map(column => 
      typeof column.columnDef.header === 'string' 
        ? column.columnDef.header 
        : column.id
    );
    
    let y = 40;
    doc.setFontSize(12);
    doc.text(headers.join(' | '), 20, y);
    y += 10;
    
    // Add data rows
    dataToExport.forEach((row, index) => {
      if (y > 280) { // New page
        doc.addPage();
        y = 20;
      }
      
      const rowText = visibleColumns.map(column => {
        const value = column.getValue ? column.getValue(row) : '';
        return String(value);
      }).join(' | ');
      
      doc.text(rowText, 20, y);
      y += 10;
    });
    
    doc.save('exportacao-tabela.pdf');
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToExcel}
        className="bg-beige-50 border-amber-200 text-brown-700 hover:bg-amber-100"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Exportar Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        className="bg-beige-50 border-amber-200 text-brown-700 hover:bg-amber-100"
      >
        <FileText className="h-4 w-4 mr-2" />
        Exportar PDF
      </Button>
    </div>
  );
}