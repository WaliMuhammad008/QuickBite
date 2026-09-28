import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function usePromoBannersState(getAuthHeaders) {
  const queryClient = useQueryClient();

  const {
    data: masterBanners = { deals: [], products: [] },
    refetch: refetchMasterBanners,
  } = useQuery({
    queryKey: ['master_promo_banners'],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/save_homepage_banners.php`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ action: 'get_all_banners' }),
        }
      );
      const data = await response.json();
      return data.success ? data.data : { deals: [], products: [] };
    },
  });

  const handleToggleMasterBanner = async (item, type) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/save_homepage_banners.php`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            action: 'update_banner_status',
            type: type,
            id: item.id,
            is_featured_banner: !item.is_featured_banner,
            banner_order: item.banner_order || 0,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(
          `${item.name || item.title} ${
            !item.is_featured_banner ? 'activated on' : 'removed from'
          } homepage!`
        );
        refetchMasterBanners();
        queryClient.invalidateQueries({ queryKey: ['homepage_data'] });
      }
    } catch (e) {
      toast.error('Failed to update banner');
    }
  };

  const handleUpdateMasterBannerOrder = async (item, type, newOrder) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/save_homepage_banners.php`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            action: 'update_banner_status',
            type: type,
            id: item.id,
            is_featured_banner: item.is_featured_banner ? 1 : 0,
            banner_order: parseInt(newOrder || 0),
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(`Display order updated!`);
        refetchMasterBanners();
        queryClient.invalidateQueries({ queryKey: ['homepage_data'] });
      }
    } catch (e) {
      toast.error('Failed to update order');
    }
  };

  return {
    masterBanners,
    handleToggleMasterBanner,
    handleUpdateMasterBannerOrder,
  };
}
