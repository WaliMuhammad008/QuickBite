import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usePromoBannersState } from './usePromoBannersState';
import { useDynamicSectionsState } from './useDynamicSectionsState';
import { useHeroSliderState } from './useHeroSliderState';

export function useHomepageBuilder() {
  const navigate = useNavigate();

  // Auth Helpers
  const getAuthToken = () => {
    return (
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('auth_token') ||
      sessionStorage.getItem('staff_token') ||
      ''
    );
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}`, 'X-Auth-Token': token } : {}),
    };
  };

  const handleAuthError = () => {
    toast.error('Session expired or unauthorized (401). Redirecting to login...');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('staff_token');
    sessionStorage.removeItem('staff_session');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('staff_user');
    setTimeout(() => {
      navigate('/login');
    }, 1200);
  };

  // Fetch Homepage Layout Data
  const { data: homepageData = {}, isLoading } = useQuery({
    queryKey: ['homepage_data'],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_homepage_data.php?all=1`
      );
      const result = await response.json();
      return result.success && result.data ? result.data : {};
    },
  });

  const sections = homepageData.sections || [];

  // Hero Slider & Global Settings State
  const {
    heroSlides,
    globalSettings,
    setGlobalSettings,
    isSavingGlobal,
    handleSaveGlobalSettings,
  } = useHeroSliderState(homepageData, getAuthHeaders, handleAuthError);

  // Master Promo Banners
  const {
    masterBanners,
    handleToggleMasterBanner,
    handleUpdateMasterBannerOrder,
  } = usePromoBannersState(getAuthHeaders);

  // Catalog dependencies for modals
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_categories.php`
      );
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['active_deals'],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_active_deals.php`
      );
      const data = await res.json();
      return data.success && data.data ? data.data : [];
    },
  });

  // Dynamic Sections & Hero Modals State
  const {
    isModalOpen,
    setIsModalOpen,
    modalType,
    editId,
    formData,
    setFormData,
    bannerSlides,
    setBannerSlides,
    selectedProductIds,
    handleProductSelect,
    isSavingComponent,
    handleToggleStatus,
    handleDelete,
    handleSave,
    openModal,
    handleEdit,
  } = useDynamicSectionsState(getAuthHeaders, handleAuthError, heroSlides, sections);

  return {
    heroSlides,
    sections,
    isLoading,
    globalSettings,
    setGlobalSettings,
    isSavingGlobal,
    handleSaveGlobalSettings,
    masterBanners,
    handleToggleMasterBanner,
    handleUpdateMasterBannerOrder,
    handleToggleStatus,
    handleEdit,
    handleDelete,
    openModal,
    isModalOpen,
    setIsModalOpen,
    modalType,
    editId,
    formData,
    setFormData,
    bannerSlides,
    setBannerSlides,
    selectedProductIds,
    handleProductSelect,
    categories,
    menuItems,
    deals,
    handleSave,
    isSavingComponent,
  };
}
