import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import DynamicSectionResolver from "./Components/DynamicSectionResolver";
import PopupCard from "../../Components/UI/PopupCard";
import { API_BASE } from "../../config/api";

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedPopupItem, setSelectedPopupItem] = useState(null);

  // Centralized Modal Scroll Management
  useEffect(() => {
    if (selectedPopupItem) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    }

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    };
  }, [selectedPopupItem]);

  // Fetch Data from API using React Query
  const { data: menuItems = [], isLoading: isMenuLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/get_menu.php`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: comboDeals = [], isLoading: isDealsLoading } = useQuery({
    queryKey: ["active_deals"],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/get_active_deals.php`
      );
      const data = await res.json();
      if (data.success && data.data) {
        return data.data.map((deal) => ({
          id: deal.id,
          deal_id: deal.id,
          name: deal.title,
          title: deal.title,
          price: parseFloat(deal.price),
          original_price: deal.original_price
            ? parseFloat(deal.original_price)
            : null,
          badge_tag: deal.badge_tag || deal.tag || "HOT DEAL",
          tag: deal.badge_tag || deal.tag || "HOT DEAL",
          image: deal.img,
          img: deal.img,
          promo_banner_image: deal.promo_banner_image,
          is_featured_banner: deal.is_featured_banner == 1,
          items: deal.items || [],
          items_description: deal.items_description,
          description: deal.description || deal.items_description,
          isAvailable: deal.isAvailable !== false,
          inStock: deal.inStock !== false && deal.inStock !== 0 && deal.inStock !== "0",
          is_deal: true,
          size: "Combo",
          is_permanent: deal.is_permanent == 1 || deal.is_permanent === true,
          start_time: deal.start_time,
          end_time: deal.end_time,
          is_time_active: deal.is_time_active !== false && deal.isTimeActive !== false,
          time_window_text: deal.time_window_text || "",
        }));
      }
      return [];
    },
  });

  const {
    data: homepageData = { hero: [], sections: [], featured_banners: [] },
    isLoading: isHomeLoading,
  } = useQuery({
    queryKey: ["homepage_data"],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/get_homepage_data.php`
      );
      const data = await res.json();
      return data.success
        ? data.data
        : { hero: [], sections: [], featured_banners: [] };
    },
  });

  const isLoading = isMenuLoading || isDealsLoading || isHomeLoading;

  const handleOpenDealModal = async (deal) => {
    if (!deal) return;
    const dealId = deal.deal_id || deal.id;
    let fullDeal = comboDeals.find((d) => d.id.toString() === dealId.toString());

    if (!fullDeal || !fullDeal.items || fullDeal.items.length === 0) {
      try {
        const res = await fetch(
          `${API_BASE}/get_deal_details.php?id=${dealId}`
        );
        const data = await res.json();
        if (data.success && data.deal) {
          fullDeal = {
            ...data.deal,
            id: data.deal.id,
            deal_id: data.deal.id,
            name: data.deal.title,
            title: data.deal.title,
            price: parseFloat(data.deal.price),
            original_price: data.deal.original_price
              ? parseFloat(data.deal.original_price)
              : null,
            image: data.deal.img,
            img: data.deal.img,
            is_deal: true,
            isAvailable: data.deal.isAvailable !== false,
            inStock: data.deal.inStock !== false && data.deal.inStock !== 0 && data.deal.inStock !== "0",
            size: "Combo",
            is_permanent: data.deal.is_permanent == 1 || data.deal.is_permanent === true,
            start_time: data.deal.start_time,
            end_time: data.deal.end_time,
            is_time_active: data.deal.is_time_active !== false && data.deal.isTimeActive !== false,
            time_window_text: data.deal.time_window_text || "",
          };
        }
      } catch (e) {
        console.error("Error fetching deal details", e);
      }
    }

    const itemToOpen = fullDeal || deal;
    const isPermanent = itemToOpen.is_permanent == 1 || itemToOpen.is_permanent === true;
    const isTimeInactive = !isPermanent && (itemToOpen.is_time_active === false || itemToOpen.isTimeActive === false);
    if (isTimeInactive) {
      return; // Do not open inactive deal
    }

    setSelectedPopupItem({
      ...itemToOpen,
      is_deal: true,
      name: itemToOpen.title || itemToOpen.name,
      desc: itemToOpen.description || itemToOpen.items_description,
    });
  };

  const handleBannerClick = async (bannerOrUrl, extraBanner) => {
    const banner =
      typeof bannerOrUrl === "object" && bannerOrUrl !== null
        ? bannerOrUrl
        : extraBanner;
    const linkUrl =
      typeof bannerOrUrl === "string"
        ? bannerOrUrl
        : banner?.link || banner?.link_url;

    if (banner) {
      const isExplicitProduct =
        banner.type === "product" ||
        String(banner.id || "").startsWith("prod-") ||
        Boolean(banner.category || banner.category_id);
      const isExplicitDeal =
        banner.type === "deal" ||
        banner.is_deal === true ||
        String(banner.id || "").startsWith("deal-") ||
        Boolean(banner.deal_id);

      if (isExplicitProduct && !isExplicitDeal) {
        const rawId =
          banner.target_id ||
          (banner.raw_data && banner.raw_data.id) ||
          String(banner.id).replace("prod-", "");
        const matchedItem = menuItems.find(
          (item) => item.id.toString() === rawId.toString()
        );
        const fullProduct = matchedItem || banner.raw_data || banner;

        setSelectedPopupItem({
          ...fullProduct,
          is_deal: false,
          name: fullProduct.name || banner.title,
          title: fullProduct.name || banner.title,
          price: fullProduct.price || banner.price,
          image:
            fullProduct.img ||
            fullProduct.image ||
            banner.promo_banner_image ||
            banner.image,
        });
        return;
      }

      if (isExplicitDeal) {
        const rawId =
          banner.target_id ||
          (banner.raw_data &&
            (banner.raw_data.id || banner.raw_data.deal_id)) ||
          String(banner.id).replace("deal-", "");
        const matchedDeal = comboDeals.find(
          (d) => d.id.toString() === rawId.toString()
        );
        const fullDeal = matchedDeal || banner.raw_data || banner;
        await handleOpenDealModal(fullDeal);
        return;
      }
    }

    if (!linkUrl) return;

    if (linkUrl.startsWith("product:")) {
      const pId = linkUrl.split(":")[1];
      const foundItem = menuItems.find(
        (item) => item.id.toString() === pId.toString()
      );
      if (foundItem) {
        setSelectedPopupItem({ ...foundItem, is_deal: false });
        return;
      }
    } else if (linkUrl.startsWith("deal:") || linkUrl.includes("selected=")) {
      let dId = linkUrl.startsWith("deal:")
        ? linkUrl.split(":")[1]
        : (linkUrl.match(/selected=([^&]+)/) || [])[1];
      if (dId) {
        await handleOpenDealModal({ id: dId, deal_id: dId });
        return;
      }
    }

    navigate(linkUrl);
  };

  const bestSellersData = menuItems.filter(
    (item) => item.isBestSeller === true
  );
  const menuTopDeals = menuItems.filter(
    (item) => item.isTopDeal === true
  );
  const sliderDeals = comboDeals.filter((deal) => !deal.is_featured_banner);
  const allTopDeals = [...sliderDeals, ...menuTopDeals];

  return (
    <div className="bg-slate-50 dark:bg-[#0A0A0C] min-h-[100vh] text-gray-900 dark:text-white pb-[10vh] md:pb-[3.125rem] font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif] m-0 pt-0 transition-colors duration-300">
      {isLoading ? (
        <div className="w-full px-4 md:px-12 py-6">
          <div className="flex justify-center py-[3.125rem]">
            <div className="dot-loader">
              <div className="dot w-3 h-3"></div>
              <div className="dot w-3 h-3"></div>
              <div className="dot w-3 h-3"></div>
            </div>
          </div>
        </div>
      ) : (
        <DynamicSectionResolver
          homepageData={homepageData}
          menuItems={menuItems}
          bestSellersData={bestSellersData}
          allTopDeals={allTopDeals}
          handleBannerClick={handleBannerClick}
        />
      )}

      {/* Root Modal Portal */}
      {selectedPopupItem &&
        ReactDOM.createPortal(
          <PopupCard
            item={selectedPopupItem}
            title={selectedPopupItem.title || selectedPopupItem.name}
            description={
              selectedPopupItem.description ||
              selectedPopupItem.desc ||
              selectedPopupItem.items_description
            }
            price={selectedPopupItem.price}
            image={selectedPopupItem.image || selectedPopupItem.img}
            closePopup={() => setSelectedPopupItem(null)}
          />,
          document.body
        )}
    </div>
  );
};

export default HomePage;
