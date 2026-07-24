"use client";

import { useState, useMemo } from "react";

import { DataTable, type DataTableColumn } from "@/components/data-table";
import { TablePagination } from "@/components/table-pagination";
import { FilterBar } from "@/components/filters/filter-bar";
import { type FilterOption } from "@/components/filters/checklist-filter";
import { Eye } from "lucide-react";
import {
  OrderDetailsDialog,
  type OrderDetailsDialogOrder,
} from "@/components/order-details-dialog";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";

type TabKey = "active" | "history";

interface ReturnRow {
  id: string;
  returnMonth: string;
  viewedDate: string;
  returnDate: string;
  orderNumber: string;
  quantity: number;
  amount: string;
}

function parseAmount(value: string) {
  return Number(value.replace(/[^\d-]/g, "")) || 0;
}

function makeReturnRow(idx: number): ReturnRow {
  return {
    id: `r-${idx}`,
    returnMonth: "2026/03",
    viewedDate: "2026/03/12",
    returnDate: "2026/03/12",
    orderNumber: "#11213445",
    quantity: 12,
    amount: "123,456,789₮",
  };
}

const activeReturns: ReturnRow[] = Array.from({ length: 10 }, (_, i) =>
  makeReturnRow(i + 1),
);

const historyReturns: ReturnRow[] = Array.from({ length: 6 }, (_, i) =>
  makeReturnRow(i + 1),
);

const returnColumns: DataTableColumn<ReturnRow>[] = [
  { key: "returnMonth", header: "Буцаасан сар" },
  { key: "viewedDate", header: "Харсан огноо" },
  { key: "returnDate", header: "Буцаасан огноо" },
  { key: "orderNumber", header: "Захиалгын дугаар" },
  { key: "quantity", header: "Тоо ширхэг", align: "right" },
  { key: "amount", header: "Үнийн дүн", align: "right" },
];

const RETURN_COLUMN_OPTIONS: FilterOption[] = [
  { value: "debit", label: "Дебит" },
  { value: "credit", label: "Кредит" },
  { value: "keyword", label: "Гүйлгээт үгтэй" },
];

const RETURN_TABS = [
  { value: "active", label: "Идэвхтэй захиалга" },
  { value: "history", label: "Захиалгын түүх" },
];

const TAB_CONFIG = {
  active: {
    data: activeReturns,
    columns: returnColumns,
    filters: {
      search: true,
      showYearFilter: true,
      columnOptions: RETURN_COLUMN_OPTIONS,
      showRefresh: true,
    },
  },
  history: {
    data: historyReturns,
    columns: returnColumns,
    filters: {
      search: true,
      showYearFilter: true,
      columnOptions: RETURN_COLUMN_OPTIONS,
      showRefresh: false,
    },
  },
} as const;

export default function ReturnsScreen() {
  const [selectedOrder, setSelectedOrder] =
    useState<OrderDetailsDialogOrder | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("active");
  const [pageByTab, setPageByTab] = useState<Record<TabKey, number>>({
    active: 1,
    history: 1,
  });
  const [pageSizeByTab, setPageSizeByTab] = useState<Record<TabKey, number>>({
    active: 10,
    history: 10,
  });

  const page = pageByTab[activeTab];
  const pageSize = pageSizeByTab[activeTab];

  const { data, columns, filters } = TAB_CONFIG[activeTab];

  const quantityIndex = columns.findIndex((c) => c.key === "quantity");
  const columnsBeforeQuantity = quantityIndex;
  const columnsAfterAmount = columns.length - quantityIndex - 2;

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  function handleTabChange(value: string) {
    setActiveTab(value as TabKey);
  }

  function setPage(p: number) {
    setPageByTab((prev) => ({ ...prev, [activeTab]: p }));
  }

  function setPageSize(size: number) {
    setPageSizeByTab((prev) => ({ ...prev, [activeTab]: size }));
    setPageByTab((prev) => ({ ...prev, [activeTab]: 1 }));
  }

  const refresh = async function onClickRefresh() {
    console.log("hello refresh hiisen");
  };

  return (
    <div className="flex h-auto min-h-0 min-w-0 flex-col gap-6">
      <FilterBar
        tabs={RETURN_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        search={filters.search}
        columnOptions={filters.columnOptions}
        showYearFilter={filters.showYearFilter}
        refresh={filters.showRefresh ? refresh : undefined}
      />

      <div className="flex-1 min-h-0 min-w-0">
        <DataTable
          key={activeTab}
          columns={columns}
          data={paginatedData}
          numbered
          getRowId={(row) => row.id}
          onHeaderMenuClick={() => console.log("Column settings")}
          getRowBadge={(row) => (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-foreground-tertiary hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOrder({
                  id: row.id,
                  orderNumber: row.orderNumber,
                  viewedDate: row.viewedDate,
                  orderDate: row.returnDate,
                  // required fields for OrderDetailsDialogOrder
                  req_type: "return",
                  req_title: "Буцаалт",
                  description: `Буцаалт (${row.orderNumber}) - ${row.amount}`,
                  ref_image: "",
                });
              }}
              aria-label="Дэлгэрэнгүй харах"
            >
              <Eye className="h-6 w-6" strokeWidth={1.75} />
            </Button>
          )}
          stickyHeader
          emptyMessage="Буцаалт олдсонгүй"
          footer={(rows) => {
            const totalQuantity = rows.reduce(
              (sum, row: ReturnRow) => sum + row.quantity,
              0,
            );
            const totalAmount = rows.reduce(
              (sum, row: ReturnRow) => sum + parseAmount(row.amount),
              0,
            );

            return (
              <TableRow className="border-t border-default  bg-[#E6EBF1] hover:bg-background-secondary">
                <TableCell className="px-4" />

                <TableCell
                  colSpan={columnsBeforeQuantity}
                  className="body-2-bold px-4 text-foreground"
                >
                  Нийт
                </TableCell>

                <TableCell className="body-2-bold text-right px-4 py-2 text-foreground">
                  {totalQuantity.toLocaleString("mn-MN")}
                </TableCell>

                <TableCell className="body-2-bold text-right px-4 py-2 text-foreground">
                  {totalAmount.toLocaleString("mn-MN")}₮
                </TableCell>

                {columnsAfterAmount > 0 && (
                  <TableCell colSpan={columnsAfterAmount} className="px-4" />
                )}

                <TableCell className="px-2" />
              </TableRow>
            );
          }}
        />
      </div>

      <TablePagination
        page={page}
        pageSize={pageSize}
        totalItems={data.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <OrderDetailsDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </div>
  );
}
