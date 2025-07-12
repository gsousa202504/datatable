import { Table } from '@tanstack/react-table';
import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

export interface UseDataTableExportProps<TData> {
  table: Table<TData>;
  filename?: string;
}

export function useDataTableExport<TData>({ table, filename = 'export' }: UseDataTableExportProps<TData>) {
  const getExportData = useCallback(() => {
    const selectedRows = table.getSelectedRowModel().rows;
    const visibleColumns = table.getVisibleLeafColumns().filter(col => col.id !== 'select' && col.id !== 'actions');
    
    // Use selected rows if any, otherwise use all filtered rows
    const dataToExport = selectedRows.length > 0 
      ? selectedRows.map(row => row.original)
      : table.getFilteredRowModel().rows.map(row => row.original);
    
    // Transform data for export
    const exportData = dataToExport.map(row => {
      const rowData: Record<string, any> = {};
      visibleColumns.forEach(column => {
        const header = typeof column.columnDef.header === 'string' 
          ? column.columnDef.header 
          : column.id;
        const value = column.getValue ? column.getValue(row) : '';
        rowData[header] = value;
      });
      return rowData;
    });

    return { exportData, headers: visibleColumns.map(col => 
      typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id
    )};
  }, [table]);

  const exportToExcel = useCallback(() => {
    const { exportData } = getExportData();
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }, [getExportData, filename]);

  const exportToPDF = useCallback(() => {
    const { exportData, headers } = getExportData();
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Data Export', 20, 20);
    
    // Add headers
    let y = 40;
    doc.setFontSize(10);
    doc.text(headers.join(' | '), 20, y);
    y += 10;
    
    // Add data rows
    exportData.forEach((row) => {
      if (y > 280) { // New page
        doc.addPage();
        y = 20;
      }
      
      const rowText = headers.map(header => String(row[header] || '')).join(' | ');
      doc.text(rowText, 20, y);
      y += 10;
    });
    
    doc.save(`${filename}.pdf`);
  }, [getExportData, filename]);

  const exportToCSV = useCallback(() => {
    const { exportData } = getExportData();
    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [getExportData, filename]);

  return {
    exportToExcel,
    exportToPDF,
    exportToCSV,
    getExportData,
  };
}