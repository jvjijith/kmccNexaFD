import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import LoadingScreen from "../ui/loading/loading";
import { useNavigate } from 'react-router';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { closestCenter, DndContext } from '@dnd-kit/core';
import Autosuggest from 'react-autosuggest';
import { languages } from '../../constant';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

// Validation schema based on the provided API schema
const validatePageData = (data) => {
  const errors = {};

  // Required fields validation
  if (!data.slug || data.slug.trim() === '') {
    errors.slug = 'Slug is required';
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
  }

  if (!data.referenceName || data.referenceName.trim() === '') {
    errors.referenceName = 'Reference name is required';
  }

  if (!data.type) {
    errors.type = 'Page type is required';
  }

  // Type-specific validation
  if (data.type === 'internal' && !data.internalType) {
    errors.internalType = 'Internal type is required when page type is internal';
  }

  if (data.type === 'external') {
    if (!data.externalUrl || data.externalUrl.trim() === '') {
      errors.externalUrl = 'External URL is required when page type is external';
    } else if (!/^https?:\/\/.+/.test(data.externalUrl)) {
      errors.externalUrl = 'External URL must be a valid HTTP/HTTPS URL';
    }
  }

  if (data.type === 'details') {
    if (!data.productID && !data.eventID) {
      errors.details = 'Either Product ID or Event ID is required for details page';
    }
  }

  if (data.type === 'productDetails') {
    if (!data.productID) {
      errors.details = 'Product ID is required for product details page';
    }
  }

  if (data.type === 'eventDetails') {
    if (!data.eventID) {
      errors.details = 'Event ID is required for event details page';
    }
  }

  // URL validation for canonical URL
  if (data.canonicalUrl && !/^https?:\/\/.+/.test(data.canonicalUrl)) {
    errors.canonicalUrl = 'Canonical URL must be a valid HTTP/HTTPS URL';
  }

  // Twitter creator validation (should be a valid Twitter handle)
  if (data.twitterCreator && !/^@?[A-Za-z0-9_]+$/.test(data.twitterCreator)) {
    errors.twitterCreator = 'Twitter creator must be a valid Twitter handle';
  }

  // Validate title array
  if (data.title && data.title.length > 0) {
    data.title.forEach((titleItem, index) => {
      if (titleItem.lanCode && !titleItem.title) {
        errors[`title_${index}`] = 'Title is required when language code is provided';
      }
      if (titleItem.title && !titleItem.lanCode) {
        errors[`title_lang_${index}`] = 'Language code is required when title is provided';
      }
    });
  }

  // Validate meta description array
  if (data.metaDescription && data.metaDescription.length > 0) {
    data.metaDescription.forEach((metaItem, index) => {
      if (metaItem.lanCode && !metaItem.description) {
        errors[`meta_${index}`] = 'Description is required when language code is provided';
      }
      if (metaItem.description && !metaItem.lanCode) {
        errors[`meta_lang_${index}`] = 'Language code is required when description is provided';
      }
    });
  }

  // Validate OG title array
  if (data.ogTitle && data.ogTitle.length > 0) {
    data.ogTitle.forEach((ogTitleItem, index) => {
      if (ogTitleItem.lanCode && !ogTitleItem.title) {
        errors[`og_title_${index}`] = 'OG title is required when language code is provided';
      }
      if (ogTitleItem.title && !ogTitleItem.lanCode) {
        errors[`og_title_lang_${index}`] = 'Language code is required when OG title is provided';
      }
    });
  }

  // Validate OG description array
  if (data.ogDescription && data.ogDescription.length > 0) {
    data.ogDescription.forEach((ogDescItem, index) => {
      if (ogDescItem.lanCode && !ogDescItem.description) {
        errors[`og_desc_${index}`] = 'OG description is required when language code is provided';
      }
      if (ogDescItem.description && !ogDescItem.lanCode) {
        errors[`og_desc_lang_${index}`] = 'Language code is required when OG description is provided';
      }
    });
  }

  // Validate number items
  if (data.numberItems) {
    if (data.numberItems.web < 0) errors.numberItems_web = 'Web items must be 0 or greater';
    if (data.numberItems.android < 0) errors.numberItems_android = 'Android items must be 0 or greater';
    if (data.numberItems.iOS < 0) errors.numberItems_iOS = 'iOS items must be 0 or greater';
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

function SortableItem({ id, item, container, handleRemove }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const handleRemoveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleRemove();
  };

  const handleContainerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (container) {
      navigate('/container/edit', { state: { container } });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: `translate3d(${transform?.x}px, ${transform?.y}px, 0)`,
        transition,
      }}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 4h2v2H2V4zm4 0h2v2H6V4zm4 0h2v2h-2V4zM2 8h2v2H2V8zm4 0h2v2H6V8zm4 0h2v2h-2V8zM2 12h2v2H2v-2zm4 0h2v2H6v-2zm4 0h2v2h-2v-2z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div
              className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
              onClick={handleContainerClick}
              title="Click to edit container"
            >
              {item}
            </div>
            <div className="text-sm text-gray-500">Container</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemoveClick}
          className="ml-3 px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function PageForm({ pageDatas }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageData, setPageData] = useState(() => ({
    slug: "",
    referenceName: "",
    items: [],
    type: "normal",
    internalType: "",
    externalUrl: "",
    productID: "",
    eventID: "",
    bannerImage: "",
    portraitImage: "",
    landscapeImage: "",
    available: [],
    numberItems: { web: 0, android: 0, iOS: 0 },
    title: [],
    metaDescription: [],
    keywords: [],
    canonicalUrl: "",
    ogTitle: [],
    ogDescription: [],
    ogImage: "",
    twitterCard: "summary",
    twitterCreator: "",
    publish: false,
    draft: true,
  }));
  const [suggestions, setSuggestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Image upload states
  const [uploadProgress, setUploadProgress] = useState({});
  const [mediaId, setMediaId] = useState('');
  const [imageUploads, setImageUploads] = useState({
    bannerImage: null,
    portraitImage: null,
    landscapeImage: null,
    ogImage: null
  });

  const limit = 100;

  const mutationHook = pageDatas ? usePutData : usePostData;
  const api_url = pageDatas ? `/pages/${pageDatas._id}` : '/pages';
  const api_key = pageDatas ? 'updatePage' : 'addPage';
  const { mutate: saveLayout, isLoading: isSavingMutation } = mutationHook(api_key, api_url);

  // Fetch app data
  const { data: appData, isLoading: isAppLoading } = useGetData("appdata", `/app?limit=${limit}`, {});

  // Fetch container data
  const { data: containerData, isLoading: isContainerLoading } = useGetData("containerdata", `/containers?limit=${limit}`, {});

  // Media upload API hooks
  const { mutateAsync: generateSignedUrl } = usePostData('signedUrl', '/media/generateSignedUrl');
  const { mutateAsync: updateMediaStatus } = usePutData('updateMediaStatus', `/media/update/${mediaId}`, { enabled: !!mediaId });

  // Page type options based on schema
  const pageTypeOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'details', label: 'Details' },
    { value: 'landing', label: 'Landing' },
    { value: 'internal', label: 'Internal' },
    { value: 'external', label: 'External' },
    { value: 'search', label: 'Search' },
    { value: 'eventDetails', label: 'Event Details' },
    { value: 'productDetails', label: 'Product Details' },
  ];

  // Internal type options based on schema
  const internalTypeOptions = [
    { value: 'payment', label: 'Payment' },
    { value: 'login', label: 'Login' },
    { value: 'cart', label: 'Cart' },
    { value: 'orders', label: 'Orders' },
    { value: 'profile', label: 'Profile' },
    { value: 'quotes', label: 'Quotes' },
    { value: 'home', label: 'Home' },
  ];

  // Twitter card options based on schema
  const twitterCardOptions = [
    { value: 'summary', label: 'Summary' },
    { value: 'summary_large_image', label: 'Summary Large Image' },
    { value: 'app', label: 'App' },
    { value: 'player', label: 'Player' },
  ];

  const removeUnwantedFields = (data, fields = ['_id', 'updated_at', 'created_at', '__v']) => {
    if (Array.isArray(data)) {
      return data.map((item) => removeUnwantedFields(item, fields));
    } else if (typeof data === 'object' && data !== null) {
      return Object.keys(data).reduce((acc, key) => {
        if (!fields.includes(key)) {
          acc[key] = removeUnwantedFields(data[key], fields);
        }
        return acc;
      }, {});
    }
    return data;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (pageDatas) {
      const cleanedContainer = removeUnwantedFields(pageDatas);
      const transformedAppId = pageDatas.available?.map(avail => ({
        appId: avail.appId?._id || avail.appId,
      })) || [];
      const transformedItems = pageDatas.items?.map((item) => item._id || item).filter(Boolean) || [];

      setPageData({
        slug: pageDatas.slug || "",
        referenceName: pageDatas.referenceName || "",
        items: transformedItems,
        type: pageDatas.type || "normal",
        internalType: pageDatas.internalType || "",
        externalUrl: pageDatas.externalUrl || "",
        productID: pageDatas.productID || "",
        eventID: pageDatas.eventID || "",
        bannerImage: pageDatas.bannerImage || "",
        portraitImage: pageDatas.portraitImage || "",
        landscapeImage: pageDatas.landscapeImage || "",
        available: transformedAppId,
        numberItems: pageDatas.numberItems || { web: 0, android: 0, iOS: 0 },
        title: cleanedContainer.title || [{ lanCode: "", title: "" }],
        metaDescription: cleanedContainer.metaDescription || [{ lanCode: "", description: "" }],
        keywords: cleanedContainer.keywords || [],
        canonicalUrl: pageDatas.canonicalUrl || "",
        ogTitle: cleanedContainer.ogTitle || [{ lanCode: "", title: "" }],
        ogDescription: cleanedContainer.ogDescription || [{ lanCode: "", description: "" }],
        ogImage: pageDatas.ogImage || "",
        twitterCard: pageDatas.twitterCard || "summary",
        twitterCreator: pageDatas.twitterCreator || "",
        publish: pageDatas.publish || false,
        draft: pageDatas.draft !== undefined ? pageDatas.draft : true,
      });
    }
  }, [pageDatas]);

  // Validation on form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validatePageData(pageData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors before submitting.');
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    
    saveLayout(pageData, {
      onSuccess: (response) => {
        console.log("response", response);
        navigate('/store/appmanagement/page');
        toast.success('Page saved successfully!');
        setIsSubmitting(false);
      },
      onError: (error) => {
        toast.error('Failed to save page.');
        console.error(error);
        setIsSubmitting(false);
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPageData((prevData) => ({ ...prevData, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNestedChange = (field, index, nestedField, value) => {
    setPageData((prevData) => {
      const updatedField = prevData[field].map((item, idx) =>
        idx === index ? { ...item, [nestedField]: value } : item
      );
      return { ...prevData, [field]: updatedField };
    });

    // Clear related errors
    const errorKey = `${field}_${index}`;
    const langErrorKey = `${field}_lang_${index}`;
    if (errors[errorKey] || errors[langErrorKey]) {
      setErrors(prev => ({ 
        ...prev, 
        [errorKey]: undefined,
        [langErrorKey]: undefined 
      }));
    }
  };

  const handleTypeChange = (selectedOption) => {
    setPageData((prevData) => ({
      ...prevData,
      type: selectedOption.value,
      // Clear related fields when type changes
      internalType: selectedOption.value === 'internal' ? prevData.internalType : "",
      externalUrl: selectedOption.value === 'external' ? prevData.externalUrl : "",
      productID: ['details', 'productDetails'].includes(selectedOption.value) ? prevData.productID : "",
      eventID: ['details', 'eventDetails'].includes(selectedOption.value) ? prevData.eventID : "",
    }));

    // Clear type-related errors
    setErrors(prev => ({
      ...prev,
      type: undefined,
      internalType: undefined,
      externalUrl: undefined,
      details: undefined
    }));
  };

  const handleAvailableChange = (selectedOptions) => {
    const selectedAppIds = selectedOptions?.map(option => ({ appId: option.value })) || [];
    setPageData(prevData => ({
      ...prevData,
      available: selectedAppIds,
    }));
  };

  // Auto-generate slug from reference name
  const generateSlug = (referenceName) => {
    return referenceName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleReferenceNameChange = (e) => {
    const value = e.target.value;
    setPageData(prevData => ({
      ...prevData,
      referenceName: value,
      // Auto-generate slug if it's empty or matches the previous auto-generated slug
      slug: !prevData.slug || prevData.slug === generateSlug(prevData.referenceName) 
        ? generateSlug(value) 
        : prevData.slug
    }));

    if (errors.referenceName) {
      setErrors(prev => ({ ...prev, referenceName: undefined }));
    }
  };

  // Add/Remove functions for dynamic arrays
  const addTitle = () => {
    setPageData((prevData) => ({
      ...prevData,
      title: [...prevData.title, { lanCode: "", title: "" }],
    }));
  };

  const removeTitle = (index) => {
    setPageData((prevData) => ({
      ...prevData,
      title: prevData.title.filter((_, idx) => idx !== index),
    }));
  };

  const addMetaDescription = () => {
    setPageData((prevData) => ({
      ...prevData,
      metaDescription: [...prevData.metaDescription, { lanCode: "", description: "" }],
    }));
  };

  const removeMetaDescription = (index) => {
    setPageData((prevData) => ({
      ...prevData,
      metaDescription: prevData.metaDescription.filter((_, idx) => idx !== index),
    }));
  };

  const addOgTitle = () => {
    setPageData((prevData) => ({
      ...prevData,
      ogTitle: [...prevData.ogTitle, { lanCode: "", title: "" }],
    }));
  };

  const removeOgTitle = (index) => {
    setPageData((prevData) => ({
      ...prevData,
      ogTitle: prevData.ogTitle.filter((_, idx) => idx !== index),
    }));
  };

  const addOgDescription = () => {
    setPageData((prevData) => ({
      ...prevData,
      ogDescription: [...prevData.ogDescription, { lanCode: "", description: "" }],
    }));
  };

  const removeOgDescription = (index) => {
    setPageData((prevData) => ({
      ...prevData,
      ogDescription: prevData.ogDescription.filter((_, idx) => idx !== index),
    }));
  };

  // Autosuggest functions
  const handleSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    return inputLength === 0 ? [] : languages.filter(
      lang => lang.name.toLowerCase().slice(0, inputLength) === inputValue
    );
  };

  const getSuggestionValue = (suggestion) => suggestion.code;

  const renderSuggestion = (suggestion) => (
    <div className="p-2 hover:bg-gray-100 cursor-pointer text-gray-900">
      {suggestion.name} ({suggestion.code})
    </div>
  );

  // Container selection
  const handleContainerSelect = (selectedContainer) => {
    if (!selectedContainer) return;
    
    setPageData((prevData) => {
      if (prevData.items.includes(selectedContainer._id)) {
        toast.warning('Container already added');
        return prevData;
      }
      return {
        ...prevData,
        items: [...prevData.items, selectedContainer._id],
      };
    });
  };

  const handleRemoveItem = (index) => {
    setPageData((prevData) => ({
      ...prevData,
      items: prevData.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setPageData((prevData) => ({
        ...prevData,
        items: arrayMove(prevData.items, active.id, over.id),
      }));
    }
  };

  // Image upload functions
  const handleImageUpload = async (file, imageKey) => {
    try {
      console.log(`Generating signed URL for ${file.name}`);

      const signedUrlResponse = await generateSignedUrl({
        title: file.name,
        mediaType: "image",
        ext: file.name.split('.').pop(),
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
          setUploadProgress(prev => ({ ...prev, [imageKey]: progress }));

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

      // Update the page data with the new image URL
      setPageData(prev => ({
        ...prev,
        [imageKey]: imageUrl
      }));

      // Clear the upload state
      setImageUploads(prev => ({
        ...prev,
        [imageKey]: null
      }));

      toast.success('Image uploaded successfully!');

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('An error occurred while uploading the image. Please try again.');
    }
  };

  const handleRemoveImage = (imageKey) => {
    setPageData(prev => ({
      ...prev,
      [imageKey]: ""
    }));
    setImageUploads(prev => ({
      ...prev,
      [imageKey]: null
    }));
    setUploadProgress(prev => ({
      ...prev,
      [imageKey]: 0
    }));
  };

  // Helper function to prepare data for API submission
  const prepareDataForSubmission = (data) => {
    const { productID, eventID, ...baseData } = data;

    // Only include productID and eventID if type is 'details'
    // For 'productDetails' and 'eventDetails', exclude them from API submission
    if (data.type === 'details') {
      return {
        ...baseData,
        productID,
        eventID
      };
    }

    // For all other types (including 'productDetails' and 'eventDetails'), exclude productID and eventID
    return baseData;
  };

  const handleDraftSubmit = () => {
    const baseData = { ...pageData, draft: true, publish: false };
    const dataToSave = prepareDataForSubmission(baseData);
    const validationErrors = validatePageData(baseData); // Validate with original data for proper validation

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors before saving draft.');
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    saveLayout(dataToSave, {
      onSuccess: (response) => {
        // Don't navigate away after drafting - stay on the form
        toast.success('Draft saved successfully!');
        setIsSubmitting(false);
        // Update the local state to reflect the draft status
        setPageData(prev => ({ ...prev, draft: true, publish: false }));
      },
      onError: (error) => {
        toast.error('Failed to save draft.');
        console.error(error);
        setIsSubmitting(false);
      }
    });
  };

  const handlePublishSubmit = () => {
    // Check if it's a new page (not drafted yet)
    if (!pageData.draft && !pageDatas) {
      toast.error('Please save as draft first before publishing.');
      return;
    }

    const baseData = { ...pageData, draft: false, publish: true };
    const dataToSave = prepareDataForSubmission(baseData);
    const validationErrors = validatePageData(baseData); // Validate with original data for proper validation

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors before publishing.');
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    saveLayout(dataToSave, {
      onSuccess: (response) => {
        // Only navigate away after publishing
        navigate('/store/appmanagement/page');
        toast.success('Page published successfully!');
        setIsSubmitting(false);
      },
      onError: (error) => {
        toast.error('Failed to publish page.');
        console.error(error);
        setIsSubmitting(false);
      }
    });
  };

  const renderSubmitButtons = () => {
    const { draft, publish } = pageData;
    const isLoading = isSubmitting || isSavingMutation;
    const isNewPage = !pageDatas; // Check if this is a new page

    // For new pages, only show draft button initially
    if (isNewPage && !draft) {
      return (
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleDraftSubmit}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      );
    }

    // For drafted pages (new or existing), show both draft and publish buttons
    if (draft && !publish) {
      return (
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleDraftSubmit}
            disabled={isLoading}
            className="bg-gray-600 text-btn-text-color px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Update Draft'}
          </button>
          <button
            type="button"
            onClick={handlePublishSubmit}
            disabled={isLoading}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      );
    }

    // For published pages, show draft and update published buttons
    else if (!draft && publish) {
      return (
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleDraftSubmit}
            disabled={isLoading}
            className="bg-gray-600 text-btn-text-color px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Move to Draft'}
          </button>
          <button
            type="button"
            onClick={handlePublishSubmit}
            disabled={isLoading}
            className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded-md hover:bg-primary-button-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Update Published'}
          </button>
        </div>
      );
    }

    // Fallback (shouldn't normally reach here)
    else {
      return (
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleDraftSubmit}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      );
    }
  };

  // Drag and drop image upload component
  const ImageUpload = ({ label, imageKey, required = false }) => {
    const { getRootProps, getInputProps } = useDropzone({
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
      },
      maxFiles: 1,
      onDrop: (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
          const file = acceptedFiles[0];
          setImageUploads(prev => ({
            ...prev,
            [imageKey]: file
          }));
        }
      },
      onDropRejected: () => {
        toast.error('Only one image file is allowed. Please select a valid image file.');
      }
    });

    const currentImage = pageData[imageKey];
    const pendingUpload = imageUploads[imageKey];
    const uploadProgressValue = uploadProgress[imageKey] || 0;

    return (
      <FormField label={label} required={required} error={errors[imageKey]} className="w-full sm:w-1/2 p-4">
        <div className="space-y-4">
          {/* Current Image Display */}
          {currentImage && !pendingUpload && (
            <div className="relative">
              <img
                src={currentImage}
                alt={label}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(imageKey)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Drag and Drop Area */}
          {!currentImage && !pendingUpload && (
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <input {...getInputProps()} />
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600 mb-1">Drag & drop an image here, or click to select</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 10MB</p>
            </div>
          )}

          {/* Pending Upload Display */}
          {pendingUpload && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{pendingUpload.name}</p>
                    <p className="text-xs text-gray-500">{(pendingUpload.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleImageUpload(pendingUpload, imageKey)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploads(prev => ({ ...prev, [imageKey]: null }))}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgressValue > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgressValue}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>
      </FormField>
    );
  };

  if (loading || isAppLoading || isContainerLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className=" mx-auto">
      {/* <div className="bg-secondary-card rounded-lg p-6 border-0"> */}
        <h2 className="text-2xl font-bold text-text-color mb-6">
          {pageDatas ? 'Edit Page' : 'Create New Page'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-color mb-4 border-b border-border pb-2">
              Basic Information
            </h3>
            <div className="flex flex-wrap -mx-2">
              <FormField label="Reference Name" required error={errors.referenceName}>
                <input
                  type="text"
                  name="referenceName"
                  value={pageData.referenceName}
                  onChange={handleReferenceNameChange}
                  className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                  placeholder="Enter a descriptive name for this page"
                />
              </FormField>

              <FormField label="Slug" required error={errors.slug}>
                <input
                  type="text"
                  name="slug"
                  value={pageData.slug}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                  placeholder="url-friendly-slug"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Only lowercase letters, numbers, and hyphens allowed
                </div>
              </FormField>

              <FormField label="Page Type" required error={errors.type}>
                <Select
                  options={pageTypeOptions}
                  value={pageTypeOptions.find(option => option.value === pageData.type)}
                  onChange={handleTypeChange}
                  classNames={{
                    control: ({ isFocused }) =>
                      `bg-primary border ${
                        isFocused ? 'border-primary-button-color' : 'border-focus-color'
                      } rounded px-2 text-text-color`,
                    singleValue: () => `text-focus-color`,
                    placeholder: () => `text-focus-color`,
                    menu: () => `bg-primary text-focus-color`,
                    option: ({ isSelected }) =>
                      `cursor-pointer p-2 ${
                        isSelected ? 'bg-primary-button-color text-primary' : 'bg-primary text-focus-color hover:bg-gray-700'
                      }`,
                  }}
                />
              </FormField>

              {/* Conditional fields based on page type */}
              {pageData.type === 'internal' && (
                <FormField label="Internal Type" required error={errors.internalType}>
                  <Select
                    options={internalTypeOptions}
                    value={internalTypeOptions.find(option => option.value === pageData.internalType)}
                    onChange={(selectedOption) => 
                      setPageData(prev => ({ ...prev, internalType: selectedOption.value }))
                    }
                    classNames={{
                      control: ({ isFocused }) =>
                        `bg-primary border ${
                          isFocused ? 'border-primary-button-color' : 'border-focus-color'
                        } rounded px-2 text-text-color`,
                      singleValue: () => `text-focus-color`,
                      placeholder: () => `text-focus-color`,
                      menu: () => `bg-primary text-focus-color`,
                      option: ({ isSelected }) =>
                        `cursor-pointer p-2 ${
                          isSelected ? 'bg-primary-button-color text-primary' : 'bg-primary text-focus-color hover:bg-gray-700'
                        }`,
                    }}
                  />
                </FormField>
              )}

              {pageData.type === 'external' && (
                <FormField label="External URL" required error={errors.externalUrl}>
                  <input
                    type="url"
                    name="externalUrl"
                    value={pageData.externalUrl}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                    placeholder="https://example.com"
                  />
                </FormField>
              )}

              {pageData.type === 'productDetails' && (
                <FormField label="Product ID" error={errors.details}>
                  <input
                    type="text"
                    name="productID"
                    value={pageData.productID}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                    placeholder="Enter product ID"
                  />
                </FormField>
              )}

              {pageData.type === 'eventDetails' && (
                <FormField label="Event ID" error={errors.details}>
                  <input
                    type="text"
                    name="eventID"
                    value={pageData.eventID}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                    placeholder="Enter event ID"
                  />
                </FormField>
              )}

              {pageData.type === 'details' && (
                <>
                  <FormField label="Product ID" error={errors.details}>
                    <input
                      type="text"
                      name="productID"
                      value={pageData.productID}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                      placeholder="Enter product ID"
                    />
                  </FormField>

                  <FormField label="Event ID" error={errors.details}>
                    <input
                      type="text"
                      name="eventID"
                      value={pageData.eventID}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                      placeholder="Enter event ID"
                    />
                  </FormField>
                </>
              )}
            </div>
          </div>

          {/* Images Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-color mb-4 border-b border-border pb-2">
              Images
            </h3>
            <div className="flex flex-wrap -mx-2">
              <ImageUpload label="Banner Image" imageKey="bannerImage" />
              <ImageUpload label="Portrait Image" imageKey="portraitImage" />
              <ImageUpload label="Landscape Image" imageKey="landscapeImage" />
            </div>
          </div>

          {/* Configuration Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-color mb-4 border-b border-border pb-2">
              Configuration
            </h3>
            <div className="flex flex-wrap -mx-2">
              <FormField label="Available Apps">
                <Select
                  isMulti
                  options={appData?.apps?.map((app) => ({
                    value: app._id,
                    label: app.title,
                  })) || []}
                  onChange={handleAvailableChange}
                  value={pageData.available.map((item) => ({
                    value: item.appId,
                    label: appData?.apps?.find((app) => app._id === item.appId)?.title || "Unknown",
                  }))}
                  isLoading={isAppLoading}
                  classNames={{
                    control: ({ isFocused }) =>
                      `bg-primary border ${
                        isFocused ? 'border-primary-button-color' : 'border-focus-color'
                      } rounded px-2 text-text-color`,
                    multiValue: () => `bg-primary-button-color text-btn-text-color rounded px-2 py-1 m-1`,
                    multiValueLabel: () => `text-btn-text-color`,
                    multiValueRemove: () => `text-btn-text-color hover:bg-red-500 rounded-r`,
                    placeholder: () => `text-focus-color`,
                    menu: () => `bg-primary text-focus-color`,
                    option: ({ isSelected }) =>
                      `cursor-pointer p-2 ${
                        isSelected ? 'bg-primary-button-color text-primary' : 'bg-primary text-focus-color hover:bg-gray-700'
                      }`,
                  }}
                />
              </FormField>

              <FormField label="Keywords">
                <input
                  type="text"
                  name="keywords"
                  value={pageData.keywords.join(", ")}
                  onChange={(e) =>
                    setPageData((prevData) => ({
                      ...prevData,
                      keywords: e.target.value.split(",").map((kw) => kw.trim()).filter(kw => kw),
                    }))
                  }
                  className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Separate keywords with commas
                </div>
              </FormField>

              <FormField label="Canonical URL" error={errors.canonicalUrl}>
                <input
                  type="url"
                  name="canonicalUrl"
                  value={pageData.canonicalUrl}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                  placeholder="https://example.com/canonical-url"
                />
              </FormField>
            </div>

            {/* Number Items */}
            <div className="mt-4">
              <h4 className="text-md font-medium text-text-color mb-3">Number of Items per Platform</h4>
              <div className="flex flex-wrap -mx-2">
                <FormField label="Web Items" error={errors.numberItems_web} className="w-full sm:w-1/3 p-4">
                  <input
                    type="number"
                    min="0"
                    value={pageData.numberItems.web}
                    onChange={(e) => setPageData(prev => ({
                      ...prev,
                      numberItems: { ...prev.numberItems, web: parseInt(e.target.value) || 0 }
                    }))}
                    className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                  />
                </FormField>

                <FormField label="Android Items" error={errors.numberItems_android} className="w-full sm:w-1/3 p-4">
                  <input
                    type="number"
                    min="0"
                    value={pageData.numberItems.android}
                    onChange={(e) => setPageData(prev => ({
                      ...prev,
                      numberItems: { ...prev.numberItems, android: parseInt(e.target.value) || 0 }
                    }))}
                    className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                  />
                </FormField>

                <FormField label="iOS Items" error={errors.numberItems_iOS} className="w-full sm:w-1/3 p-4">
                  <input
                    type="number"
                    min="0"
                    value={pageData.numberItems.iOS}
                    onChange={(e) => setPageData(prev => ({
                      ...prev,
                      numberItems: { ...prev.numberItems, iOS: parseInt(e.target.value) || 0 }
                    }))}
                    className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* SEO Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-color mb-4 border-b border-border pb-2">
              SEO & Meta Information
            </h3>

            {/* Titles */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-text-color font-medium">Page Titles</label>
                <button 
                  type="button" 
                  className="bg-primary-button-color text-btn-text-color px-3 py-1 rounded text-sm hover:bg-primary-button-hover" 
                  onClick={addTitle}
                >
                  Add Title
                </button>
              </div>
              <div className="space-y-3">
                {pageData.title.length === 0 && (
                  <p className='text-gray-400 text-sm'>No titles added</p>
                )}
                {pageData.title.map((titleItem, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <Autosuggest
                        suggestions={suggestions}
                        onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
                        onSuggestionsClearRequested={handleSuggestionsClearRequested}
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        inputProps={{
                          placeholder: 'Language Code (e.g., en, es)',
                          value: titleItem.lanCode,
                          onChange: (e, { newValue }) =>
                            handleNestedChange('title', index, 'lanCode', newValue),
                          className: 'block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none'
                        }}
                        theme={{
                          container: 'relative',
                          suggestionsContainer: 'absolute w-full bg-secondary-card border rounded-md z-10 mt-1',
                          suggestion: 'p-2 cursor-pointer hover:bg-gray-700 text-gray-900',
                          suggestionHighlighted: 'bg-primary-button-color text-btn-text-color'
                        }}
                      />
                      <ErrorMessage error={errors[`title_lang_${index}`]} />
                    </div>
                    <div className="flex-2">
                      <input
                        type="text"
                        value={titleItem.title}
                        onChange={(e) => handleNestedChange('title', index, 'title', e.target.value)}
                        className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                        placeholder="Page Title"
                      />
                      <ErrorMessage error={errors[`title_${index}`]} />
                    </div>
                    <button
                      type="button"
                      className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                      onClick={() => removeTitle(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta Descriptions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-text-color font-medium">Meta Descriptions</label>
                <button 
                  type="button" 
                  className="bg-primary-button-color text-btn-text-color px-3 py-1 rounded text-sm hover:bg-primary-button-hover" 
                  onClick={addMetaDescription}
                >
                  Add Description
                </button>
              </div>
              <div className="space-y-3">
                {pageData.metaDescription.length === 0 && (
                  <p className='text-gray-400 text-sm'>No meta descriptions added</p>
                )}
                {pageData.metaDescription.map((metaItem, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <Autosuggest
                        suggestions={suggestions}
                        onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
                        onSuggestionsClearRequested={handleSuggestionsClearRequested}
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        inputProps={{
                          placeholder: 'Language Code (e.g., en, es)',
                          value: metaItem.lanCode,
                          onChange: (e, { newValue }) =>
                            handleNestedChange('metaDescription', index, 'lanCode', newValue),
                          className: 'block w-full px-3 py-2 text-gray-900 secondary-card border rounded focus:border-primary-button-color focus:outline-none'
                        }}
                        theme={{
                          container: 'relative',
                          suggestionsContainer: 'absolute w-full bg-secondary-card border rounded-md z-10 mt-1',
                          suggestion: 'p-2 cursor-pointer hover:bg-gray-700 text-gray-900',
                          suggestionHighlighted: 'bg-primary-button-color text-btn-text-color'
                        }}
                      />
                      <ErrorMessage error={errors[`meta_lang_${index}`]} />
                    </div>
                    <div className="flex-2">
                      <textarea
                        value={metaItem.description}
                        onChange={(e) => handleNestedChange('metaDescription', index, 'description', e.target.value)}
                        className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                        placeholder="Meta Description"
                        rows="2"
                      />
                      <ErrorMessage error={errors[`meta_${index}`]} />
                    </div>
                    <button
                      type="button"
                      className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                      onClick={() => removeMetaDescription(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-color mb-4 border-b border-border pb-2">
              Social Media & Open Graph
            </h3>

            <div className="flex flex-wrap -mx-2 mb-6">
              <ImageUpload label="OG Image" imageKey="ogImage" />

              <FormField label="Twitter Card Type">
                <Select
                  options={twitterCardOptions}
                  value={twitterCardOptions.find(option => option.value === pageData.twitterCard)}
                  onChange={(selectedOption) => 
                    setPageData(prev => ({ ...prev, twitterCard: selectedOption.value }))
                  }
                  classNames={{
                    control: ({ isFocused }) =>
                      `bg-primary border ${
                        isFocused ? 'border-primary-button-color' : 'border-focus-color'
                      } rounded px-2 text-text-color`,
                    singleValue: () => `text-focus-color`,
                    placeholder: () => `text-focus-color`,
                    menu: () => `bg-primary text-focus-color`,
                    option: ({ isSelected }) =>
                      `cursor-pointer p-2 ${
                        isSelected ? 'bg-primary-button-color text-primary' : 'bg-primary text-focus-color hover:bg-gray-700'
                      }`,
                  }}
                />
              </FormField>

              <FormField label="Twitter Creator" error={errors.twitterCreator}>
                <input
                  type="text"
                  name="twitterCreator"
                  value={pageData.twitterCreator}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                  placeholder="@username"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Twitter handle (with or without @)
                </div>
              </FormField>
            </div>

            {/* OG Titles */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-text-color font-medium">Open Graph Titles</label>
                <button 
                  type="button" 
                  className="bg-primary-button-color text-btn-text-color px-3 py-1 rounded text-sm hover:bg-primary-button-hover" 
                  onClick={addOgTitle}
                >
                  Add OG Title
                </button>
              </div>
              <div className="space-y-3">
                {pageData.ogTitle.length === 0 && (
                  <p className='text-gray-400 text-sm'>No OG titles added</p>
                )}
                {pageData.ogTitle.map((ogTitleItem, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <Autosuggest
                        suggestions={suggestions}
                        onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
                        onSuggestionsClearRequested={handleSuggestionsClearRequested}
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        inputProps={{
                          placeholder: 'Language Code (e.g., en, es)',
                          value: ogTitleItem.lanCode,
                          onChange: (e, { newValue }) =>
                            handleNestedChange('ogTitle', index, 'lanCode', newValue),
                          className: 'block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none'
                        }}
                        theme={{
                          container: 'relative',
                          suggestionsContainer: 'absolute w-full bg-secondary-card border rounded-md z-10 mt-1',
                          suggestion: 'p-2 cursor-pointer hover:bg-gray-700 text-gray-900',
                          suggestionHighlighted: 'bg-primary-button-color text-btn-text-color'
                        }}
                      />
                      <ErrorMessage error={errors[`og_title_lang_${index}`]} />
                    </div>
                    <div className="flex-2">
                      <input
                        type="text"
                        value={ogTitleItem.title}
                        onChange={(e) => handleNestedChange('ogTitle', index, 'title', e.target.value)}
                        className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                        placeholder="OG Title"
                      />
                      <ErrorMessage error={errors[`og_title_${index}`]} />
                    </div>
                    <button
                      type="button"
                      className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                      onClick={() => removeOgTitle(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* OG Descriptions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-text-color font-medium">Open Graph Descriptions</label>
                <button 
                  type="button" 
                  className="bg-primary-button-color text-btn-text-color px-3 py-1 rounded text-sm hover:bg-primary-button-hover" 
                  onClick={addOgDescription}
                >
                  Add OG Description
                </button>
              </div>
              <div className="space-y-3">
                {pageData.ogDescription.length === 0 && (
                  <p className='text-gray-400 text-sm'>No OG descriptions added</p>
                )}
                {pageData.ogDescription.map((ogDescItem, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <Autosuggest
                        suggestions={suggestions}
                        onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
                        onSuggestionsClearRequested={handleSuggestionsClearRequested}
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        inputProps={{
                          placeholder: 'Language Code (e.g., en, es)',
                          value: ogDescItem.lanCode,
                          onChange: (e, { newValue }) =>
                            handleNestedChange('ogDescription', index, 'lanCode', newValue),
                          className: 'block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none'
                        }}
                        theme={{
                          container: 'relative',
                          suggestionsContainer: 'absolute w-full bg-secondary-card border rounded-md z-10 mt-1',
                          suggestion: 'p-2 cursor-pointer hover:bg-gray-700 text-gray-900',
                          suggestionHighlighted: 'bg-primary-button-color text-btn-text-color'
                        }}
                      />
                      <ErrorMessage error={errors[`og_desc_lang_${index}`]} />
                    </div>
                    <div className="flex-2">
                      <textarea
                        value={ogDescItem.description}
                        onChange={(e) => handleNestedChange('ogDescription', index, 'description', e.target.value)}
                        className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                        placeholder="OG Description"
                        rows="2"
                      />
                      <ErrorMessage error={errors[`og_desc_${index}`]} />
                    </div>
                    <button
                      type="button"
                      className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                      onClick={() => removeOgDescription(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Container Selection Section */}
          {containerData?.containers && (
            <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-text-color mb-4 border-b border-border pb-2">
                Page Containers
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select containers to include in this page. You can drag and drop to reorder them.
              </p>
              <div className="mb-6">
                <Select
                  options={containerData.containers.map((container) => ({
                    value: container._id,
                    label: `${container.referenceName} - ${container.description || 'No description'}`,
                    container: container
                  }))}
                  onChange={(selectedOption) => handleContainerSelect(selectedOption.container)}
                  placeholder="Select a container to add..."
                  classNames={{
                    control: ({ isFocused }) =>
                      `bg-white border-2 ${
                        isFocused ? 'border-blue-500' : 'border-gray-300'
                      } rounded-md px-3 py-2 text-gray-900 shadow-sm hover:border-gray-400 transition-colors`,
                    singleValue: () => `text-gray-900`,
                    placeholder: () => `text-gray-500`,
                    menu: () => `bg-white border border-gray-200 text-gray-900 rounded-md shadow-lg mt-1`,
                    option: ({ isSelected, isFocused }) =>
                      `cursor-pointer px-3 py-2 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : isFocused
                            ? 'bg-blue-50 text-gray-900'
                            : 'text-gray-900 hover:bg-gray-50'
                      }`,
                  }}
                />
              </div>

              {pageData.items.length > 0 ? (
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">
                    Selected Containers ({pageData.items.length})
                  </h4>
                  <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={pageData.items}>
                      <div className="space-y-3">
                        {pageData.items.map((itemId, index) => {
                          const container = containerData.containers.find(c => c._id === itemId);
                          return (
                            <SortableItem
                              key={itemId}
                              id={index}
                              item={container ? `${container.referenceName}` : 'Unknown Container'}
                              container={container}
                              handleRemove={() => handleRemoveItem(index)}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-sm">No containers selected</p>
                  <p className="text-xs text-gray-400 mt-1">Use the dropdown above to add containers to this page</p>
                </div>
              )}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => navigate('/store/appmanagement/page')}
              className="bg-gray-600 text-btn-text-color px-6 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
            {renderSubmitButtons()}
          </div>
        </form>
      {/* </div> */}
      <ToastContainer />
    </div>
  );
}

export default PageForm;
