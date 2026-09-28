import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';

export function useHeroSliderState(homepageData, getAuthHeaders, handleAuthError) {
  const queryClient = useQueryClient();
  const [heroSlides, setHeroSlides] = useState([]);
  const [globalSettings, setGlobalSettings] = useState({
    hero_section_sort_order: '0',
    empty_homepage_message: '',
  });
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);

  useEffect(() => {
    if (homepageData.hero_sliders) setHeroSlides(homepageData.hero_sliders);
    if (homepageData.settings) {
      setGlobalSettings({
        hero_section_sort_order:
          homepageData.settings.hero_section_sort_order || '0',
        empty_homepage_message:
          homepageData.settings.empty_homepage_message || '',
      });
    }
  }, [homepageData]);

  const handleSaveGlobalSettings = async () => {
    setIsSavingGlobal(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_settings.php`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(globalSettings),
        }
      );
      if (response.status === 401) {
        handleAuthError();
        return;
      }
      const result = await response.json();
      if (result.success) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Global Settings Saved!',
          showConfirmButton: false,
          timer: 1500,
          background: '#171717',
          color: '#fff',
        });
        queryClient.invalidateQueries({ queryKey: ['homepage_data'] });
      } else {
        if (
          result.code === 401 ||
          result.message === 'Unauthorized' ||
          result.message === 'Access denied'
        ) {
          handleAuthError();
          return;
        }
        Swal.fire('Error', result.message, 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Could not connect to server.', 'error');
    } finally {
      setIsSavingGlobal(false);
    }
  };

  return {
    heroSlides,
    setHeroSlides,
    globalSettings,
    setGlobalSettings,
    isSavingGlobal,
    handleSaveGlobalSettings,
  };
}
