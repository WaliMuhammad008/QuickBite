import React from "react";
import { FaBoxOpen } from "react-icons/fa";
import HomeHero from "./HomeHero";
import HomeProductSlider from "./HomeProductSlider";
import ExploreMenu from "../../Menu/Components/ExploreMenu";
import HomeBanners from "./HomeBanners";
import HomeReviewsSection from "./HomeReviewsSection";

export default function DynamicSectionResolver({
  homepageData,
  menuItems = [],
  bestSellersData = [],
  allTopDeals = [],
  handleBannerClick,
}) {
  const elements = [];
  const sections = homepageData?.sections || [];

  // Render Sections in Order
  sections.forEach((section) => {
    let sectionComponent = null;

    if (section.section_type === "hero") {
      sectionComponent = (
        <HomeHero
          slides={homepageData.hero_sliders || []}
          heroCategories={homepageData.hero_categories || []}
          onBannerClick={handleBannerClick}
        />
      );
    }

    if (section.section_type === "explore_menu") {
      sectionComponent = (
        <ExploreMenu
          key={`exp-${section.id}`}
          title={section.title || "EXPLORE MENU"}
          subtitle={section.subtitle || "VIEW ALL"}
        />
      );
    }

    if (section.section_type === "product_slider") {
      let items = [];
      const isDeals = section.content_data === "filter:top_deals";
      if (section.content_data === "filter:best_sellers") {
        items = bestSellersData;
      } else if (isDeals) {
        items = allTopDeals;
      } else if (
        section.content_data &&
        section.content_data.startsWith("category:")
      ) {
        const categoryName = section.content_data.split(":")[1];
        items = menuItems.filter(
          (item) => item.category === categoryName
        );
      } else if (
        section.content_data &&
        section.content_data.startsWith("custom:")
      ) {
        const idsStr = section.content_data.split(":")[1];
        if (idsStr) {
          const ids = idsStr.split(",").map((id) => parseInt(id));
          items = menuItems.filter(
            (item) => ids.includes(parseInt(item.id))
          );
        }
      }

      sectionComponent = (
        <div key={`prod-${section.id}`} className="relative pb-2">
          <HomeProductSlider
            title={
              isDeals
                ? section.title || "TOP DEALS & COMBOS"
                : section.title
            }
            items={items}
            viewAllLink={
              isDeals
                ? "/deals"
                : section.content_data === "filter:best_sellers"
                ? "/menu"
                : section.link_url || "/menu"
            }
          />
        </div>
      );
    }

    if (section.section_type === "banner") {
      let bannerItems = [];

      // 1. First priority: Section's own custom banner slides from content_data
      try {
        if (
          section.content_data &&
          section.content_data.startsWith("[")
        ) {
          const parsed = JSON.parse(section.content_data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            bannerItems = parsed.map((item, idx) => {
              const imgUrl =
                typeof item === "object"
                  ? item.image_url || item.image || item.img
                  : item;
              const link =
                typeof item === "object"
                  ? item.link_url || item.link || section.link_url
                  : section.link_url;
              const t =
                typeof item === "object"
                  ? item.title || section.title
                  : section.title;
              const sub =
                typeof item === "object"
                  ? item.subtitle || section.subtitle
                  : section.subtitle;

              return {
                id: `${section.id}-${idx}`,
                image: imgUrl,
                img: imgUrl,
                image_url: imgUrl,
                link: link,
                link_url: link,
                title: t,
                subtitle: sub,
              };
            });
          }
        }
      } catch (e) {
        console.error("Error parsing banner data", e);
      }

      // 2. Second priority: Section's single image_url
      if (bannerItems.length === 0 && section.image_url) {
        bannerItems = [
          {
            id: `${section.id}-single`,
            image: section.image_url,
            img: section.image_url,
            image_url: section.image_url,
            link: section.link_url || "/deals",
            link_url: section.link_url || "/deals",
            title: section.title || "Special Deals",
            subtitle: section.subtitle || "",
          },
        ];
      }

      // 3. Fallback: Master featured_banners ONLY if section has no custom slides
      if (
        bannerItems.length === 0 &&
        homepageData.featured_banners &&
        homepageData.featured_banners.length > 0
      ) {
        bannerItems = homepageData.featured_banners;
      }

      if (bannerItems.length > 0) {
        sectionComponent = (
          <HomeBanners
            key={`ban-${section.id}`}
            title={section.title}
            banners={bannerItems}
            onBannerClick={handleBannerClick}
          />
        );
      }
    }

    if (section.section_type === "reviews") {
      let filterMode = "all";
      if (section.content_data && section.content_data.startsWith("filter:")) {
        filterMode = section.content_data.split(":")[1];
      }
      sectionComponent = (
        <HomeReviewsSection
          key={`rev-${section.id}`}
          title={section.title || "WHAT OUR FOODIES SAY"}
          subtitle={section.subtitle || "Real stories & experiences from our verified food lovers"}
          reviews={homepageData?.reviews || []}
          summary={homepageData?.reviews_summary || { total_reviews: 0, average_rating: 5.0 }}
          filterMode={filterMode}
        />
      );
    }

    // Push section container
    if (sectionComponent) {
      if (
        section.section_type === "hero" ||
        section.section_type === "banner"
      ) {
        elements.push(
          <div key={`wrapper-${section.id}`} className="w-full">
            {sectionComponent}
          </div>
        );
      } else {
        elements.push(
          <div
            key={`wrapper-${section.id}`}
            className="w-full px-4 md:px-12 pt-4 pb-2"
          >
            {sectionComponent}
          </div>
        );
      }
    }
  });

  // Empty state fallback
  if (elements.length === 0) {
    elements.push(
      <div
        key="empty"
        className="w-full px-4 md:px-12 py-12 min-h-[50vh] flex items-center justify-center"
      >
        <div className="text-center animate-pulse">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              marginBottom: "20px",
              animation: "bounceIcon 2s infinite ease-in-out",
            }}
          >
            <FaBoxOpen size={40} />
          </div>
          <h3 className="text-white mb-2.5 font-semibold tracking-wide">
            Nothing Here Yet!
          </h3>
          <p className="text-slate-400 max-w-[25rem] mx-auto leading-relaxed">
            {homepageData.settings?.empty_homepage_message ||
              "We are currently updating our menu and offers. Please check back soon!"}
          </p>
        </div>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes bounceIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        `}</style>
      </div>
    );
  }

  return elements;
}
