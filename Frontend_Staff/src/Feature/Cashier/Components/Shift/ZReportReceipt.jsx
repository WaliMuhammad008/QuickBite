import React from "react";
import ShiftKpiCards from "./ShiftKpiCards";
import ShiftBreakdownTable from "./ShiftBreakdownTable";

export default function ZReportReceipt({
  cashierName = "Cashier",
  totalSales = 0,
  cashSales = 0,
  digitalSales = 0,
  paidOrders = [],
  unpaidOrders = [],
  liveOrders = [],
}) {
  return (
    <div id="z-report-printable" className="w-full">
      <ShiftKpiCards
        totalSales={totalSales}
        paidOrdersCount={paidOrders.length}
        cashSales={cashSales}
        digitalSales={digitalSales}
        totalOrdersCount={liveOrders.length}
        unpaidOrdersCount={unpaidOrders.length}
      />
      <ShiftBreakdownTable
        liveOrders={liveOrders}
        paidOrders={paidOrders}
        unpaidOrders={unpaidOrders}
        totalSales={totalSales}
        cashSales={cashSales}
      />
    </div>
  );
}
