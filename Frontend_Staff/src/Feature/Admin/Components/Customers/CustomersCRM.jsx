import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaUsers,
  FaUserCheck,
  FaUserSlash,
  FaCoins,
  FaSearch,
  FaSync,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaShoppingBag,
  FaToggleOn,
  FaToggleOff,
  FaShieldAlt,
  FaGoogle,
} from "react-icons/fa";
import ServerPaginationControls from "../SharedComponents/ServerPaginationControls";
import { apiFetch } from "../../../../utils/apiHelper";

const PAGE_SIZE = 25;

const CustomersCRM = () => {
  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [stats, setStats] = useState({
    total_customers: 0,
    active_customers: 0,
    blocked_customers: 0,
    total_revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'blocked'
  const [updatingId, setUpdatingId] = useState(null);

  const customersRef = useRef(customers);
  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);

  const fetchCustomers = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else if (customersRef.current.length === 0) setLoading(true);

    try {
      const response = await apiFetch(
        `get_admin_customers.php?limit=${PAGE_SIZE}&offset=0`
      );
      const result = await response.json();

      if (result && result.success) {
        const fetched = result.customers || [];
        setCustomers(fetched);
        const sTotal = result.total || fetched.length;
        setTotalCount(sTotal);
        setHasMore(result.has_more !== undefined ? result.has_more : fetched.length < sTotal);
        if (result.stats) {
          setStats(result.stats);
        }
      } else {
        toast.error(result.message || "Failed to fetch customers.");
      }
    } catch (err) {
      console.error("CRM fetch error:", err);
      toast.error("Network error while loading customers.");
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const currentOffset = customers.length;
      const response = await apiFetch(
        `get_admin_customers.php?limit=${PAGE_SIZE}&offset=${currentOffset}`
      );
      const result = await response.json();

      if (result && result.success) {
        const fetched = result.customers || [];
        setCustomers((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newUnique = fetched.filter((c) => !existingIds.has(c.id));
          const merged = [...prev, ...newUnique];
          setHasMore(merged.length < (result.total || totalCount));
          return merged;
        });
        if (result.total !== undefined) {
          setTotalCount(result.total);
        }
      }
    } catch (err) {
      console.error("CRM Load More error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const refreshSearch = useCallback(async () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    try {
      const response = await apiFetch(`get_admin_customers.php?search=${encodeURIComponent(trimmed)}`);
      const result = await response.json();
      if (result && result.success && Array.isArray(result.customers)) {
        setSearchResults(result.customers);
      }
    } catch (err) {
      console.error("Customers refresh search error:", err);
    }
  }, [searchTerm]);

  // Server-side debounced search across all database records
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const response = await apiFetch(`get_admin_customers.php?search=${encodeURIComponent(trimmed)}`);
        const result = await response.json();
        if (result && result.success && Array.isArray(result.customers)) {
          setSearchResults(result.customers);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Customers search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleToggleStatus = async (customer) => {
    const newStatus = customer.is_active == 1 ? 0 : 1;
    setUpdatingId(customer.id);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_admin_customers.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_id: customer.id,
            is_active: newStatus,
          }),
        }
      );
      const result = await response.json();

      if (result.success) {
        toast.success(
          `Customer ${customer.full_name} is now ${
            newStatus === 1 ? "Active" : "Blocked"
          }.`
        );
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customer.id ? { ...c, is_active: newStatus } : c
          )
        );
        if (searchResults) {
          setSearchResults((prev) =>
            prev.map((c) =>
              c.id === customer.id ? { ...c, is_active: newStatus } : c
            )
          );
        }
        setStats((prev) => ({
          ...prev,
          active_customers:
            newStatus === 1
              ? prev.active_customers + 1
              : prev.active_customers - 1,
          blocked_customers:
            newStatus === 0
              ? prev.blocked_customers + 1
              : prev.blocked_customers - 1,
        }));
      } else {
        toast.error(result.message || "Failed to update customer status.");
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Error updating customer.");
    } finally {
      setUpdatingId(null);
    }
  };

  const activeCustomers = searchResults !== null ? searchResults : customers;

  // Filter Logic
  const filteredCustomers = activeCustomers.filter((c) => {
    const matchSearch =
      (c.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || "").includes(searchTerm) ||
      (c.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (statusFilter === "active") return c.is_active == 1;
    if (statusFilter === "blocked") return c.is_active == 0;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121216] border border-slate-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center text-lg">
              <FaUsers />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white m-0">
                Customer Relations & Accounts
              </h1>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Manage registered customer profiles, track lifetime orders, and control access permissions.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchCustomers(true)}
          disabled={refreshing}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 border border-slate-200 dark:border-white/10 cursor-pointer disabled:opacity-50"
        >
          <FaSync className={refreshing ? "animate-spin text-amber-500 dark:text-amber-400" : "text-slate-400 dark:text-neutral-400"} />
          <span>{refreshing ? "Refreshing..." : "Refresh List"}</span>
        </button>
      </div>

      {/* ── Metric KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wide">
              Total Accounts
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
              <FaUsers />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {stats.total_customers}
          </p>
          <div className="h-1 w-full bg-slate-100 dark:bg-neutral-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full w-full"></div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              Active Members
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
              <FaUserCheck />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            {stats.active_customers}
          </p>
          <div className="h-1 w-full bg-slate-100 dark:bg-neutral-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{
                width: `${
                  stats.total_customers > 0
                    ? (stats.active_customers / stats.total_customers) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
              Blocked / Suspended
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center text-sm">
              <FaUserSlash />
            </div>
          </div>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-2 font-mono">
            {stats.blocked_customers}
          </p>
          <div className="h-1 w-full bg-slate-100 dark:bg-neutral-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full"
              style={{
                width: `${
                  stats.total_customers > 0
                    ? (stats.blocked_customers / stats.total_customers) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
              Lifetime User Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
              <FaCoins />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2 font-mono">
            Rs. {Number(stats.total_revenue || 0).toLocaleString()}
          </p>
          <div className="h-1 w-full bg-slate-100 dark:bg-neutral-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full w-full"></div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
            <FaSearch className="text-xs" />
          </div>
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700/80 focus:border-amber-500 rounded-xl text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Accounts" },
            { id: "active", label: "Active Only" },
            { id: "blocked", label: "Blocked Only" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                statusFilter === tab.id
                  ? "bg-amber-500 text-neutral-950 border-amber-500 shadow-xs"
                  : "bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-neutral-700/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Customer Table ── */}
      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 dark:text-neutral-500 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold uppercase tracking-wider">
              Loading Customer Profiles...
            </span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-neutral-500">
            <FaUsers className="text-4xl text-slate-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-neutral-300">
              No customers found
            </p>
            <p className="text-xs text-slate-500 dark:text-neutral-500 mt-1">
              Try adjusting your search query or filter tags.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-neutral-900/90 border-b border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 uppercase font-mono text-[11px] tracking-wider">
                  <th className="py-3.5 px-4 font-bold">Customer</th>
                  <th className="py-3.5 px-4 font-bold">Contact Info</th>
                  <th className="py-3.5 px-4 font-bold">Joined</th>
                  <th className="py-3.5 px-4 font-bold text-center">Orders</th>
                  <th className="py-3.5 px-4 font-bold text-right">Lifetime Spend</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-neutral-300">
                {filteredCustomers.map((c) => {
                  const initials = (c.full_name || "Customer")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  const isActive = c.is_active == 1;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-black text-amber-600 dark:text-amber-400 shrink-0 overflow-hidden">
                            {c.avatar_url ? (
                              <img
                                src={c.avatar_url}
                                alt={c.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                {c.full_name}
                              </span>
                              {c.google_id && (
                                <span title="Google OAuth Verified">
                                  <FaGoogle className="text-[10px] text-blue-500 dark:text-blue-400" />
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
                              ID: #{c.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        {c.phone ? (
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-neutral-300 font-mono text-[11px]">
                            <FaPhoneAlt className="text-[9px] text-amber-500 dark:text-amber-400" />
                            <span>{c.phone}</span>
                          </div>
                        ) : null}
                        {c.email ? (
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400 text-[11px]">
                            <FaEnvelope className="text-[9px] text-slate-400 dark:text-neutral-500" />
                            <span className="truncate max-w-[180px]">
                              {c.email}
                            </span>
                          </div>
                        ) : null}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-neutral-400 text-[11px] font-mono">
                        <div className="flex items-center gap-1.5">
                          <FaCalendarAlt className="text-[10px] text-slate-400 dark:text-neutral-500" />
                          <span>
                            {c.created_at
                              ? new Date(c.created_at).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Total Orders */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-neutral-200 font-mono font-bold text-xs">
                          <FaShoppingBag className="text-[10px] text-amber-500 dark:text-amber-400" />
                          {c.total_orders || 0}
                        </span>
                      </td>

                      {/* Lifetime Spend */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-amber-600 dark:text-amber-400">
                        Rs. {Number(c.lifetime_spend || 0).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400"></span>
                            Blocked
                          </span>
                        )}
                      </td>

                      {/* Actions Toggle */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c)}
                          disabled={updatingId === c.id}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer border ${
                            isActive
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <FaToggleOn className="text-sm" />
                              <span>Block</span>
                            </>
                          ) : (
                            <>
                              <FaToggleOff className="text-sm" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server Pagination & Load More Controls */}
        {customers.length > 0 && (
          <ServerPaginationControls
            loadedCount={customers.length}
            totalCount={totalCount}
            filteredCount={
              searchTerm || statusFilter !== "all"
                ? filteredCustomers.length
                : null
            }
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            itemLabel="customers"
            isSearching={searchTerm.trim().length > 0}
          />
        )}
      </div>
    </div>
  );
};

export default CustomersCRM;
