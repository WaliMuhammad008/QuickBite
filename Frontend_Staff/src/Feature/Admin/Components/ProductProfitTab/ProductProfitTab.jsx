import React, { useState, useEffect } from "react";
import ProductProfitFilterBar from "./Components/ProductProfitFilterBar";
import ProfitSummaryMetrics from "./Components/ProfitSummaryMetrics";
import ProductProfitTable from "./Components/ProductProfitTable";

const ProductProfitTab = () => {
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [profitData, setProfitData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "profit",
    direction: "desc",
  });
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (filter === "custom" && (!startDate || !endDate)) return;
    fetchData();
  }, [filter, startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let url = `${import.meta.env.VITE_API_BASE}/get_product_profit.php?range=${filter}`;
      if (filter === "custom") {
        url += `&start=${startDate}&end=${endDate}`;
      }
      const response = await fetch(url, { headers });
      const data = await response.json();
      if (data.success) {
        setProfitData(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching product profit data", error);
    }
    setLoading(false);
  };

  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const categories = [
    "all",
    ...new Set(profitData.map((item) => item.category).filter(Boolean)),
  ];
  const filteredByCategory = profitData.filter(
    (item) => categoryFilter === "all" || item.category === categoryFilter
  );

  const sortedData = [...filteredByCategory].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const totalQty = filteredByCategory.reduce(
    (acc, item) => acc + (Number(item.qty) || 0),
    0
  );
  const totalRevenue = filteredByCategory.reduce(
    (acc, item) => acc + (Number(item.revenue) || 0),
    0
  );
  const totalCost = filteredByCategory.reduce(
    (acc, item) => acc + (Number(item.cogs) || 0),
    0
  );
  const totalProfit = filteredByCategory.reduce(
    (acc, item) => acc + (Number(item.profit) || 0),
    0
  );
  const storeMargin =
    totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header & Filter Controls */}
      <ProductProfitFilterBar
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        filter={filter}
        setFilter={setFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {/* Top Financial KPI Cards */}
      <ProfitSummaryMetrics
        totalQty={totalQty}
        totalCost={totalCost}
        totalProfit={totalProfit}
        storeMargin={storeMargin}
      />

      {/* Profitability Table */}
      <ProductProfitTable
        loading={loading}
        sortedData={sortedData}
        handleSort={handleSort}
      />
    </div>
  );
};

export default ProductProfitTab;
