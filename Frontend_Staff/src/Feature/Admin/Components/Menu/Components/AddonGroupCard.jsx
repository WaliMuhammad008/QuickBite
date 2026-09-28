import React from "react";
import { FaTrash, FaEdit, FaLayerGroup, FaGlassWhiskey, FaUtensils, FaFire } from "react-icons/fa";

export default function AddonGroupCard({
  mapGroup,
  openModal,
  handleDelete,
}) {
  const targetCategory = mapGroup.target_category || mapGroup.parent_category_name || "General";

  const getCategoryEmoji = (name) => {
    const n = (name || "").toLowerCase();
    if (n.includes("burger")) return "🍔";
    if (n.includes("pizza")) return "🍕";
    if (n.includes("broast") || n.includes("fried") || n.includes("chicken")) return "🍗";
    if (n.includes("wrap") || n.includes("shawarma")) return "🌯";
    if (n.includes("deal")) return "🔥";
    return "🍽️";
  };

  const getGroupIcon = (title, iconType) => {
    const t = (title || "").toLowerCase();
    const it = (iconType || "").toLowerCase();
    if (it === "drink" || t.includes("drink") || t.includes("beverage")) {
      return <FaGlassWhiskey className="text-blue-400 text-xs shrink-0" />;
    }
    if (it === "pairing" || it === "side" || t.includes("pair") || t.includes("side") || t.includes("frie")) {
      return <FaUtensils className="text-amber-400 text-xs shrink-0" />;
    }
    if (it === "dip" || t.includes("dip") || t.includes("sauce")) {
      return <FaFire className="text-rose-400 text-xs shrink-0" />;
    }
    return <FaLayerGroup className="text-gray-400 text-xs shrink-0" />;
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 p-5 rounded-2xl shadow-md relative flex flex-col justify-between hover:border-amber-500/40 transition-all group">
      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start mb-4 border-b border-zinc-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-2 rounded-xl bg-zinc-50 dark:bg-neutral-800 border border-zinc-200 dark:border-neutral-700">
              {getCategoryEmoji(targetCategory)}
            </span>
            <div>
              <span className="text-zinc-500 dark:text-neutral-400 text-[10px] font-black uppercase tracking-wider block">
                Parent Category
              </span>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide m-0">
                {targetCategory}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => openModal(mapGroup)}
              className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-500/20 cursor-pointer transition-all text-xs"
              title="Edit Mapping"
            >
              <FaEdit />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(targetCategory)}
              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/20 cursor-pointer transition-all text-xs"
              title="Delete Mapping"
            >
              <FaTrash />
            </button>
          </div>
        </div>

        {/* Linked Groups List */}
        <div>
          <span className="text-zinc-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2.5 block flex items-center gap-1.5">
            <FaLayerGroup className="text-amber-500 text-[10px]" /> Mapped Add-on Groups:
          </span>

          {mapGroup.addons && mapGroup.addons.length > 0 ? (
            <div className="flex flex-col gap-2">
              {mapGroup.addons.map((a, i) => (
                <div
                  key={a.id || a.mapping_id || i}
                  className="bg-zinc-50 dark:bg-neutral-800/60 border border-zinc-200 dark:border-neutral-700/60 p-2.5 rounded-xl text-xs flex justify-between items-center hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getGroupIcon(a.group_title || a.addon_category, a.icon_type)}
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide block truncate">
                        {a.group_title || a.addon_category}
                      </span>
                      {a.group_subtitle && (
                        <span className="text-[10px] text-zinc-500 dark:text-neutral-400 truncate block">
                          {a.group_subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0 ml-2">
                    Live
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-zinc-400 text-xs italic">No add-on groups mapped.</span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-2.5 border-t border-zinc-100 dark:border-neutral-800 text-[10px] text-zinc-500 dark:text-neutral-400 flex justify-between items-center">
        <span>{mapGroup.addons?.length || 0} Groups Linked</span>
        <span className="text-emerald-500 font-bold">● Active in Store</span>
      </div>
    </div>
  );
}
