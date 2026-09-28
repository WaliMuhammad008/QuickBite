import React, { useState } from "react";
import {
  FaStar,
  FaXmark,
  FaSpinner,
  FaCircleCheck,
  FaShieldHalved,
  FaFire,
  FaBolt,
  FaUtensils,
  FaBoxOpen,
  FaCoins,
  FaPepperHot,
  FaBowlFood,
  FaCommentDots,
} from "react-icons/fa6";
import toast from "react-hot-toast";
import { API_BASE } from "../../config/api";

const QUICK_TAG_ITEMS = [
  { id: "Hot & Fresh", label: "Hot & Fresh", icon: FaFire, color: "text-orange-500" },
  { id: "Fast Delivery", label: "Fast Delivery", icon: FaBolt, color: "text-amber-500" },
  { id: "Super Tasty", label: "Super Tasty", icon: FaUtensils, color: "text-emerald-500" },
  { id: "Good Packaging", label: "Good Packaging", icon: FaBoxOpen, color: "text-blue-500" },
  { id: "Value for Money", label: "Value for Money", icon: FaCoins, color: "text-yellow-500" },
  { id: "Perfect Spice", label: "Perfect Spice", icon: FaPepperHot, color: "text-red-500" },
  { id: "Generous Portion", label: "Generous Portion", icon: FaBowlFood, color: "text-purple-500" },
];

const SENTIMENT_LABELS = {
  1: "Poor Experience",
  2: "Needs Improvement",
  3: "Average / Okay",
  4: "Delicious & Fresh",
  5: "Outstanding Taste & Quality",
};

export default function OrderReviewModal({ order, isOpen, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedTags, setSelectedTags] = useState(["Hot & Fresh", "Super Tasty"]);
  const [itemRatings, setItemRatings] = useState(() => {
    if (order?.items && Array.isArray(order.items)) {
      const initial = {};
      order.items.forEach((item) => {
        const id = item.menu_item_id || item.item_id || item.id;
        if (id) initial[id] = 5;
      });
      return initial;
    }
    return {};
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleItemRatingChange = (itemId, val) => {
    setItemRatings((prev) => ({ ...prev, [itemId]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Build item ratings array
      const itemRatingsList = (order.items || []).map((it) => {
        const id = it.menu_item_id || it.item_id || it.id;
        return {
          menu_id: id,
          item_name: it.title || it.name || it.item_name || "Dish",
          rating: itemRatings[id] || rating,
        };
      });

      const payload = {
        order_id: order.id,
        customer_id: order.customer_id || null,
        customer_name: order.customer_name || "Verified Buyer",
        customer_mobile: order.customer_mobile || order.phone || order.mobile || null,
        order_type: order.order_type || order.order_mode || "Delivery",
        rating: rating,
        review_text: reviewText.trim(),
        tags: selectedTags,
        item_ratings: itemRatingsList,
      };

      const res = await fetch(`${API_BASE}/submit_review.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Review posted! Thank you for your feedback.");
        if (onReviewSubmitted) {
          onReviewSubmitted(order.id, data.review);
        }
        onClose();
      } else {
        toast.error(data.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Review submission error:", err);
      toast.error("Network error while submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentDisplayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#121216] border border-zinc-200 dark:border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 flex flex-col max-h-[90vh] transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══════════════════════════════════════
            TOP HEADER
            ═══════════════════════════════════════ */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/90 dark:via-zinc-950 dark:to-[#121216] border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <FaShieldHalved className="text-[10px]" />
                <span>Verified Buyer Review</span>
              </span>
            </div>
            <h3 className="font-['Oswald',sans-serif] font-bold text-lg sm:text-xl text-zinc-900 dark:text-white uppercase m-0">
              Rate Order #{order.id}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
            aria-label="Close review modal"
          >
            <FaXmark className="text-xs" />
          </button>
        </div>

        {/* ═══════════════════════════════════════
            SCROLLABLE FORM BODY (Custom Scrollbar)
            ═══════════════════════════════════════ */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-amber-500/30 hover:[&::-webkit-scrollbar-thumb]:bg-amber-500/60 [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {/* 1. Main 5-Star Interactive Rating */}
          <div className="text-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
              Overall Experience
            </span>

            {/* Stars */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-2xl sm:text-3xl transition-transform hover:scale-125 focus:outline-none bg-transparent border-none cursor-pointer p-1"
                >
                  <FaStar
                    className={
                      star <= currentDisplayRating
                        ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.45)]"
                        : "text-zinc-300 dark:text-zinc-700"
                    }
                  />
                </button>
              ))}
            </div>

            {/* Clean Sentiment Label (No Emojis) */}
            <p className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 min-h-[18px]">
              {SENTIMENT_LABELS[currentDisplayRating]}
            </p>
          </div>

          {/* 2. Quick Tag Pills with Sharp Vector Icons */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              What stood out about your meal?
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAG_ITEMS.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                const IconComponent = tag.icon;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-amber-500 text-black border-amber-500 font-bold shadow-md shadow-amber-500/20 scale-102"
                        : "bg-zinc-100 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50"
                    }`}
                  >
                    <IconComponent className={isSelected ? "text-black" : tag.color} />
                    <span>{tag.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Item-Level Dish Rating Cards */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <FaUtensils className="text-amber-500 text-[10px]" />
                <span>Rate Individual Dishes</span>
              </label>

              <div className="space-y-2">
                {order.items.map((item, idx) => {
                  const id = item.menu_item_id || item.item_id || item.id || idx;
                  const itemStar = itemRatings[id] || 5;

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                        {item.title || item.name || item.item_name}
                      </span>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleItemRatingChange(id, s)}
                            className="text-sm bg-transparent border-none cursor-pointer p-0.5 hover:scale-115 transition-transform"
                          >
                            <FaStar
                              className={
                                s <= itemStar
                                  ? "text-amber-400"
                                  : "text-zinc-300 dark:text-zinc-700"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Written Feedback Textarea */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
              <FaCommentDots className="text-amber-500 text-[11px]" />
              <span>Written Review (Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Share details of your feast (e.g. flavor, crispiness, packaging, or delivery)..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-amber-500 rounded-xl text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all resize-none"
            />
          </div>

          {/* 5. Mobile-Safe Submit Container */}
          <div className="pt-2 sticky bottom-0 bg-white/95 dark:bg-[#121216]/95 backdrop-blur-sm pb-1">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Oswald',sans-serif] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50 border-none"
            >
              {submitting ? (
                <FaSpinner className="animate-spin text-sm" />
              ) : (
                <FaCircleCheck className="text-sm" />
              )}
              <span>{submitting ? "Submitting Review..." : "Submit Verified Review"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
