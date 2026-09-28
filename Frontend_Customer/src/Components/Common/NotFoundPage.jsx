import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaHome, FaUtensils, FaArrowRight } from "react-icons/fa";
import wrapImg from "../../assets/products/tortillawrap.png";

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0c] text-neutral-900 dark:text-white px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative overflow-hidden transition-colors duration-300">
      {/* Ambient Radial Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] sm:w-[450px] h-[260px] bg-amber-400/15 dark:bg-amber-400/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-md sm:max-w-lg w-full text-center relative z-10 px-2">
        {/* Prominent Single Food Item Visual with Responsive Scaling */}
        <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 mx-auto mb-4 sm:mb-5 flex items-center justify-center group select-none">
          <div className="absolute inset-0 bg-radial from-amber-400/25 via-amber-500/10 to-transparent rounded-full blur-2xl group-hover:scale-115 transition-transform duration-500 pointer-events-none" />
          
          <img
            src={wrapImg}
            alt="Delicious Wrap"
            className="w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-2 group-hover:rotate-[-3deg]"
          />
        </div>

        {/* Balanced Oswald Typography */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-2">
          <span>Error 404 &bull; Page Not Found</span>
        </div>

        <h1 className="font-['Oswald',sans-serif] font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight text-neutral-950 dark:text-white uppercase m-0 leading-tight">
          LOST IN THE{" "}
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            SAUCE?
          </span>
        </h1>

        <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm max-w-sm sm:max-w-md mx-auto mt-2 mb-6 font-medium leading-relaxed">
          The meal or page you are looking for might have been moved, renamed, or freshly consumed by our kitchen team.
        </p>

        {/* Action Buttons: Responsive Stack on mobile, side-by-side on tablet/desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full max-w-xs sm:max-w-none mx-auto">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-black uppercase text-xs tracking-wider shadow-md hover:shadow-amber-500/20 transition-all duration-200 active:scale-95 border-none cursor-pointer"
          >
            <FaHome className="text-xs" />
            <span>Return Home</span>
          </button>

          <Link
            to="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-neutral-900 dark:text-white hover:border-amber-400 font-['Oswald',sans-serif] font-bold uppercase text-xs tracking-wider shadow-xs transition-all duration-200 active:scale-95 no-underline"
          >
            <FaUtensils className="text-[10px] text-amber-500" />
            <span>Browse Menu</span>
            <FaArrowRight className="text-[10px] ml-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
