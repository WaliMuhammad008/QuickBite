import React, { useState, useEffect } from "react";

export default function DashboardWelcomeHero({ currentTime }) {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    try {
      const rawUser =
        sessionStorage.getItem("staff_user") ||
        sessionStorage.getItem("staff_session") ||
        sessionStorage.getItem("user") ||
        localStorage.getItem("staff_user") ||
        localStorage.getItem("user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        const name =
          parsed.name ||
          parsed.username ||
          parsed.full_name ||
          parsed.first_name;
        if (name) {
          setAdminName(name);
        }
      }
    } catch (e) {
      console.error("Failed to parse user session", e);
    }
  }, []);

  const getGreetingData = () => {
    const time = currentTime || new Date();
    const hour = time.getHours();
    if (hour >= 5 && hour < 12) {
      return { text: "Good Morning", punctuation: "!", emoji: "☀️" };
    } else if (hour >= 12 && hour < 17) {
      return { text: "Good Afternoon", punctuation: "!", emoji: "🌤️" };
    } else if (hour >= 17 && hour < 23) {
      return { text: "Good Evening", punctuation: "!", emoji: "🌆" };
    } else {
      return { text: "Working Late", punctuation: "?", emoji: "🌙" };
    }
  };

  const { text: greetingText, punctuation, emoji } = getGreetingData();

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between items-start gap-3 relative overflow-hidden shadow-sm">
      <div className="relative z-10">
        <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full mb-2 border border-amber-500/20">
          BigBite Restaurant Operations
        </span>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-zinc-900 dark:text-white m-0 font-['Oswald',sans-serif] tracking-wide">
          {greetingText},{" "}
          <span className="text-amber-500 capitalize">{adminName}</span>
          {punctuation} {emoji}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-0 font-sans">
          Here's the live overview and operational activity for today.
        </p>
      </div>
    </div>
  );
}
