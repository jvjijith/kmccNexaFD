import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useGetData, usePostData, usePutData } from '../../common/api';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

// Validation schema based on the provided API schema
const validateMenuData = (data) => {
  const errors = {};

  // Required fields validation
  if (!data.appId || data.appId.trim() === '') {
    errors.appId = 'App ID is required';
  }

  if (!data.menuName || data.menuName.trim() === '') {
    errors.menuName = 'Menu name is required';
  } else if (data.menuName.length < 2) {
    errors.menuName = 'Menu name must be at least 2 characters long';
  } else if (data.menuName.length > 50) {
    errors.menuName = 'Menu name must be less than 50 characters';
  }

  if (!data.menuType) {
    errors.menuType = 'Menu type is required';
  } else if (!['single', 'multiple', 'mega'].includes(data.menuType)) {
    errors.menuType = 'Menu type must be single, multiple, or mega';
  }

  if (!data.layoutType) {
    errors.layoutType = 'Layout type is required';
  } else if (!['left drawer', 'right drawer', 'top', 'left hamBurger', 'right hamBurger'].includes(data.layoutType)) {
    errors.layoutType = 'Invalid layout type';
  }

  // Validate items array
  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      if (!item.menuName || item.menuName.trim() === '') {
        errors[`item_${index}_menuName`] = `Item ${index + 1}: Menu name is required`;
      } else if (item.menuName.length < 2) {
        errors[`item_${index}_menuName`] = `Item ${index + 1}: Menu name must be at least 2 characters long`;
      }

      if (!item.menuType) {
        errors[`item_${index}_menuType`] = `Item ${index + 1}: Menu type is required`;
      } else if (!['single', 'multiple'].includes(item.menuType)) {
        errors[`item_${index}_menuType`] = `Item ${index + 1}: Menu type must be single or multiple`;
      }

      // Validate multiItems if they exist
      if (item.multiItems && item.multiItems.length > 0) {
        item.multiItems.forEach((subItem, subIndex) => {
          if (!subItem.menuName || subItem.menuName.trim() === '') {
            errors[`item_${index}_subitem_${subIndex}_menuName`] = `Item ${index + 1}, Sub-item ${subIndex + 1}: Menu name is required`;
          } else if (subItem.menuName.length < 2) {
            errors[`item_${index}_subitem_${subIndex}_menuName`] = `Item ${index + 1}, Sub-item ${subIndex + 1}: Menu name must be at least 2 characters long`;
          }

          if (!subItem.menuType) {
            errors[`item_${index}_subitem_${subIndex}_menuType`] = `Item ${index + 1}, Sub-item ${subIndex + 1}: Menu type is required`;
          } else if (subItem.menuType !== 'single') {
            errors[`item_${index}_subitem_${subIndex}_menuType`] = `Item ${index + 1}, Sub-item ${subIndex + 1}: Menu type must be single`;
          }
        });
      }
    });
  }

  return errors;
};

// Error display component
const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return <div className="text-red-500 text-sm mt-1">{error}</div>;
};

// Form field wrapper component
const FormField = ({ label, required = false, error, children, className = "w-full sm:w-1/2 p-4" }) => (
  <div className={className}>
    <label className="block w-full mb-2 text-text-color primary-text">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    <ErrorMessage error={error} />
  </div>
);

