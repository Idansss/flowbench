import * as React from "react";
import { cn } from "../lib/utils";

interface Column<T> {
  key: string;
  label: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  className?: string;
  maxRows?: number;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  emptyMessage = "No data available",
  className,
  maxRows,
}: DataTableProps<T>) {
  const displayData = maxRows ? data.slice(0, maxRows) : data;
  const hasMore = maxRows && data.length > maxRows;

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 border border-dashed rounded-lg">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider",
                      column.className
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {displayData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {columns.map((column) => {
                    const value = row[column.key];
                    return (
                      <td
                        key={`${rowIndex}-${column.key}`}
                        className={cn(
                          "px-4 py-3 text-sm",
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render(value, row, rowIndex)
                          : value?.toString() || "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {hasMore && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {maxRows} of {data.length} rows
        </p>
      )}
    </div>
  );
}

