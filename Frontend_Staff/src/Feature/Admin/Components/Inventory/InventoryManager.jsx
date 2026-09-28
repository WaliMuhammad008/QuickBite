import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FaBoxes, FaFire } from "react-icons/fa";
import Swal from "sweetalert2";

// Components
import InventoryStats from "./Components/InventoryStats";
import InventoryControls from "./Components/InventoryControls";
import InventoryTable from "./Components/InventoryTable";
import InventoryModal from "./Components/InventoryModal";
import WastageAnalytics from "./Components/WastageAnalytics";
import ServerPaginationControls from "../SharedComponents/ServerPaginationControls";
import { apiFetch } from "../../../../utils/apiHelper";
import { staffSocket } from "../../../../utils/socket";

const PAGE_SIZE = 25;

const InventoryManager = () => {
  const queryClient = useQueryClient();
  const [mainView, setMainView] = useState("stock"); // "stock" | "wastage"
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [serverStats, setServerStats] = useState({ total_items: 0, low_stock: 0, total_value: "0.00" });

  const productsRef = useRef(products);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const defaultForm = {
    name: "",
    price: "",
    stock: "",
    unit: "kg",
    threshold: "10",
  };
  const [form, setForm] = useState(defaultForm);

  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchInventoryBatch = useCallback(async (offset = 0, isAppend = false) => {
    if (isAppend) {
      setIsLoadingMore(true);
    } else if (productsRef.current.length === 0) {
      setIsLoading(true);
    }

    try {
      const response = await apiFetch(`inventory_api.php?limit=${PAGE_SIZE}&offset=${offset}`);
      const result = await response.json();

      if (result.success || result.status === "success") {
        const fetched = Array.isArray(result.items) ? result.items : (Array.isArray(result) ? result : []);
        const sTotal = result.total !== undefined ? result.total : fetched.length;
        setTotalCount(sTotal);
        if (result.stats) {
          setServerStats(result.stats);
        }

        if (isAppend) {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newUnique = fetched.filter((p) => !existingIds.has(p.id));
            const merged = [...prev, ...newUnique];
            setHasMore(merged.length < sTotal);
            return merged;
          });
        } else {
          setProducts(fetched);
          setHasMore(result.has_more !== undefined ? result.has_more : fetched.length < sTotal);
        }
      }
    } catch (err) {
      console.error("Inventory fetch error:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryBatch(0, false);
  }, [fetchInventoryBatch]);

  const refreshSearch = useCallback(async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    try {
      const response = await apiFetch(`inventory_api.php?search=${encodeURIComponent(trimmed)}`);
      const result = await response.json();
      if (result && (result.success || result.status === "success")) {
        const items = Array.isArray(result.items) ? result.items : (Array.isArray(result) ? result : []);
        setSearchResults(items);
      }
    } catch (err) {
      console.error("Refresh search error:", err);
    }
  }, [searchQuery]);

  // Server-side debounced search across all database records
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const response = await apiFetch(`inventory_api.php?search=${encodeURIComponent(trimmed)}`);
        const result = await response.json();
        if (result && (result.success || result.status === "success")) {
          const items = Array.isArray(result.items) ? result.items : (Array.isArray(result) ? result : []);
          setSearchResults(items);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Inventory search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchInventoryBatch(products.length, true);
    }
  };

  const totalItems = serverStats.total_items || totalCount;
  const lowStock = serverStats.low_stock;
  const totalValue = serverStats.total_value;

  const activeProducts = searchResults !== null ? searchResults : products;

  const filteredProducts = activeProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const s = parseFloat(product.stock || 0);
    const t = parseFloat(product.threshold || 10);

    if (activeTab === "In Stock") return s > t;
    if (activeTab === "Low Stock") return s <= t && s > 0;
    if (activeTab === "Out of Stock") return s === 0;
    return true;
  });

  const sortedAndFilteredProducts = useMemo(() => {
    let sortableItems = [...filteredProducts];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "price" || sortConfig.key === "stock") {
          aValue = parseFloat(aValue || 0);
          bValue = parseFloat(bValue || 0);
        } else {
          aValue = aValue ? aValue.toString().toLowerCase() : "";
          bValue = bValue ? bValue.toString().toLowerCase() : "";
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProducts, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setForm(defaultForm);
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      unit: product.unit || "kg",
      threshold: product.threshold || "10",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Inventory Item?",
      text: "Deleting this ingredient will also remove all associated menu items and recipes. Are you sure you want to proceed?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete item & linked recipes!",
      background: "#171717",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        const response = await apiFetch(`inventory_api.php?id=${id}`, {
          method: "DELETE",
        });
        const res = await response.json();
        if (res.status === "success" || res.success) {
          fetchInventoryBatch(0, false);
          if (searchQuery.trim()) refreshSearch();
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
          queryClient.invalidateQueries({ queryKey: ['menu'] });
          queryClient.invalidateQueries({ queryKey: ['menu_items'] });
          staffSocket.emit("refresh_menu");
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: res.message || "Inventory item and associated menu items deleted.",
            timer: 2000,
            showConfirmButton: false,
            background: "#171717",
            color: "#fff",
          });
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleSave = async (e, customData) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    setIsSaving(true);
    try {
      const isEvent = e && typeof e.preventDefault === "function";
      const dataToSave = customData || (!isEvent && e && typeof e === "object" ? e : form);
      const method = editingProduct ? "PUT" : "POST";
      const payload = editingProduct ? { ...dataToSave, id: editingProduct.id } : dataToSave;

      const response = await apiFetch("inventory_api.php", {
        method,
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.status === "success") {
        fetchInventoryBatch(0, false);
        if (searchQuery.trim()) refreshSearch();
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        queryClient.invalidateQueries({ queryKey: ['menu'] });
        staffSocket.emit("refresh_menu");
        setIsModalOpen(false);
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Inventory updated successfully.",
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "Failed to save to database.",
          background: "#171717",
          color: "#fff",
        });
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-12 w-full max-w-full overflow-x-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-amber-500 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-zinc-900 dark:text-white m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Inventory & Raw Materials Control
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-neutral-400 m-0 mt-0.5 font-sans">
            Track ingredients, unit costs, live stock depletion, and role-based wastage loss audits.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-neutral-800/80 rounded-xl border border-zinc-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setMainView("stock")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider font-['Oswald',sans-serif] flex items-center gap-1.5 cursor-pointer transition-all ${
              mainView === "stock"
                ? "bg-amber-500 text-neutral-950 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <FaBoxes className="text-xs" />
            <span>Raw Stock & Valuation</span>
          </button>
          <button
            type="button"
            onClick={() => setMainView("wastage")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider font-['Oswald',sans-serif] flex items-center gap-1.5 cursor-pointer transition-all ${
              mainView === "wastage"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400"
            }`}
          >
            <FaFire className="text-xs" />
            <span>Wastage & Loss Audit</span>
          </button>
        </div>
      </div>

      {mainView === "wastage" ? (
        <WastageAnalytics />
      ) : (
        <>
          {isLoading && (
            <div className="py-12 text-center text-xs text-zinc-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
              Loading Raw Inventory...
            </div>
          )}

          {/* KPI Stats */}
          <InventoryStats
            totalItems={totalItems}
            lowStock={lowStock}
            totalValue={totalValue}
          />

          {/* Filter Tabs & Search */}
          <InventoryControls
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddClick={handleAddClick}
          />

          {/* Inventory Table */}
          <InventoryTable
            products={sortedAndFilteredProducts}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            requestSort={requestSort}
            sortConfig={sortConfig}
          />

          {/* Server-side Pagination Load More */}
          <ServerPaginationControls
            loadedCount={products.length}
            totalCount={totalCount}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            itemLabel="items"
            isSearching={searchQuery.trim().length > 0}
          />
        </>
      )}

      {/* Modal */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProduct={editingProduct}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};

export default InventoryManager;
