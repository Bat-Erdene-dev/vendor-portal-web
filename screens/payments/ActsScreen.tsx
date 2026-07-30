"use client";

import { useState, useMemo } from "react";

import {
  DataTable,
  StatusPill,
  type DataTableColumn,
  DataTableColumnGroup,
} from "@/components/data-table";
import { TablePagination } from "@/components/table-pagination";
import { FilterBar } from "@/components/filters/filter-bar";
import { type FilterOption } from "@/components/filters/checklist-filter";
import { Eye, DownloadIcon, UploadIcon } from "lucide-react";
import {
  OrderDetailsDialog,
  type OrderDetailsDialogOrder,
} from "@/components/order-details-dialog";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";

type OrderStatus = "delivered" | "prepared" | "pending";

interface OrderRow {
  id: string;
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  viewedDate: string;
  branch: string;
  supplier: string;
  amount: string;
  status: OrderStatus;
  orderQty: number;
  orderAmount: string;
  deliveryQty: number;
  deliveryAmount: string;
  diffQty: number;
  diffAmount: string;
}

function parseAmount(value: string) {
  return Number(value.replace(/[^\d-]/g, "")) || 0;
}

const PAYMENTS_COLUMN_OPTIONS: FilterOption[] = [
  { value: "debit", label: "Дебит" },
  { value: "credit", label: "Кредит" },
  { value: "keyword", label: "Гүйлгээт үгтэй" },
];

const orders: OrderRow[] = [
  {
    id: "1",
    orderNumber: "#12456",
    orderDate: "2026/03/12",
    deliveryDate: "2026/03/12",
    viewedDate: "2026/03/12",
    branch: "Салбарын нэр",
    supplier: "Нийлүүлэгчийн нэр",
    amount: "123,456,789₮",
    status: "delivered",
    orderQty: 120,
    orderAmount: "123,456,789₮",
    deliveryQty: 118,
    deliveryAmount: "121,200,000₮",
    diffQty: -2,
    diffAmount: "-2,256,789₮",
  },
  {
    id: "2",
    orderNumber: "#12457",
    orderDate: "2026/03/13",
    deliveryDate: "2026/03/14",
    viewedDate: "2026/03/13",
    branch: "Баянзүрх салбар",
    supplier: "АПУ ХК",
    amount: "89,000,000₮",
    status: "prepared",
    orderQty: 80,
    orderAmount: "89,000,000₮",
    deliveryQty: 80,
    deliveryAmount: "89,000,000₮",
    diffQty: 0,
    diffAmount: "0₮",
  },
  {
    id: "3",
    orderNumber: "#12458",
    orderDate: "2026/03/14",
    deliveryDate: "2026/03/15",
    viewedDate: "2026/03/14",
    branch: "Хан-Уул салбар",
    supplier: "MCS Coca-Cola",
    amount: "256,800,000₮",
    status: "pending",
    orderQty: 210,
    orderAmount: "256,800,000₮",
    deliveryQty: 0,
    deliveryAmount: "0₮",
    diffQty: -210,
    diffAmount: "-256,800,000₮",
  },
  {
    id: "4",
    orderNumber: "#12459",
    orderDate: "2026/03/15",
    deliveryDate: "2026/03/16",
    viewedDate: "2026/03/15",
    branch: "Сүхбаатар салбар",
    supplier: "Тэсо ХХК",
    amount: "65,300,000₮",
    status: "delivered",
    orderQty: 55,
    orderAmount: "65,300,000₮",
    deliveryQty: 55,
    deliveryAmount: "65,300,000₮",
    diffQty: 0,
    diffAmount: "0₮",
  },
  {
    id: "5",
    orderNumber: "#12460",
    orderDate: "2026/03/16",
    deliveryDate: "2026/03/17",
    viewedDate: "2026/03/16",
    branch: "Чингэлтэй салбар",
    supplier: "Номин Холдинг",
    amount: "145,900,000₮",
    status: "prepared",
    orderQty: 130,
    orderAmount: "145,900,000₮",
    deliveryQty: 125,
    deliveryAmount: "140,000,000₮",
    diffQty: -5,
    diffAmount: "-5,900,000₮",
  },
];

const statusLabel: Record<
  OrderStatus,
  {
    label: string;
    tone: "success" | "warning" | "info";
  }
> = {
  delivered: {
    label: "Хүргэлтэд гарсан",
    tone: "warning",
  },
  prepared: {
    label: "Захиалга бэлтгэгдэж байна",
    tone: "info",
  },
  pending: {
    label: "Хүлээгдэж байна",
    tone: "success",
  },
};

const orderColumns: DataTableColumn<OrderRow>[] = [
  { key: "branch", header: "Салбар" },
  { key: "orderNumber", header: "Захиалгын дугаар" },
  { key: "orderDate", header: "Захиалгын огноо" },
  { key: "orderQty", header: "Тоо ширхэг", align: "right" },
  { key: "orderAmount", header: "Үнийн дүн", align: "right" },
  { key: "deliveryQty", header: "Тоо ширхэг", align: "right" },
  { key: "deliveryAmount", header: "Үнийн дүн", align: "right" },
  { key: "diffQty", header: "Тоо ширхэг", align: "right" },
  { key: "diffAmount", header: "Үнийн дүн", align: "right" },
  {
    key: "status",
    header: "Төлөв",
    render: (row) => {
      const { label, tone } = statusLabel[row.status];
      return <StatusPill tone={tone} label={label} />;
    },
  },
];

