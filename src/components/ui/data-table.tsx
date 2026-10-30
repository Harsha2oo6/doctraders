"use client";

import {
  flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel,
  useReactTable, type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { Input } from "./form";

type ServerPaging = { page: number; limit: number; total: number; onPage: (page: number) => void };
type ServerSearch = { value: string; onChange: (q: string) => void };

/**
 * Generic sortable, searchable, paginated table used by all admin lists.
 * Client mode (default): sorts, filters and pages the given rows.
 * Server mode: pass `paging` (API page/limit/total) and `search` (debounced, sent to the API).
 */
export function DataTable<T>({ columns, data, searchPlaceholder = "Search…", pageSize = 8, paging, search, rowHref, loading }: {
  columns: ColumnDef<T, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  data: T[];
  searchPlaceholder?: string;
  pageSize?: number;
  paging?: ServerPaging;
  search?: ServerSearch;
  rowHref?: (row: T) => string;
  loading?: boolean;
}) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState("");
  const [q, setQ] = useState(search?.value ?? "");
  const server = !!paging;

  // Debounce server search.
  useEffect(() => {
    if (!search || q === search.value) return;
    const t = setTimeout(() => search.onChange(q), 350);
    return () => clearTimeout(t);
  }, [q, search]);

  const table = useReactTable({
    data, columns,
    state: { sorting, ...(server ? {} : { globalFilter: filter }) },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(server ? { manualPagination: true, manualFiltering: true } : { getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() }),
    initialState: { pagination: { pageSize } },
  });

  const pageNo = server ? paging.page : table.getState().pagination.pageIndex + 1;
  const pageCount = server ? Math.max(1, Math.ceil(paging.total / paging.limit)) : Math.max(table.getPageCount(), 1);
  const canPrev = server ? paging.page > 1 : table.getCanPreviousPage();
  const canNext = server ? paging.page < pageCount : table.getCanNextPage();

  return (
    <div className="space-y-3">
      <Input
        value={search ? q : filter}
        onChange={(e) => (search ? setQ(e.target.value) : setFilter(e.target.value))}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        className="max-w-xs bg-white"
      />
      <div className={cn("overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-card", loading && "opacity-60")}>
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="whitespace-nowrap px-4 py-3 font-semibold">
                    {h.column.getCanSort() ? (
                      <button className="inline-flex cursor-pointer items-center gap-1" onClick={h.column.getToggleSortingHandler()}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getIsSorted() === "asc" && <ArrowUp className="size-3" />}
                        {h.column.getIsSorted() === "desc" && <ArrowDown className="size-3" />}
                      </button>
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-ink-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn("hover:bg-ink-50/50", rowHref && "cursor-pointer")}
                onClick={rowHref ? (e) => { if (!(e.target as HTMLElement).closest("a, button")) router.push(rowHref(row.original)); } : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-ink-400">{loading ? "Loading…" : "No results"}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-xs text-ink-500">
        <span>Page {pageNo} of {pageCount}{server ? ` · ${paging.total} total` : ""}</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => (server ? paging.onPage(paging.page - 1) : table.previousPage())} disabled={!canPrev} aria-label="Previous page"><ChevronLeft className="size-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => (server ? paging.onPage(paging.page + 1) : table.nextPage())} disabled={!canNext} aria-label="Next page"><ChevronRight className="size-4" /></Button>
        </div>
      </div>
    </div>
  );
}
