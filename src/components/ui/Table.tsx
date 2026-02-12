
import React from 'react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    isLoading?: boolean;
    emptyMessage?: string;
    keyExtractor?: (item: T) => string | number;
}

function Table<T>({
    data,
    columns,
    onRowClick,
    isLoading,
    emptyMessage = "No data available.",
    keyExtractor
}: TableProps<T>) {

    if (isLoading) {
        return (
            <div className="w-full h-48 flex items-center justify-center text-gray-500">
                Loading data...
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="w-full h-48 flex items-center justify-center text-gray-500 italic">
                {emptyMessage}
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className={`px-6 py-3 font-semibold ${col.className || ''}`}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, rowIdx) => {
                        const rowKey = keyExtractor ? keyExtractor(item) : (item as any).id ?? rowIdx;
                        return (
                            <tr
                                key={rowKey}
                                className={`bg-white border-b hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onRowClick && onRowClick(item)}
                            >
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className="px-6 py-4">
                                        {typeof col.accessor === 'function'
                                            ? col.accessor(item)
                                            : (item[col.accessor as keyof T] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