const orderColumnGroups: DataTableColumnGroup[] = [
  { key: "order", header: "Захиалга", columnKeys: ["orderQty", "orderAmount"] },
  {
    key: "delivery",
    header: "Нийлүүлэлт",
    columnKeys: ["deliveryQty", "deliveryAmount"],
  },
  { key: "diff", header: "Зөрүү", columnKeys: ["diffQty", "diffAmount"] },
];

export default function DeductionsScreen() {
  const [selectedOrder, setSelectedOrder] =
    useState<OrderDetailsDialogOrder | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("active");

  const summaryStartIndex = orderColumns.findIndex((c) => c.key === "orderQty");
  const columnsBeforeSummary = summaryStartIndex;

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return orders.slice(start, start + pageSize);
  }, [page, pageSize]);

  const refresh = async function onClickRefresh() {
    console.log("hello refresh hiisen");
  };

  function mapOrderRowToDialogOrder(row: OrderRow): OrderDetailsDialogOrder {
    return {
      id: row.id,
      orderNumber: row.orderNumber,
      branch: row.branch,
      orderDate: row.orderDate,
      viewedDate: row.viewedDate,
      deliveryDate: row.deliveryDate,
      status: row.status,
      req_type: "",
      req_title: "",
      description: "",
      ref_image: "",
    };
  }

  const handleDownload = async () => {
    console.log("tataj avch baina aa .. ");
  };

  return (
    <div className="flex h-auto min-h-0 min-w-0 flex-col gap-6">
      <FilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        search={true}
        columnOptions={PAYMENTS_COLUMN_OPTIONS}
        showYearFilter={true}
        refresh={refresh}
        // onDownload={handleDownload}
      />
      <div className="flex-1 min-h-0 min-w-0">
        <DataTable
          columns={orderColumns}
          columnGroups={orderColumnGroups}
          data={paginatedOrders}
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
                setSelectedOrder(mapOrderRowToDialogOrder(row));
              }}
              aria-label="Дэлгэрэнгүй харах"
            >
              <Eye className="h-6 w-6" strokeWidth={1.75} />
            </Button>
          )}
          stickyHeader
          emptyMessage="Захиалга олдсонгүй"
          footer={(rows) => {
            const totalOrderQty = rows.reduce(
              (sum, row: OrderRow) => sum + row.orderQty,
              0,
            );
            const totalOrderAmount = rows.reduce(
              (sum, row: OrderRow) => sum + parseAmount(row.orderAmount),
              0,
            );
            const totalDeliveryQty = rows.reduce(
              (sum, row: OrderRow) => sum + row.deliveryQty,
              0,
            );
            const totalDeliveryAmount = rows.reduce(
              (sum, row: OrderRow) => sum + parseAmount(row.deliveryAmount),
              0,
            );
            const totalDiffQty = rows.reduce(
              (sum, row: OrderRow) => sum + row.diffQty,
              0,
            );
            const totalDiffAmount = rows.reduce(
              (sum, row: OrderRow) => sum + parseAmount(row.diffAmount),
              0,
            );

            return (
              <TableRow className="border-t border-default bg-[#E6EBF1] hover:bg-background-secondary">
                <TableCell className="px-4" />
                <TableCell
                  colSpan={columnsBeforeSummary}
                  className="body-2-bold px-4 text-foreground"
                >
                  Нийт
                </TableCell>
                <TableCell className="body-2-bold text-right px-4 py-2 text-foreground">
                  {totalOrderQty.toLocaleString("mn-MN")}
                </TableCell>
                <TableCell className="body-2-bold text-right px-4 py-2 text-foreground">
                  {totalOrderAmount.toLocaleString("mn-MN")}₮
                </TableCell>
                <TableCell className="body-2-bold text-right px-4 py-2 text-foreground">
                  {totalDeliveryQty.toLocaleString("mn-MN")}
                </TableCell>
                <TableCell className="body-2-bold text-right px-4 py-2 text-foreground">
                  {totalDeliveryAmount.toLocaleString("mn-MN")}₮
                </TableCell>
                <TableCell className="body-2-bold text-right px-4 py-2 text-foreground">
                  {totalDiffQty.toLocaleString("mn-MN")}
                </TableCell>
                <TableCell className="body-2-bold text-right px-4 py-2 text-foreground">
                  {totalDiffAmount.toLocaleString("mn-MN")}₮
                </TableCell>
                <TableCell className="px-4" />
                <TableCell className="px-2" />
              </TableRow>
            );
          }}
        />
      </div>
      <TablePagination
        page={page}
        pageSize={pageSize}
        totalItems={orders.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
      <OrderDetailsDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </div>
  );
}