// Image upload component
const ImageUploadField = ({ 
  label, 
  images, 
  uploadedImage, 
  onDrop, 
  onRemoveNew, 
  onRemoveExisting, 
  onUpload, 
  uploadProgress, 
  className = "w-full sm:w-1/2 p-4" 
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false
  });

  return (
    <FormField label={label} className={className}>
      <div className="space-y-4">
        {/* Existing uploaded image */}
        {uploadedImage && (
          <div className="relative">
            <img 
              src={uploadedImage} 
              alt="Uploaded" 
              className="w-32 h-32 object-cover rounded border"
            />
            <button
              type="button"
              onClick={onRemoveExisting}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}

        {/* New images to upload */}
        {images.map((image, index) => (
          <div key={index} className="relative">
            <div className="flex items-center space-x-4">
              <img 
                src={URL.createObjectURL(image)} 
                alt="Preview" 
                className="w-20 h-20 object-cover rounded border"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600 truncate">{image.name}</p>
                {uploadProgress[image.name] && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress[image.name]}%` }}
                    ></div>
                  </div>
                )}
                <div className="flex space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => onUpload(index)}
                    disabled={uploadProgress[image.name] === 100}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                  >
                    {uploadProgress[image.name] === 100 ? 'Uploaded' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveNew(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Upload dropzone */}
        {!uploadedImage && images.length === 0 && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isDragActive ? (
                <p>Drop the image here...</p>
              ) : (
                <p>Drag & drop an image here, or click to select</p>
              )}
            </div>
          </div>
        )}
      </div>
    </FormField>
  );
};

function MenuForm({ menu }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image states
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [itemImages, setItemImages] = useState({});
  const [subItemImages, setSubItemImages] = useState({});
  const [mediaId, setMediaId] = useState(null);
  
  // Accordion states
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeSubIndex, setActiveSubIndex] = useState({});

  const mutationHook = menu ? usePutData : usePostData;
  const api_url = menu ? `/menu/${menu._id}` : '/menu';
  const api_key = menu ? 'updateMenu' : 'addMenu';
  const { mutate: saveMenu, isLoading } = mutationHook(api_key, api_url);

  const { data: pageData, isLoading: isPageLoading } = useGetData('page', '/pages?limit=100', {});
  const { data: appData, isLoading: isAppLoading } = useGetData('app', '/app', {});

  const { mutateAsync: generateSignedUrl } = usePostData('signedUrl', '/media/generateSignedUrl');
  const { mutateAsync: updateMediaStatus } = usePutData('updateMediaStatus', `/media/update/${mediaId}`, { enabled: !!mediaId });

  const [formData, setFormData] = useState({
    appId: '',
    menuName: '',
    menuSlug: '',
    menuType: 'single',
    layoutType: 'left drawer',
    menuPage: '',
    imageUrl: null,
    allowImage: false,
    items: [],
    active: true,
  });

  const menuTypeOptions = [
    { value: 'single', label: 'Single' },
    { value: 'multiple', label: 'Multiple' },
    { value: 'mega', label: 'Mega' },
  ];

  const itemMenuTypeOptions = [
    { value: 'single', label: 'Single' },
    { value: 'multiple', label: 'Multiple' },
  ];

  // Generate dropdown options - combining page title and slug for better UX
  const pageOptions = pageData?.pages?.map((page) => ({
    value: page._id,
    label: `${page.title?.[0]?.title || 'Untitled Page'} (/${page.slug})`,
    slug: page.slug,
    title: page.title?.[0]?.title || 'Untitled Page',
  })) || [];

  // Generate page slug options for menu items - now showing both title and slug
  const pageSlugOptions = pageData?.pages?.map((page) => ({
    value: page.slug,
    label: `${page.referenceName || 'Untitled Page'} (/${page.slug})`,
    pageId: page._id,
    title: page.referenceName || 'Untitled Page',
  })) || [];

  const appOptions = appData?.apps?.map((app) => ({
    value: app._id,
    label: app.title || 'Untitled App',
  })) || [];

  const layoutTypeOptions = [
    { value: 'left drawer', label: 'Left Drawer' },
    { value: 'right drawer', label: 'Right Drawer' },
    { value: 'top', label: 'Top' },
    { value: 'left hamBurger', label: 'Left Hamburger' },
    { value: 'right hamBurger', label: 'Right Hamburger' },
  ];

  useEffect(() => {
    if (menu) {
      setFormData({
        appId: menu?.appId?._id || menu?.appId || '',
        menuName: menu.menuName || '',
        menuSlug: menu.menuSlug || '',
        menuType: menu.menuType || 'single',
        layoutType: menu.layoutType || 'left drawer',
        menuPage: menu.menuPage || '',
        imageUrl: menu.imageUrl || null,
        allowImage: menu.allowImage || false,
        items: menu.items || [],
        active: menu.active !== undefined ? menu.active : true,
      });
    }
    setTimeout(() => setLoading(false), 1000);
  }, [menu]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    if (name === 'menuPage') {
      // When selecting a page, set both menuName (title) and menuSlug (slug)
      setFormData((prev) => ({
        ...prev,
        menuPage: selectedOption?.value || '',
        menuName: selectedOption?.title || '',
        menuSlug: selectedOption?.slug || '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: selectedOption?.value || '',
      }));
    }

    // Clear error when user makes selection
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNestedChange = (itemIndex, field, value) => {
    setFormData((prevData) => {
      const updatedItems = [...prevData.items];

      if (field === 'menuSlug') {
        // When selecting a page slug, set both menuName (title) and menuSlug (slug)
        const selectedPage = pageSlugOptions.find(option => option.value === value);
        if (selectedPage) {
          updatedItems[itemIndex].menuName = selectedPage.title;
          updatedItems[itemIndex].menuSlug = selectedPage.value;
          updatedItems[itemIndex].menuPage = selectedPage.pageId;
        } else {
          updatedItems[itemIndex][field] = value;
        }
      } else {
        updatedItems[itemIndex][field] = value;
      }

      return { ...prevData, items: updatedItems };
    });

    // Clear related errors
    const errorKey = `item_${itemIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const handleSubItemChange = (itemIndex, subItemIndex, field, value) => {
    setFormData((prevData) => {
      const updatedItems = [...prevData.items];
      if (!updatedItems[itemIndex].multiItems) {
        updatedItems[itemIndex].multiItems = [];
      }

      if (field === 'menuSlug') {
        // When selecting a page slug, set both menuName (title) and menuSlug (slug)
        const selectedPage = pageSlugOptions.find(option => option.value === value);
        if (selectedPage) {
          updatedItems[itemIndex].multiItems[subItemIndex].menuName = selectedPage.title;
          updatedItems[itemIndex].multiItems[subItemIndex].menuSlug = selectedPage.value;
          updatedItems[itemIndex].multiItems[subItemIndex].menuPage = selectedPage.pageId;
        } else {
          updatedItems[itemIndex].multiItems[subItemIndex][field] = value;
        }
      } else {
        updatedItems[itemIndex].multiItems[subItemIndex][field] = value;
      }

      return { ...prevData, items: updatedItems };
    });

    // Clear related errors
    const errorKey = `item_${itemIndex}_subitem_${subItemIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          menuName: '',
          menuType: 'single',
          menuSlug: '',
          menuPage: '',
          imageUrl: null,
          allowImage: false,
          active: true,
          multiItems: [],
        },
      ],
    }));
  };

  const handleAddSubItem = (itemIndex) => {
    const updatedItems = [...formData.items];
    if (!updatedItems[itemIndex].multiItems) {
      updatedItems[itemIndex].multiItems = [];
    }
    updatedItems[itemIndex].multiItems.push({
      menuName: '',
      menuType: 'single',
      menuSlug: '',
      menuPage: '',
      imageUrl: null,
      allowImage: false,
      active: true,
    });
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleRemoveSubItem = (itemIndex, subItemIndex) => {
    const updatedItems = [...formData.items];
    updatedItems[itemIndex].multiItems.splice(subItemIndex, 1);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
    
    // Clear related errors
    const errorKeys = Object.keys(errors).filter(key => 
      key.startsWith(`item_${itemIndex}_subitem_${subItemIndex}_`)
    );
    if (errorKeys.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        errorKeys.forEach(key => delete newErrors[key]);
        return newErrors;
      });
    }
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
    
    // Clear related errors
    const errorKeys = Object.keys(errors).filter(key => 
      key.startsWith(`item_${index}_`)
    );
    if (errorKeys.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        errorKeys.forEach(key => delete newErrors[key]);
        return newErrors;
      });
    }
  };

  const toggleAccordion = (index, field) => {
    if (field === "menu") {
      setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
    } else {
      setActiveSubIndex(prev => ({
        ...prev,
        [field]: prev[field] === index ? null : index
      }));
    }
  };

  // Image upload functions
  const handleUploadAttachment = async (file) => {
    try {
      const signedUrlResponse = await generateSignedUrl({
        title: file.name,
        mediaType: "image",
        ext: file.name.split('.').pop() || "",
        active: true,
        uploadStatus: "progressing",
        uploadProgress: 0,
      });

      if (!signedUrlResponse) {
        throw new Error('Signed URL data is undefined');
      }

      const signedUrl = signedUrlResponse.signedUrl;
      const mediaId = signedUrlResponse.media._id;

      setMediaId(mediaId);

      await axios.put(signedUrl, file, {
        headers: {
          'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));

          if (progress === 100) {
            updateMediaStatus({
              mediaType: "image",
              title: file.name,
              ext: file.name.split('.').pop(),
              active: true,
              uploadStatus: "completed",
              uploadProgress: 100,
            });
          }
        }
      });

      const imageUrl = `${import.meta.env.VITE_MEDIA_BASE_URL}${mediaId}.${file.name.split('.').pop()}`;
      return imageUrl;

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleMainImageUpload = async (imageIndex) => {
    const file = images[imageIndex];
    const imageUrl = await handleUploadAttachment(file);
    if (imageUrl) {
      setFormData(prev => ({ ...prev, imageUrl }));
      setImages(prev => prev.filter((_, i) => i !== imageIndex));
      toast.success('Image uploaded successfully');
    }
  };

  const handleItemImageUpload = async (itemIndex, imageIndex) => {
    const file = itemImages[itemIndex][imageIndex];
    const imageUrl = await handleUploadAttachment(file);
    if (imageUrl) {
      handleNestedChange(itemIndex, 'imageUrl', imageUrl);
      setItemImages(prev => ({
        ...prev,
        [itemIndex]: prev[itemIndex].filter((_, i) => i !== imageIndex)
      }));
      toast.success('Item image uploaded successfully');
    }
  };

  const handleSubItemImageUpload = async (itemIndex, subItemIndex, imageIndex) => {
    const file = subItemImages[`${itemIndex}_${subItemIndex}`][imageIndex];
    const imageUrl = await handleUploadAttachment(file);
    if (imageUrl) {
      handleSubItemChange(itemIndex, subItemIndex, 'imageUrl', imageUrl);
      setSubItemImages(prev => ({
        ...prev,
        [`${itemIndex}_${subItemIndex}`]: prev[`${itemIndex}_${subItemIndex}`].filter((_, i) => i !== imageIndex)
      }));
      toast.success('Sub-item image uploaded successfully');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    const validationErrors = validateMenuData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      // Clean the data by removing _id fields from items and multiItems
      const cleanedFormData = {
        ...formData,
        items: formData.items.map(item => {
          const { _id, ...cleanItem } = item;
          return {
            ...cleanItem,
            multiItems: (item.multiItems || []).map(subItem => {
              const { _id: subId, ...cleanSubItem } = subItem;
              return cleanSubItem;
            })
          };
        })
      };

      await saveMenu(cleanedFormData);
      toast.success(menu ? 'Menu updated successfully!' : 'Menu created successfully!');
      navigate('/menu');
    } catch (error) {
      console.error('Error saving menu:', error);
      toast.error('Failed to save menu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loading || isPageLoading || isAppLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {menu ? 'Edit Menu' : 'Create New Menu'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-wrap -mx-4">
            {/* App ID */}
            <FormField label="App" required error={errors.appId}>
              <Select
                options={appOptions}
                value={appOptions.find((opt) => opt.value === formData.appId)}
                onChange={(opt) => handleSelectChange('appId', opt)}
                placeholder="Select an app..."
                classNames={{
                  control: ({ isFocused }) =>
                    `bg-primary border ${
                      isFocused ? 'border-secondary' : 'border-focus-color'
                    } border-b-2 rounded-none h-10 px-2 text-text-color`,
                  singleValue: () => `text-focus-color`,
                  placeholder: () => `text-focus-color`,
                  menu: () => `bg-primary text-focus-color`,
                  option: ({ isSelected }) =>
                    `cursor-pointer ${
                      isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
                    }`,
                }}
              />
            </FormField>

            {/* Menu Name */}
            <FormField label="Menu Name" required error={errors.menuName}>
              <input 
                type="text" 
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color" 
                name="menuName" 
                value={formData.menuName} 
                onChange={handleInputChange}
                placeholder="Enter menu name..."
              />
            </FormField>

            {/* Menu Type */}
            <FormField label="Menu Type" required error={errors.menuType}>
              <Select
                options={menuTypeOptions}
                value={menuTypeOptions.find((opt) => opt.value === formData.menuType)}
                onChange={(opt) => handleSelectChange('menuType', opt)}
                classNames={{
                  control: ({ isFocused }) =>
                    `bg-primary border ${
                      isFocused ? 'border-secondary' : 'border-focus-color'
                    } border-b-2 rounded-none h-10 px-2 text-text-color`,
                  singleValue: () => `text-focus-color`,
                  placeholder: () => `text-focus-color`,
                  menu: () => `bg-primary text-focus-color`,
                  option: ({ isSelected }) =>
                    `cursor-pointer ${
                      isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
                    }`,
                }}
              />
            </FormField>

            {/* Layout Type */}
            <FormField label="Layout Type" required error={errors.layoutType}>
              <Select
                options={layoutTypeOptions}
                value={layoutTypeOptions.find((opt) => opt.value === formData.layoutType)}
                onChange={(opt) => handleSelectChange('layoutType', opt)}
                classNames={{
                  control: ({ isFocused }) =>
                    `bg-primary border ${
                      isFocused ? 'border-secondary' : 'border-focus-color'
                    } border-b-2 rounded-none h-10 px-2 text-text-color`,
                  singleValue: () => `text-focus-color`,
                  placeholder: () => `text-focus-color`,
                  menu: () => `bg-primary text-focus-color`,
                  option: ({ isSelected }) =>
                    `cursor-pointer ${
                      isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
                    }`,
                }}
              />
            </FormField>

            {/* Menu Page (Sets Menu Name & Slug) */}
            <FormField label="Menu Page (Sets Menu Name & Slug)" error={errors.menuPage}>
              <Select
                options={pageOptions}
                value={pageOptions.find((opt) => opt.value === formData.menuPage)}
                onChange={(opt) => handleSelectChange('menuPage', opt)}
                placeholder="Select a page (will set menu name and slug)..."
                isClearable
                classNames={{
                  control: ({ isFocused }) =>
                    `bg-primary border ${
                      isFocused ? 'border-secondary' : 'border-focus-color'
                    } border-b-2 rounded-none h-10 px-2 text-text-color`,
                  singleValue: () => `text-focus-color`,
                  placeholder: () => `text-focus-color`,
                  menu: () => `bg-primary text-focus-color`,
                  option: ({ isSelected }) =>
                    `cursor-pointer ${
                      isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
                    }`,
                }}
              />
              {formData.menuName && formData.menuSlug && (
                <div className="mt-2 text-sm text-gray-600">
                  <div>Menu Name: <span className="font-medium">{formData.menuName}</span></div>
                  <div>Menu Slug: <span className="font-medium">/{formData.menuSlug}</span></div>
                </div>
              )}
            </FormField>

            {/* Settings */}
            <FormField label="Settings" className="w-full p-4">
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="allowImage"
                    checked={formData.allowImage}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-text-color">Allow Image</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-text-color">Active</span>
                </label>
              </div>
            </FormField>

            {/* Main Image Upload */}
            {formData.allowImage && (
              <ImageUploadField
                label="Menu Image"
                images={images}
                uploadedImage={formData.imageUrl}
                onDrop={(acceptedFiles) => setImages([...images, ...acceptedFiles])}
                onRemoveNew={(index) => setImages(images.filter((_, i) => i !== index))}
                onRemoveExisting={() => setFormData(prev => ({ ...prev, imageUrl: null }))}
                onUpload={(imageIndex) => handleMainImageUpload(imageIndex)}
                uploadProgress={uploadProgress}
                className="w-full"
              />
            )}
          </div>

          {/* Menu Items Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Add Item
              </button>
            </div>

            {formData.items.map((item, itemIndex) => (
              <div key={itemIndex} className="mb-6 border border-gray-200 rounded-lg">
                <div 
                  className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleAccordion(itemIndex, "menu")}
                >
                  <h3 className="font-medium text-gray-900">
                    Item {itemIndex + 1}: {item.menuName ? `${item.menuName} (/${item.menuSlug})` : 'No Page Selected'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(itemIndex);
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Remove
                    </button>
                    <span className="text-gray-500 text-lg">
                      {activeIndex === itemIndex ? '−' : '+'}
                    </span>
                  </div>
                </div>

                {activeIndex === itemIndex && (
                  <div className="p-4 space-y-4 bg-white">
                    <div className="flex flex-wrap -mx-2">
                      <div className="w-full sm:w-1/2 px-2">
                        <label className="block mb-2 text-text-color">
                          Select Page (Sets Name & Slug) <span className="text-red-500">*</span>
                        </label>
                        <Select
                          options={pageSlugOptions}
                          value={pageSlugOptions.find((opt) => opt.value === item.menuSlug)}
                          onChange={(opt) => handleNestedChange(itemIndex, 'menuSlug', opt?.value || '')}
                          placeholder="Select a page..."
                          isClearable
                          classNames={{
                            control: ({ isFocused }) =>
                              `bg-primary border ${
                                isFocused ? 'border-secondary' : 'border-focus-color'
                              } border-b-2 rounded-none h-10 px-2 text-text-color`,
                            singleValue: () => `text-focus-color`,
                            placeholder: () => `text-focus-color`,
                            menu: () => `bg-primary text-focus-color`,
                            option: ({ isSelected }) =>
                              `cursor-pointer ${
                                isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
                              }`,
                          }}
                        />
                        <ErrorMessage error={errors[`item_${itemIndex}_menuName`]} />
                        {item.menuName && item.menuSlug && (
                          <div className="mt-2 text-sm text-gray-600">
                            <div>Name: <span className="font-medium">{item.menuName}</span></div>
                            <div>Slug: <span className="font-medium">/{item.menuSlug}</span></div>
                          </div>
                        )}
                      </div>

                      <div className="w-full sm:w-1/2 px-2">
                        <label className="block mb-2 text-text-color">
                          Menu Type <span className="text-red-500">*</span>
                        </label>
                        <Select
                          options={itemMenuTypeOptions}
                          value={itemMenuTypeOptions.find((opt) => opt.value === item.menuType)}
                          onChange={(opt) => handleNestedChange(itemIndex, 'menuType', opt?.value || '')}
                          classNames={{
                            control: ({ isFocused }) =>
                              `bg-primary border ${
                                isFocused ? 'border-secondary' : 'border-focus-color'
                              } border-b-2 rounded-none h-10 px-2 text-text-color`,
                            singleValue: () => `text-focus-color`,
                            placeholder: () => `text-focus-color`,
                            menu: () => `bg-primary text-focus-color`,
                            option: ({ isSelected }) =>
                              `cursor-pointer ${
                                isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
                              }`,
                          }}
                        />
                        <ErrorMessage error={errors[`item_${itemIndex}_menuType`]} />
                      </div>
                    </div>

                    <div className="flex flex-wrap -mx-2">
                      <div className="w-full sm:w-1/2 px-2">
                        <label className="block mb-2 text-text-color">Settings</label>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.allowImage || false}
                              onChange={(e) => handleNestedChange(itemIndex, 'allowImage', e.target.checked)}
                              className="mr-2"
                            />
                            <span className="text-text-color">Allow Image</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.active !== undefined ? item.active : true}
                              onChange={(e) => handleNestedChange(itemIndex, 'active', e.target.checked)}
                              className="mr-2"
                            />
                            <span className="text-text-color">Active</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Item Image Upload */}
                    {item.allowImage && (
                      <ImageUploadField
                        label={`Item ${itemIndex + 1} Image`}
                        images={itemImages[itemIndex] || []}
                        uploadedImage={item.imageUrl}
                        onDrop={(acceptedFiles) => setItemImages(prev => ({
                          ...prev,
                          [itemIndex]: [...(prev[itemIndex] || []), ...acceptedFiles]
                        }))}
                        onRemoveNew={(imageIndex) => setItemImages(prev => ({
                          ...prev,
                          [itemIndex]: prev[itemIndex].filter((_, i) => i !== imageIndex)
                        }))}
                        onRemoveExisting={() => handleNestedChange(itemIndex, 'imageUrl', null)}
                        onUpload={(imageIndex) => handleItemImageUpload(itemIndex, imageIndex)}
                        uploadProgress={uploadProgress}
                        className="w-full"
                      />
                    )}

                    {/* Sub Items */}
                    {item.menuType === 'multiple' && (
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-medium text-gray-900">Sub Items</h4>
                          <button
                            type="button"
                            onClick={() => handleAddSubItem(itemIndex)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          >
                            Add Sub Item
                          </button>
                        </div>

                        {item.multiItems?.map((subItem, subItemIndex) => (
                          <div key={subItemIndex} className="mb-4 border border-gray-300 rounded">
                            <div 
                              className="flex justify-between items-center p-3 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
                              onClick={() => toggleAccordion(subItemIndex, `subitem_${itemIndex}`)}
                            >
                              <h5 className="font-medium text-gray-800">
                                Sub Item {subItemIndex + 1}: {subItem.menuName ? `${subItem.menuName} (/${subItem.menuSlug})` : 'No Page Selected'}
                              </h5>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveSubItem(itemIndex, subItemIndex);
                                  }}
                                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                >
                                  Remove
                                </button>
                                <span className="text-gray-500">
                                  {activeSubIndex[`subitem_${itemIndex}`] === subItemIndex ? '−' : '+'}
                                </span>
                              </div>
                            </div>

                            {activeSubIndex[`subitem_${itemIndex}`] === subItemIndex && (
                              <div className="p-3 space-y-3 bg-white">
                                <div className="flex flex-wrap -mx-2">
                                  <div className="w-full sm:w-1/2 px-2">
                                    <label className="block mb-2 text-text-color">
                                      Select Page (Sets Name & Slug) <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                      options={pageSlugOptions}
                                      value={pageSlugOptions.find((opt) => opt.value === subItem.menuSlug)}
                                      onChange={(opt) => handleSubItemChange(itemIndex, subItemIndex, 'menuSlug', opt?.value || '')}
                                      placeholder="Select a page..."
                                      isClearable
                                      classNames={{
                                        control: ({ isFocused }) =>
                                          `bg-primary border ${
                                            isFocused ? 'border-secondary' : 'border-focus-color'
                                          } border-b-2 rounded-none h-10 px-2 text-text-color`,
                                        singleValue: () => `text-focus-color`,
                                        placeholder: () => `text-focus-color`,
                                        menu: () => `bg-primary text-focus-color`,
                                        option: ({ isSelected }) =>
                                          `cursor-pointer ${
                                            isSelected ? 'bg-focus-color text-primary' : 'bg-primary text-focus-color'
                                          }`,
                                      }}
                                    />
                                    <ErrorMessage error={errors[`item_${itemIndex}_subitem_${subItemIndex}_menuName`]} />
                                    {subItem.menuName && subItem.menuSlug && (
                                      <div className="mt-2 text-sm text-gray-600">
                                        <div>Name: <span className="font-medium">{subItem.menuName}</span></div>
                                        <div>Slug: <span className="font-medium">/{subItem.menuSlug}</span></div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="w-full sm:w-1/2 px-2">
                                    <label className="block mb-2 text-text-color">Settings</label>
                                    <div className="flex items-center space-x-4">
                                      <label className="flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={subItem.allowImage || false}
                                          onChange={(e) => handleSubItemChange(itemIndex, subItemIndex, 'allowImage', e.target.checked)}
                                          className="mr-2"
                                        />
                                        <span className="text-text-color">Allow Image</span>
                                      </label>
                                      <label className="flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={subItem.active !== undefined ? subItem.active : true}
                                          onChange={(e) => handleSubItemChange(itemIndex, subItemIndex, 'active', e.target.checked)}
                                          className="mr-2"
                                        />
                                        <span className="text-text-color">Active</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                {/* Sub Item Image Upload */}
                                {subItem.allowImage && (
                                  <ImageUploadField
                                    label={`Sub Item ${subItemIndex + 1} Image`}
                                    images={subItemImages[`${itemIndex}_${subItemIndex}`] || []}
                                    uploadedImage={subItem.imageUrl}
                                    onDrop={(acceptedFiles) => setSubItemImages(prev => ({
                                      ...prev,
                                      [`${itemIndex}_${subItemIndex}`]: [...(prev[`${itemIndex}_${subItemIndex}`] || []), ...acceptedFiles]
                                    }))}
                                    onRemoveNew={(imageIndex) => setSubItemImages(prev => ({
                                      ...prev,
                                      [`${itemIndex}_${subItemIndex}`]: prev[`${itemIndex}_${subItemIndex}`].filter((_, i) => i !== imageIndex)
                                    }))}
                                    onRemoveExisting={() => handleSubItemChange(itemIndex, subItemIndex, 'imageUrl', null)}
                                    onUpload={(imageIndex) => handleSubItemImageUpload(itemIndex, subItemIndex, imageIndex)}
                                    uploadProgress={uploadProgress}
                                    className="w-full"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/menu')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting || isLoading ? 'Saving...' : (menu ? 'Update Menu' : 'Create Menu')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MenuForm;