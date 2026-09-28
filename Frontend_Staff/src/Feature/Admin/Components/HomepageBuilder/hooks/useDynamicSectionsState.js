import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { compressImage } from '../../../../../utils/imageOptimizer';

export function useDynamicSectionsState(getAuthHeaders, handleAuthError, heroSlides, sections) {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('section'); // 'section' or 'hero'
  const [editId, setEditId] = useState(null); // Track if editing
  const [isSavingComponent, setIsSavingComponent] = useState(false);

  const [formData, setFormData] = useState({
    section_type: 'product_slider',
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    content_data: 'filter:best_sellers',
    slider_type: 'regular',
    sort_order: 10,
    file: null,
  });

  const [bannerSlides, setBannerSlides] = useState([
    { title: '', subtitle: '', link_url: '', file: null, image_url: '' },
  ]);

  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const uploadToCloudinary = async (file) => {
    // 1. Client-side compression: shrinks raw 5-15MB files to ~150-250KB in milliseconds
    const optimizedFile = await compressImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.82,
    });

    const data = new FormData();
    data.append('file', optimizedFile);
    data.append(
      'upload_preset',
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );
    data.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: data,
      }
    );
    const uploadedImg = await res.json();
    if (!uploadedImg.secure_url) {
      throw new Error(uploadedImg.error?.message || 'Failed to upload image to Cloudinary');
    }
    return uploadedImg.secure_url;
  };

  const handleToggleStatus = async (id, type, currentActive) => {
    const nextActive =
      currentActive === undefined || Number(currentActive) === 1 ? 0 : 1;
    const action =
      type === 'hero' ? 'toggle_hero_status' : 'toggle_section_status';

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/admin_manage_homepage.php`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ action, id, is_active: nextActive }),
        }
      );

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      const result = await response.json();
      if (result.success) {
        toast.success(
          nextActive === 1
            ? `${type === 'hero' ? 'Slide' : 'Section'} enabled on homepage!`
            : `${type === 'hero' ? 'Slide' : 'Section'} hidden from homepage!`
        );
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
        toast.error(result.message || 'Failed to update status');
      }
    } catch (err) {
      toast.error('Network error while updating status.');
    }
  };

  const handleDelete = async (id, type) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This item will be removed from your homepage layout.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#71717a',
      confirmButtonText: 'Yes, Delete',
      background: '#171717',
      color: '#fff',
    });

    if (result.isConfirmed) {
      const action = type === 'hero' ? 'delete_hero' : 'delete_section';
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/admin_manage_homepage.php`,
          {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ action, id }),
          }
        );

        if (response.status === 401) {
          handleAuthError();
          return;
        }

        const resultData = await response.json();
        if (resultData.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Item has been removed.',
            timer: 1500,
            showConfirmButton: false,
            background: '#171717',
            color: '#fff',
          });
          queryClient.invalidateQueries({ queryKey: ['homepage_data'] });
        } else {
          if (
            resultData.code === 401 ||
            resultData.message === 'Unauthorized' ||
            resultData.message === 'Access denied'
          ) {
            handleAuthError();
            return;
          }
          Swal.fire(
            'Error',
            resultData.message || 'Failed to delete item',
            'error'
          );
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete item', 'error');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSavingComponent(true);

    try {
      let finalImageUrl = formData.image_url;
      let finalContentData = formData.content_data;

      // Handle dynamic slides for banners
      if (modalType === 'section' && formData.section_type === 'banner') {
        // Parallelized upload: all banner slides upload simultaneously
        const slidePromises = bannerSlides.map(async (slide) => {
          let url = slide.image_url;
          if (slide.file) {
            url = await uploadToCloudinary(slide.file);
          }
          if (url) {
            return {
              title: slide.title,
              subtitle: slide.subtitle,
              link_url: slide.link_url,
              image_url: url,
            };
          }
          return null;
        });

        const results = await Promise.all(slidePromises);
        const uploadedSlides = results.filter(Boolean);

        if (uploadedSlides.length > 0) {
          finalImageUrl = uploadedSlides[0].image_url;
          finalContentData = JSON.stringify(uploadedSlides);
          formData.title =
            formData.title || uploadedSlides[0].title || 'Banner Section';
        }
      }
      // Handle single file for hero or other sections
      else if (formData.file) {
        finalImageUrl = await uploadToCloudinary(formData.file);
      }

      const action =
        modalType === 'hero'
          ? editId
            ? 'update_hero'
            : 'add_hero'
          : editId
            ? 'update_section'
            : 'add_section';

      if (formData.section_type === 'product_slider') {
        if (formData.content_data === 'custom_selection') {
          if (selectedProductIds.length === 0) {
            Swal.fire({
              icon: 'error',
              title: 'Validation Error',
              text: 'Please select at least one product for custom selection.',
              background: '#171717',
              color: '#fff',
            });
            setIsSavingComponent(false);
            return;
          }
          finalContentData = `custom:${selectedProductIds.join(',')}`;
        }
      }

      const payload = {
        action,
        id: editId,
        ...formData,
        content_data: finalContentData,
        image_url: finalImageUrl,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/admin_manage_homepage.php`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 401) {
        handleAuthError();
        return;
      }

      const res = await response.json();
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'Saved!',
          text: editId
            ? 'Component updated successfully.'
            : 'New component added.',
          timer: 1500,
          showConfirmButton: false,
          background: '#171717',
          color: '#fff',
        });
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['homepage_data'] });
      } else {
        if (
          res.code === 401 ||
          res.message === 'Unauthorized' ||
          res.message === 'Access denied'
        ) {
          handleAuthError();
          return;
        }
        Swal.fire('Error', res.message || 'Failed to save component', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Something went wrong: ' + err.message, 'error');
    } finally {
      setIsSavingComponent(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setEditId(null);
    setFormData({
      section_type: type === 'hero' ? 'hero' : 'product_slider',
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      content_data: 'filter:best_sellers',
      slider_type: 'regular',
      sort_order: (type === 'hero' ? (heroSlides?.length || 0) : (sections?.length || 0)) + 1,
      file: null,
    });
    setBannerSlides([
      { title: '', subtitle: '', link_url: '', file: null, image_url: '' },
    ]);
    setSelectedProductIds([]);
    setIsModalOpen(true);
  };

  const handleEdit = (item, type) => {
    setModalType(type);
    setEditId(item.id);

    let contentData = item.content_data || 'filter:best_sellers';
    let parsedIds = [];
    if (contentData.startsWith('custom:')) {
      const idsStr = contentData.split(':')[1];
      if (idsStr) {
        parsedIds = idsStr.split(',').map((id) => parseInt(id));
      }
      contentData = 'custom_selection';
    }

    if (item.section_type === 'banner') {
      try {
        if (item.content_data && item.content_data.startsWith('[')) {
          const parsed = JSON.parse(item.content_data);
          setBannerSlides(
            parsed.map((slide) => ({
              ...slide,
              file: null,
            }))
          );
        } else {
          setBannerSlides([
            {
              title: item.title || '',
              subtitle: item.subtitle || '',
              link_url: item.link_url || '',
              file: null,
              image_url: item.image_url || '',
            },
          ]);
        }
      } catch (e) {
        setBannerSlides([
          {
            title: item.title || '',
            subtitle: item.subtitle || '',
            link_url: item.link_url || '',
            file: null,
            image_url: item.image_url || '',
          },
        ]);
      }
    } else {
      setBannerSlides([
        { title: '', subtitle: '', link_url: '', file: null, image_url: '' },
      ]);
    }

    setFormData({
      section_type: item.section_type || 'hero',
      title: item.title || '',
      subtitle: item.subtitle || '',
      image_url: item.image_url || '',
      link_url: item.link_url || '',
      content_data: contentData,
      slider_type: item.slider_type || 'regular',
      sort_order: item.sort_order || 1,
      file: null,
    });
    setSelectedProductIds(parsedIds);
    setIsModalOpen(true);
  };

  const handleProductSelect = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((pid) => pid !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  return {
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
  };
}
