import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import './DataTable.css';

export default function DataTable({ columns, data, onRowClick, searchable = true, pageSize = 10 }) {
    const [search, setSearch] = useState('');
    const [sortCol, setSortCol] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [page, setPage] = useState(0);

    const filtered = data.filter(row =>
        !search || columns.some(col => {
            const val = col.accessor ? (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]) : '';
            return String(val).toLowerCase().includes(search.toLowerCase());
        })
    );

    const sorted = [...filtered].sort((a, b) => {
        if (!sortCol) return 0;
        const col = columns.find(c => c.key === sortCol);
        if (!col) return 0;
        const va = typeof col.accessor === 'function' ? col.accessor(a) : a[col.accessor];
        const vb = typeof col.accessor === 'function' ? col.accessor(b) : b[col.accessor];
        if (va == null) return 1;
        if (vb == null) return -1;
        const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const totalPages = Math.ceil(sorted.length / pageSize);
    const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

    const handleSort = (key) => {
        if (sortCol === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortCol(key); setSortDir('asc'); }
    };

    return (
        <div className="data-table-wrap">
            {searchable && (
                <div className="table-toolbar">
                    <div className="table-search">
                        <Search size={16} />
                        <input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
                    </div>
                    <span className="table-count">{filtered.length} records</span>
                </div>
            )}
            <div className="table-scroll">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} onClick={() => col.sortable !== false && handleSort(col.key)} className={col.sortable !== false ? 'sortable' : ''}>
                                    {col.label}
                                    {sortCol === col.key && <span className="sort-arrow">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paged.length === 0 ? (
                            <tr><td colSpan={columns.length} className="empty-row">No records found</td></tr>
                        ) : paged.map((row, i) => (
                            <tr key={row.id || i} onClick={() => onRowClick?.(row)} className={onRowClick ? 'clickable' : ''}>
                                {columns.map(col => (
                                    <td key={col.key} data-label={col.label}>
                                        {col.render ? col.render(row) : (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="table-pagination">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft size={16} /></button>
                    <span>Page {page + 1} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}><ChevronRight size={16} /></button>
                </div>
            )}
        </div>
    );
}
