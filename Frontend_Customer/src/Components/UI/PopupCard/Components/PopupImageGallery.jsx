import React from "react";
import { FaTimes, FaFireAlt, FaCheckCircle } from "react-icons/fa";

export default function PopupImageGallery({
  finalImage,
  title,
  itemName,
  handleCloseModal,
}) {
  return (
    <>
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-amber-400/10 dark:bg-amber-400/5 blur-xl pointer-events-none" />

      <button
        type="button"
        onClick={handleCloseModal}
        className="absolute top-3 right-3 z-50 p-2 bg-black/60 hover:bg-black text-white rounded-full backdrop-blur-md cursor-pointer border-none transition-all active:scale-90 flex items-center justify-center shadow-md"
        aria-label="Close modal"
      >
        <FaTimes className="text-xs sm:text-sm" />
      </button>

      {/* Food Cutout Image Container with Ambient Radial Amber Glow on Hover */}
      <div className="relative group/glow flex items-center justify-center my-auto w-full h-36 min-[400px]:h-44 sm:h-52 lg:h-64 p-4 select-none">
        {/* Soft subtle amber radial glow behind image */}
        <div className="absolute inset-0 m-auto w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-amber-400/25 dark:bg-amber-500/20 blur-3xl opacity-0 group-hover/glow:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Product Image with smooth micro-scale on hover */}
        <img
          src={finalImage}
          alt={title || itemName}
          className="relative z-10 w-32 h-32 sm:w-44 sm:h-44 lg:w-56 lg:h-56 object-contain drop-shadow-2xl transition-transform duration-500 ease-out group-hover/glow:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/400x400?text=Food";
          }}
        />
      </div>
    </>
  );
}

