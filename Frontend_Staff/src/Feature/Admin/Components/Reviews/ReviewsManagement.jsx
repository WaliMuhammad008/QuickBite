import React, { useState, useEffect, useCallback } from "react";
import {
  FaStar,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaEyeSlash,
  FaTrashAlt,
  FaSpinner,
  FaThumbtack,
  FaQuoteLeft,
  FaTag,
  FaUser,
  FaReceipt,
  FaSync,
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    total_reviews: 0,
    approved_reviews: 0,
    hidden_reviews: 0,
    featured_reviews: 0,
    average_rating: 5.0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'approved' | 'hidden' | 'featured'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost/quickibite/BB backend/api";

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin_reviews.php`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast.error(data.message || "Failed to load reviews.");
      }
    } catch (err) {
      console.error("Admin reviews fetch error:", err);
      toast.error("Could not connect to reviews API.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Update Status (Approved / Hidden)
  const handleUpdateStatus = async (reviewId, newStatus) => {
    setActionLoadingId(reviewId);
    const targetReview = reviews.find((r) => r.id === reviewId);
    const currentFeatured = targetReview?.is_featured || 0;

    try {
      const res = await fetch(`${API_BASE}/admin_reviews.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reviewId,
          status: newStatus,
          is_featured: currentFeatured,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Review marked as ${newStatus}.`);
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
        );
      } else {
        toast.error(data.message || "Failed to update review status.");
      }
    } catch (err) {
      console.error("Update review error:", err);
      toast.error("Network error updating review.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Featured / Pin
  const handleToggleFeatured = async (reviewId, currentFeatured) => {
    setActionLoadingId(reviewId);
    const newFeatured = currentFeatured === 1 ? 0 : 1;
    try {
      const res = await fetch(`${API_BASE}/admin_reviews.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reviewId,
          action: "toggle_featured",
          is_featured: newFeatured,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(newFeatured === 1 ? "Review pinned to Featured!" : "Review unpinned.");
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, is_featured: newFeatured } : r))
        );
      } else {
        toast.error(data.message || "Failed to toggle featured.");
      }
    } catch (err) {
      console.error("Toggle featured error:", err);
      toast.error("Network error.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to permanently delete this customer review?")) {
      return;
    }

    setActionLoadingId(reviewId);
    try {
      const res = await fetch(`${API_BASE}/admin_reviews.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId, action: "delete" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Review deleted.");
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } else {
        toast.error(data.message || "Failed to delete review.");
      }
    } catch (err) {
      console.error("Delete review error:", err);
      toast.error("Network error.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered List
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      (r.customer_name && r.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.order_id && r.order_id.toString().includes(searchTerm)) ||
      (r.review_text && r.review_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.tags && r.tags.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "approved") return r.status === "approved";
    if (statusFilter === "hidden") return r.status === "hidden";
    if (statusFilter === "featured") return parseInt(r.is_featured, 10) === 1;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* ═══════════════════════════════════════
          HEADER & METRIC CARDS
          ═══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Oswald',sans-serif] uppercase tracking-wide text-slate-900 dark:text-white m-0">
            Verified Customer Reviews
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchReviews}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700/80 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <FaSync className={loading ? "animate-spin text-amber-500 dark:text-amber-400" : "text-slate-400 dark:text-neutral-400"} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-neutral-800 shadow-sm space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
            <FaStar className="text-amber-500 dark:text-amber-400" /> Average Rating
          </span>
          <div className="text-2xl sm:text-3xl font-black font-['Oswald',sans-serif] text-amber-600 dark:text-amber-400">
            {stats.average_rating} / 5.0
          </div>
          <p className="text-[11px] text-slate-400 dark:text-neutral-500">Store-wide aggregate</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-neutral-800 shadow-sm space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
            <FaReceipt className="text-blue-500 dark:text-blue-400" /> Total Feedback
          </span>
          <div className="text-2xl sm:text-3xl font-black font-['Oswald',sans-serif] text-slate-900 dark:text-white">
            {stats.total_reviews}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-neutral-500">Verified buyer submissions</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-neutral-800 shadow-sm space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
            <FaCheckCircle className="text-emerald-500 dark:text-emerald-400" /> Public Approved
          </span>
          <div className="text-2xl sm:text-3xl font-black font-['Oswald',sans-serif] text-emerald-600 dark:text-emerald-400">
            {stats.approved_reviews}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-neutral-500">Live on customer store</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-neutral-800 shadow-sm space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
            <FaThumbtack className="text-purple-500 dark:text-purple-400" /> Pinned Featured
          </span>
          <div className="text-2xl sm:text-3xl font-black font-['Oswald',sans-serif] text-purple-600 dark:text-purple-400">
            {stats.featured_reviews}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-neutral-500">Highlighted social proof</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SEARCH & FILTER CONTROLS
          ═══════════════════════════════════════ */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 text-xs" />
          <input
            type="text"
            placeholder="Search by customer, order #ID, tag, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 focus:border-amber-500 rounded-xl text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "all", label: `All (${reviews.length})` },
            { id: "approved", label: "Approved" },
            { id: "featured", label: "Pinned Featured" },
            { id: "hidden", label: "Hidden" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                statusFilter === f.id
                  ? "bg-amber-500 text-neutral-950 border-amber-500 shadow-xs"
                  : "bg-slate-100 dark:bg-neutral-950 text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-neutral-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          REVIEWS LIST / CARDS
          ═══════════════════════════════════════ */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 dark:text-neutral-500 flex flex-col items-center justify-center gap-3">
          <FaSpinner className="text-3xl animate-spin text-amber-500 dark:text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Loading customer feedback...
          </span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-20 text-center text-slate-400 dark:text-neutral-500 border border-dashed border-slate-200 dark:border-neutral-800 rounded-3xl p-8 bg-slate-50/50 dark:bg-neutral-900/30 space-y-2">
          <FaStar className="text-4xl text-slate-300 dark:text-neutral-700 mx-auto" />
          <h4 className="font-['Oswald',sans-serif] font-bold text-base text-slate-900 dark:text-white uppercase">
            No Reviews Found
          </h4>
          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
            {searchTerm
              ? `No feedback matching "${searchTerm}". Try resetting your filter.`
              : "No verified customer reviews have been recorded yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => {
            const isLoading = actionLoadingId === rev.id;
            const isFeatured = parseInt(rev.is_featured, 10) === 1;
            const tagsList = rev.tags ? rev.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
            let itemRatingsList = [];
            if (rev.item_ratings) {
              try {
                itemRatingsList = typeof rev.item_ratings === "string" ? JSON.parse(rev.item_ratings) : rev.item_ratings;
              } catch {
                itemRatingsList = [];
              }
            }

            return (
              <div
                key={rev.id}
                className={`p-5 rounded-3xl bg-white dark:bg-[#121216] border transition-all flex flex-col justify-between gap-4 shadow-sm relative ${
                  isFeatured
                    ? "border-amber-500/50 bg-gradient-to-b from-amber-500/[0.04] to-white dark:to-[#121216]"
                    : rev.status === "hidden"
                    ? "border-slate-200 dark:border-neutral-800 opacity-60"
                    : "border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700"
                }`}
              >
                {/* Top Row: User & Order Info + Star Rating */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm font-mono shrink-0">
                        <FaUser />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-['Oswald',sans-serif] font-bold text-sm text-slate-900 dark:text-white uppercase m-0">
                            {rev.customer_name || "Verified Foodie"}
                          </h4>
                          {isFeatured && (
                            <span className="text-[9px] font-bold font-mono uppercase bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1">
                              <FaThumbtack className="text-[8px]" /> PINNED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-neutral-500 font-mono mt-0.5">
                          <span>Order #{rev.order_id}</span>
                          <span>•</span>
                          <span>{rev.created_at ? new Date(rev.created_at).toLocaleDateString() : "Recent"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Badges */}
                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar
                          key={s}
                          className={`text-xs ${
                            s <= rev.rating ? "text-amber-500 dark:text-amber-400" : "text-slate-200 dark:text-neutral-700"
                          }`}
                        />
                      ))}
                      <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400 ml-1">
                        {rev.rating}.0
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  {rev.review_text && (
                    <div className="my-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-neutral-900/70 border border-slate-200 dark:border-neutral-800/60 text-xs text-slate-700 dark:text-neutral-300 leading-relaxed italic">
                      <FaQuoteLeft className="text-[9px] text-amber-500/60 mr-1 inline" />
                      "{rev.review_text}"
                    </div>
                  )}

                  {/* Tags */}
                  {tagsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tagsList.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-neutral-400 border border-slate-200 dark:border-neutral-800 text-[10px] font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Item-level Ratings Breakdown */}
                  {itemRatingsList.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-neutral-800/60 space-y-1 text-xs">
                      <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wide block">
                        Dish Ratings:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {itemRatingsList.map((it, i) => (
                          <div
                            key={i}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800/40 text-[11px] text-slate-700 dark:text-neutral-300 flex items-center gap-1.5"
                          >
                            <span className="font-medium truncate max-w-[120px]">
                              {it.item_name}
                            </span>
                            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                              ⭐ {it.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Row Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono border ${
                        rev.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>

                  {/* Moderation Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Toggle Pin / Featured */}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleToggleFeatured(rev.id, isFeatured ? 1 : 0)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                        isFeatured
                          ? "bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-300 border-purple-500/40"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-neutral-700"
                      }`}
                      title={isFeatured ? "Unpin review" : "Pin to featured"}
                    >
                      <FaThumbtack className="text-[10px]" />
                      <span>{isFeatured ? "Pinned" : "Pin"}</span>
                    </button>

                    {/* Approve / Hide Toggle */}
                    {rev.status === "approved" ? (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleUpdateStatus(rev.id, "hidden")}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-neutral-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Hide from public view"
                      >
                        <FaEyeSlash className="text-[10px]" />
                        <span>Hide</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleUpdateStatus(rev.id, "approved")}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Approve for public view"
                      >
                        <FaCheckCircle className="text-[10px]" />
                        <span>Approve</span>
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDeleteReview(rev.id)}
                      className="p-1.5 rounded-xl text-slate-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent"
                      title="Delete review"
                    >
                      <FaTrashAlt className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
