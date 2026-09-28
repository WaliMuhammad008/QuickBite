import React from "react";
import AnalyticsMetricCards from "./Components/AnalyticsMetricCards";
import SalesChart from "./Components/SalesChart";
import TopCategories from "./Components/TopCategories";
import AnalyticsDateFilterBar from "./Components/AnalyticsDateFilterBar";
import { useAnalytics } from "./hooks/useAnalytics.jsx";

const AnalyticsPanel = () => {
  const {
    statsFilter,
    setStatsFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    analyticsMetrics,
    chartData,
    topCategoriesData,
    refetch,
    isRefreshing,
  } = useAnalytics();

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header & Date Range Filter */}
      <AnalyticsDateFilterBar
        statsFilter={statsFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onRefresh={refetch}
        isRefreshing={isRefreshing}
      />

      {/* 1. Metric Summary Cards */}
      <AnalyticsMetricCards metrics={analyticsMetrics} />

      {/* 2. Grid for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <SalesChart
            chartData={chartData}
            filter={statsFilter}
            setFilter={setStatsFilter}
          />
        </div>
        <div className="lg:col-span-4">
          <TopCategories data={topCategoriesData} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
