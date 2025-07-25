import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import LoadingScreen from "../ui/loading/loading";
import { useNavigate } from 'react-router';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { DndContext } from '@dnd-kit/core';
import { languages } from '../../constant';
import Autosuggest from 'react-autosuggest';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const validateElementData = (data) => {
  const errors = {};

  // Required field validations
  if (!data.componentType || data.componentType.trim() === '') {
    errors.componentType = 'Component Type is required';
  } else if (!['swimlane', 'list', 'image', 'textParagraph', 'audio', 'video', 'card', 'banner'].includes(data.componentType)) {
    errors.componentType = 'Invalid component type';
  }

  if (!data.referenceName || data.referenceName.trim() === '') {
    errors.referenceName = 'Reference Name is required';
  } else if (data.referenceName.length < 2) {
    errors.referenceName = 'Reference Name must be at least 2 characters long';
  } else if (data.referenceName.length > 100) {
    errors.referenceName = 'Reference Name must not exceed 100 characters';
  }

  // Items validation
  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      if (item.itemType && !['Catalogue', 'Page'].includes(item.itemType)) {
        if (!errors.items) errors.items = {};
        if (!errors.items[index]) errors.items[index] = {};
        errors.items[index].itemType = 'Item type must be either Catalogue or Page';
      }
      if (item.itemType && (!item.itemId || item.itemId.trim() === '')) {
        if (!errors.items) errors.items = {};
        if (!errors.items[index]) errors.items[index] = {};
        errors.items[index].itemId = 'Item ID is required when item type is selected';
      }
    });
  }

  // Availability validation
  if (data.availability && data.availability.length > 0) {
    data.availability.forEach((avail, index) => {
      if (!avail.appId || avail.appId.trim() === '') {
        if (!errors.availability) errors.availability = {};
        errors.availability[index] = 'App ID is required for availability';
      }
    });
  }

  // Number Items validation
  if (data.numberItems) {
    ['web', 'android', 'iOS'].forEach(platform => {
      if (data.numberItems[platform] !== undefined && data.numberItems[platform] !== null) {
        const value = Number(data.numberItems[platform]);
        if (isNaN(value) || value < 0) {
          if (!errors.numberItems) errors.numberItems = {};
          errors.numberItems[platform] = `${platform} number items must be a non-negative number`;
        }
      }
    });
  }

  // Title validation
  if (data.title && data.title.length > 0) {
    data.title.forEach((titleItem, index) => {
      if (!titleItem.lanCode || titleItem.lanCode.trim() === '') {
        if (!errors.title) errors.title = {};
        if (!errors.title[index]) errors.title[index] = {};
        errors.title[index].lanCode = 'Language code is required';
      }
      if (!titleItem.name || titleItem.name.trim() === '') {
        if (!errors.title) errors.title = {};
        if (!errors.title[index]) errors.title[index] = {};
        errors.title[index].name = 'Title name is required';
      } else if (titleItem.name.length > 200) {
        if (!errors.title) errors.title = {};
        if (!errors.title[index]) errors.title[index] = {};
        errors.title[index].name = 'Title name must not exceed 200 characters';
      }
    });
  }

  // Info validation
  if (data.info && data.info.length > 0) {
    data.info.forEach((infoItem, index) => {
      if (!infoItem.lanCode || infoItem.lanCode.trim() === '') {
        if (!errors.info) errors.info = {};
        if (!errors.info[index]) errors.info[index] = {};
        errors.info[index].lanCode = 'Language code is required';
      }
      if (!infoItem.infoCode || infoItem.infoCode.trim() === '') {
        if (!errors.info) errors.info = {};
        if (!errors.info[index]) errors.info[index] = {};
        errors.info[index].infoCode = 'Info code is required';
      }

      if (!infoItem.infoName || infoItem.infoName.trim() === '') {
        if (!errors.info) errors.info = {};
        if (!errors.info[index]) errors.info[index] = {};
        errors.info[index].infoName = 'Info name is required';
      }
      if (!infoItem.infoValue || infoItem.infoValue.trim() === '') {
        if (!errors.info) errors.info = {};
        if (!errors.info[index]) errors.info[index] = {};
        errors.info[index].infoValue = 'Info value is required';
      }
    });
  }

  // Description validation
  if (data.description && data.description.length > 0) {
    data.description.forEach((descItem, index) => {
      if (!descItem.lanCode || descItem.lanCode.trim() === '') {
        if (!errors.description) errors.description = {};
        if (!errors.description[index]) errors.description[index] = {};
        errors.description[index].lanCode = 'Language code is required';
      }
      if (!descItem.paragraph || descItem.paragraph.trim() === '') {
        if (!errors.description) errors.description = {};
        if (!errors.description[index]) errors.description[index] = {};
        errors.description[index].paragraph = 'Description paragraph is required';
      } else if (descItem.paragraph.length > 1000) {
        if (!errors.description) errors.description = {};
        if (!errors.description[index]) errors.description[index] = {};
        errors.description[index].paragraph = 'Description must not exceed 1000 characters';
      }
    });
  }

  // Swiper Options validation (for swimlane component type)
  if (data.componentType === 'swimlane' && data.swiperOptions) {
    const swiper = data.swiperOptions;

    if (swiper.slidesPerView !== undefined && swiper.slidesPerView !== null && swiper.slidesPerView !== '') {
      const slidesPerView = Number(swiper.slidesPerView);
      if (isNaN(slidesPerView) || slidesPerView < 1) {
        if (!errors.swiperOptions) errors.swiperOptions = {};
        errors.swiperOptions.slidesPerView = 'Slides per view must be a positive number';
      }
    }

    if (swiper.swiperType && !['portrait', 'landscape', 'hero', 'circle', 'square'].includes(swiper.swiperType)) {
      if (!errors.swiperOptions) errors.swiperOptions = {};
      errors.swiperOptions.swiperType = 'Invalid swiper type';
    }

    if (swiper.spaceBetween !== undefined && swiper.spaceBetween !== null && swiper.spaceBetween !== '') {
      const spaceBetween = Number(swiper.spaceBetween);
      if (isNaN(spaceBetween) || spaceBetween < 0) {
        if (!errors.swiperOptions) errors.swiperOptions = {};
        errors.swiperOptions.spaceBetween = 'Space between must be a non-negative number';
      }
    }

    if (swiper.autoplay && swiper.autoplay.delay !== undefined && swiper.autoplay.delay !== null && swiper.autoplay.delay !== '') {
      const delay = Number(swiper.autoplay.delay);
      if (isNaN(delay) || delay < 0) {
        if (!errors.swiperOptions) errors.swiperOptions = {};
        if (!errors.swiperOptions.autoplay) errors.swiperOptions.autoplay = {};
        errors.swiperOptions.autoplay.delay = 'Autoplay delay must be a non-negative number';
      }
    }

    if (swiper.speed !== undefined && swiper.speed !== null && swiper.speed !== '') {
      const speed = Number(swiper.speed);
      if (isNaN(speed) || speed < 0) {
        if (!errors.swiperOptions) errors.swiperOptions = {};
        errors.swiperOptions.speed = 'Speed must be a non-negative number';
      }
    }
  }

  // Card Options validation (for card component type)
  if (data.componentType === 'card' && data.cardOptions) {
    const card = data.cardOptions;

    const validPositions = ['top', 'bottom', 'left', 'right', 'none'];
    const validActionPositions = ['top', 'bottom', 'inline', 'hidden', 'none'];

    if (card.imagePosition && !validPositions.includes(card.imagePosition)) {
      if (!errors.cardOptions) errors.cardOptions = {};
      errors.cardOptions.imagePosition = 'Invalid image position';
    }

    if (card.titlePosition && !validPositions.includes(card.titlePosition)) {
      if (!errors.cardOptions) errors.cardOptions = {};
      errors.cardOptions.titlePosition = 'Invalid title position';
    }

    if (card.descriptionPosition && !validPositions.includes(card.descriptionPosition)) {
      if (!errors.cardOptions) errors.cardOptions = {};
      errors.cardOptions.descriptionPosition = 'Invalid description position';
    }

    if (card.actionButtonPosition && !validActionPositions.includes(card.actionButtonPosition)) {
      if (!errors.cardOptions) errors.cardOptions = {};
      errors.cardOptions.actionButtonPosition = 'Invalid action button position';
    }

    if (card.actionButtonUrl && card.actionButtonUrl.trim() !== '') {
      try {
        new URL(card.actionButtonUrl);
      } catch {
        if (!errors.cardOptions) errors.cardOptions = {};
        errors.cardOptions.actionButtonUrl = 'Invalid URL format';
      }
    }
  }

  // Hover Effect validation
  if (data.hoverEffect && !['none', 'shadow', 'scale', 'border', 'zoomIn', 'zoomOut'].includes(data.hoverEffect)) {
    errors.hoverEffect = 'Invalid hover effect';
  }

  // URL validations for media fields
  if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.trim() !== '') {
    try {
      new URL(data.imageUrl);
    } catch {
      errors.imageUrl = 'Invalid image URL format';
    }
  }

  if (data.audioUrl && data.audioUrl.trim() !== '') {
    try {
      new URL(data.audioUrl);
    } catch {
      errors.audioUrl = 'Invalid audio URL format';
    }
  }

  if (data.videoUrl && data.videoUrl.trim() !== '') {
    try {
      new URL(data.videoUrl);
    } catch {
      errors.videoUrl = 'Invalid video URL format';
    }
  }

  return errors;
};

// Error Message Component
const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return <div className="text-red-500 text-sm mt-1">{error}</div>;
};

// Form Field Component with validation
const FormField = ({ label, required = false, error, children, className = "w-full sm:w-1/2 p-4", helpText }) => (
  <div className={className}>
    <label className="block w-full mb-2 text-text-color primary-text">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {helpText && <div className="text-sm text-gray-500 mb-2">{helpText}</div>}
    {children}
    <ErrorMessage error={error} />
  </div>
);

function ElementForm({ elementsDatas }) {
  const navigate = useNavigate();
  const [elementsData, setElementsData] = useState({
      componentType: "",
      referenceName: "",
      items: [],
      availability: [],
      numberItems: {web: 1, android: 1, iOS: 1},
      title: [],
      description: [],
      draft: false,
      publish: false,
      withText: true,
      withDescription: false,
      viewText: "",
      viewAll: null,
      swiperOptions: {
        slidesPerView: "",
        swiperType: "",
        spaceBetween: "",
        loop: true,
        autoplay: { delay: "", disableOnInteraction: true },
        breakpoints: {},
        effect: "",
        speed: ""
      },
      imageUrl: null,
      cardOptions: {
        imagePosition: "",
        titlePosition: "",
        descriptionPosition: "",
        actionButtonPosition: "",
        actionButtonText: "",
        actionButtonUrl: "",
        cardAspectRatio: ""
      },
      hoverEffect: "none"
  });
  const [loading, setLoading] = useState(true);
  const [changeComponentType, setChangeComponentType] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedImages, setUploadedImages] = useState(null);
  const [info, setInfo ] = useState([]);
  const [mediaId, setMediaId] = useState([]);
  const [value, setValue] = useState("");
  const [errors, setErrors] = useState({});
  const limit = 100; // Set your desired limit value
  const items = [
    { itemType: 'Catalogue' },
    { itemType: 'Page' },
  ];

  const componentTypeOptions = [
    { value: 'swimlane', label: 'Slider' },
    { value: 'list', label: 'List' },
    { value: 'image', label: 'Image' },
    { value: 'textParagraph', label: 'Text Paragraph' },
    // { value: 'audio', label: 'Audio' },
    // { value: 'video', label: 'Video' },
    { value: 'card', label: 'Card' },
    { value: 'banner', label: 'Banner' }
  ];

  const mutationHook = elementsDatas ? usePutData : usePostData;
  const api_url = elementsDatas ? `/elements/${elementsDatas?elementsDatas._id:elementsData._id}` : '/elements';
  const api_key = elementsDatas  ? 'updateElement' : 'addElement';
  const { mutate: saveLayout, isLoading, isError } = mutationHook(api_key, api_url);
  const { data: pagesData, isLoading: isPagesLoading } = useGetData('pages', `/pages?limit=${limit}`, {});
  const { data: cataloguesData, isLoading: isCataloguesLoading } = useGetData('catalogues', `/catalogues?limit=${limit}`, {});

    const { mutateAsync: generateSignedUrl } = usePostData('signedUrl', '/media/generateSignedUrl');
    const { mutateAsync: updateMediaStatus } = usePutData('updateMediaStatus', `/media/update/${mediaId}`, { enabled: !!mediaId });
  // Fetch app data
  const { data: appData, isLoading: isAppLoading } = useGetData("data", "/app", {});

  const removeUnwantedFields = (data, fields = ['_id', 'updated_at', 'created_at', '__v' ]) => {
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
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (elementsDatas) {
        // Remove unwanted fields
        const cleanedContainer = removeUnwantedFields(elementsDatas);

        // Transform items to only include itemType and itemId
        const transformedItems = elementsDatas.items?.map(item => ({
            itemType: item.itemType,
            itemId: item.itemId?._id,
        }));

        // Transform availability to only include appId as a string
        const transformedAvailability = elementsDatas.availability?.map(avail => ({
            appId: avail.appId?._id,
        }));

        // Set the transformed data
        setElementsData({
            componentType: cleanedContainer.componentType,
            referenceName: cleanedContainer.referenceName,
            items: transformedItems || [],
            availability: transformedAvailability || [],
            numberItems: cleanedContainer.numberItems,
            title: cleanedContainer.title,
            description: cleanedContainer.description,
            draft: cleanedContainer.draft,
            publish: cleanedContainer.publish,
            withText: cleanedContainer.withText,
            withDescription: cleanedContainer.withDescription,
            viewText: cleanedContainer.viewText,
            viewAll: cleanedContainer.viewAll,
            swiperOptions: cleanedContainer.swiperOptions,
            imageUrl: cleanedContainer.imageUrl,
            cardOptions: cleanedContainer.cardOptions,
            hoverEffect: cleanedContainer.hoverEffect,
        });

        // Set info in the separate info state
        setInfo(cleanedContainer.info || []);
        setUploadedImages(cleanedContainer.imageUrl);
    }
    setLoading(false);
}, [elementsDatas]);


  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form data
    const formData = { ...elementsData, imageUrl: uploadedImages, info: info };
    const validationErrors = validateElementData(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors before submitting.');
      return;
    }

    setErrors({});
    saveLayout({ ...elementsData, draft: true, publish: false, imageUrl: uploadedImages, info: info }, {
      onSuccess: (response) => {
        navigate('/store/appmanagement/element');
        toast.success('Layout saved successfully!');
      },
      onError: (error) => {
        toast.error('Failed to save layout.');
        console.error(error);
      }
    });
  };

  const cleanData = (data) => {
    // Deep clone to avoid mutating the original data
    const clonedData = JSON.parse(JSON.stringify(data));
  
    // Function to recursively remove specific fields
    const removeFields = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(removeFields);
      } else if (obj && typeof obj === "object") {
        const { __v, _id, createdAt, updatedAt, ...rest } = obj;
        Object.keys(rest).forEach((key) => {
          rest[key] = removeFields(rest[key]);
        });
        return rest;
      }
      return obj;
    };
  
    return removeFields(clonedData);
  };

  const handleDraftSubmit = () => {
    // Validate form data
    const formData = { ...elementsData, imageUrl: uploadedImages, info: info };
    const validationErrors = validateElementData(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors before saving as draft.');
      return;
    }

    setErrors({});
    const cleanedData = cleanData({ ...elementsData, draft: true, publish: false, imageUrl: uploadedImages, info: info  });


    saveLayout(cleanedData, {
      onSuccess: (response) => {
        // setElementsData(response.data);
        navigate('/store/appmanagement/element');
        toast.success('Layout saved as draft!');
      },
      onError: (error) => {
        toast.error('Failed to save draft.');
        console.error(error);
      }
    });
  };
  
  const handlePublishSubmit = () => {
    // Validate form data
    const formData = { ...elementsData, imageUrl: uploadedImages, info: info };
    const validationErrors = validateElementData(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors before publishing.');
      return;
    }

    setErrors({});
    const cleanedData = cleanData({ ...elementsData, draft: false, publish: true, imageUrl: uploadedImages, info: info  });
    console.log("cleanedData",cleanedData);

    saveLayout(cleanedData, {
      onSuccess: (response) => {
        // setElementsData(response.data);
        navigate('/store/appmanagement/element');
        toast.success('Layout published successfully!');
      },
      onError: (error) => {
        toast.error('Failed to publish layout.');
        console.error(error);
      }
    });
  };
  
  const renderSubmitButtons = () => {
    if (elementsData.draft && !elementsData.publish) {
      return (
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={handleDraftSubmit} className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded-md">
            Redraft
          </button>
          <button type="button" onClick={handlePublishSubmit} className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded-md">
            Publish
          </button>
        </div>
      );
    } else if (!elementsData.draft && elementsData.publish) {
      return (
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={handleDraftSubmit} className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded-md">
            Redraft
          </button>
          <button type="button" onClick={handlePublishSubmit} className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded-md">
            Republish
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex justify-end">
          <button type="submit" className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded-md">
            Save Draft
          </button>
        </div>
      );
    }
  };


  const addDescription = () => {
    setElementsData((prevState) => ({
      ...prevState,
      description: [...prevState.description, { lanCode: 'English', paragraph: '' }],
    }));
  };

  const removeDescription = (index) => {
    setElementsData((prevState) => ({
      ...prevState,
      description: prevState.description.filter((_, i) => i !== index),
    }));
  }

  const getSuggestions = (value) => {
    const inputValue = value?.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : languages.filter(lang =>
      lang.name.toLowerCase().slice(0, inputLength) === inputValue
    );
  };
  
  const handleSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => suggestion.code;

  const renderSuggestion = (suggestion) => (
    <div className="p-2 hover:bg-gray-100 cursor-pointer text-gray-900">
      {suggestion.name} ({suggestion.code})
    </div>
  );

  const addTitle = () => {
    const newTitle = {
      lanCode: '',
      name: ''
    };
    setElementsData((prevState) => ({
      ...prevState,
      title: [...prevState.title, newTitle]
    }));
  };

  const removeTitle = (index) => {
    setElementsData((prevState) => ({
      ...prevState,
      title: prevState.title.filter((_, i) => i !== index)
    }));
  };

  const handleAddItem = () => {
    setElementsData(prevState => ({
      ...prevState,
      items: [...prevState.items, { itemType: '', itemId: '' }],
    }));
  };

  const handleNestedChange = (field, index, subfield, value) => {
    const updatedItems = [...elementsData[field]];
    updatedItems[index][subfield] = value;
    setElementsData(prevState => ({
      ...prevState,
      [field]: updatedItems,
    }));
  };

  const getItemOptions = (itemType) => {
    if (itemType === 'Catalogue') {
      return Array.isArray(cataloguesData?.catalogues)
        ? cataloguesData.catalogues.map((cat) => ({
            value: cat._id,
            label: cat.name,
          }))
        : [];
    } else if (itemType === 'Page') {
      return Array.isArray(pagesData?.pages)
        ? pagesData.pages.map((page) => ({
            value: page._id,
            label: page.title?.[0]?.title || page.slug,
          }))
        : [];
    }
    return [];
  };
  
  const handleRemoveItem = (indexToRemove) => {
    setElementsData(prevState => ({
      ...prevState,
      items: prevState.items.filter((_, index) => index !== indexToRemove),
    }));
  };
  

  // Drag and drop handling
  const onDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setElementsData((prevState) => ({
        ...prevState,
        items: arrayMove(prevState.items, active.id, over.id),
      }));
    }
  };


  const handleInputChange = (field, value) => {
    // Clear errors for the field being changed
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Handle component type changes with proper option initialization
    if (field === 'componentType') {
      setElementsData((prevState) => {
        const newState = {
          ...prevState,
          [field]: value,
        };

        // Initialize or clear options based on component type
        if (value === 'swimlane') {
          // Initialize swiperOptions for swimlane, clear cardOptions
          newState.swiperOptions = {
            slidesPerView: "",
            swiperType: "",
            spaceBetween: "",
            loop: true,
            autoplay: { delay: "", disableOnInteraction: true },
            breakpoints: {},
            effect: "",
            speed: ""
          };
          newState.cardOptions = {};
        } else if (value === 'card') {
          // Initialize cardOptions for card, clear swiperOptions
          newState.cardOptions = {
            imagePosition: "",
            titlePosition: "",
            descriptionPosition: "",
            actionButtonPosition: "",
            actionButtonText: "",
            actionButtonUrl: "",
            cardAspectRatio: ""
          };
          newState.swiperOptions = {};
        } else {
          // Clear both options for other component types
          newState.swiperOptions = {};
          newState.cardOptions = {};
        }

        return newState;
      });
    } else {
      // Handle all other field changes normally
      setElementsData((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const handlePageSelection = (selectedOption) => {
    // Set viewAll to the selected page's ID
    handleInputChange('viewAll', selectedOption.value);
  };

   // Map pages data to dropdown options
   const pageOptions = Array.isArray(pagesData?.pages)
   ? pagesData.pages.map((page) => ({
       value: page._id,  // Pass the page ID as the value
       label: page.title?.[0]?.title || page.slug  // Display the title or slug
     }))
   : [];

    const { getRootProps, getInputProps } = useDropzone({
       onDrop: (acceptedFiles) => {
         const newImages = [...images, ...acceptedFiles];
         setImages(newImages);
         console.log("images", newImages);
       }
     });

   const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = () => {
    setUploadedImages(null);
    setElementsData((prev) => ({
      ...prev,
      imageUrl: null, // Remove the image URL from state
    }));
  };
  

  const handleUploadImages = async (index) => {
    try {
      const image = images[index];
      console.log(`Generating signed URL for ${image.name}`);

// Generate signed URL for the image upload
const signedUrlResponse = await generateSignedUrl({
  title: image.name,
  mediaType: "image",
  ext: image.name.split('.').pop(), // Extract the file extension
  active: true,
  uploadStatus: "progressing",
  uploadProgress: 0,
});


      if (!signedUrlResponse) {
        throw new Error('Signed URL data is undefined');
      }

      const signedUrl = signedUrlResponse.signedUrl;
      const mediaId = signedUrlResponse.media._id;

      console.log("Signed URL generated:", signedUrl);
      console.log("Media ID generated:", mediaId);

      setMediaId(mediaId);

      // Proceed with uploading the image to the signed URL
      await axios.put(signedUrl, image, {
        headers: {
          'Content-Type': image.type
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [image.name]: progress }));

          // Update media status when the upload is complete
          if (progress === 100) {
            updateMediaStatus({
              mediaType: "image",
              title: image.name,
              ext: image.name.split('.').pop(), // Extract the file extension
              active: true,
              uploadStatus: "completed",
              uploadProgress: 100,
            });
          }
        }
      });

      // Add the uploaded image's URL to the list
      
      console.log("media.nexalogics.in",`https://media.nexalogics.in/${mediaId}.${image.name.split('.').pop()}`);
      setUploadedImages(`https://media.nexalogics.in/${mediaId}.${image.name.split('.').pop()}`);

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('An error occurred while uploading the image. Please try again.');
    }
  };

  const handleInfoChange = (index, field, value) => {
    const updatedInfo = [...info];
    updatedInfo[index] = {
      ...updatedInfo[index],
      [field]: value
    };
    setInfo(updatedInfo);
  };

  // Add a new info item
  const addInfo = () => {
    setInfo([
      ...info,
      {
        lanCode: '',
        infoCode: '',
        infoName: '',
        infoValue: ''
      }
    ]);
  };

  // Remove an info item
  const removeInfo = (index) => {
    const updatedInfo = [...info];
    updatedInfo.splice(index, 1);
    setInfo(updatedInfo);
  };

  if (loading || isLoading) {
    return <LoadingScreen />;
  }

  console.log('cataloguesData:', cataloguesData);
console.log('pagesData:', pagesData);
console.log("elementsData.draft",elementsData.draft);
console.log("elementsData",elementsData);

console.log("uploadedImages",uploadedImages);

  return (
    <div className="mx-auto">
      <h2 className="text-2xl font-bold text-text-color mb-6">
        {elementsDatas ? 'Edit Element' : 'Create New Element'}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Please fix the following errors:
            </h3>
            <ul className="text-red-700 text-sm space-y-1">
              {errors.componentType && <li>• {errors.componentType}</li>}
              {errors.referenceName && <li>• {errors.referenceName}</li>}
              {errors.availability && <li>• Availability: {typeof errors.availability === 'string' ? errors.availability : 'Please check availability settings'}</li>}
              {errors.numberItems && Object.keys(errors.numberItems).length > 0 && (
                <li>• Number Items: {Object.values(errors.numberItems).filter(Boolean).join(', ')}</li>
              )}
              {errors.title && Object.keys(errors.title).length > 0 && (
                <li>• Titles: Please check title entries for missing language codes or names</li>
              )}
              {errors.description && Object.keys(errors.description).length > 0 && (
                <li>• Descriptions: Please check description entries for missing language codes or content</li>
              )}
              {errors.info && Object.keys(errors.info).length > 0 && (
                <li>• Info: Please check info entries for missing required fields</li>
              )}
              {errors.swiperOptions && Object.keys(errors.swiperOptions).length > 0 && (
                <li>• Swiper Options: {Object.values(errors.swiperOptions).filter(Boolean).join(', ')}</li>
              )}
              {errors.cardOptions && Object.keys(errors.cardOptions).length > 0 && (
                <li>• Card Options: {Object.values(errors.cardOptions).filter(Boolean).join(', ')}</li>
              )}
              {errors.hoverEffect && <li>• {errors.hoverEffect}</li>}
              {errors.imageUrl && <li>• {errors.imageUrl}</li>}
              {errors.audioUrl && <li>• {errors.audioUrl}</li>}
              {errors.videoUrl && <li>• {errors.videoUrl}</li>}
            </ul>
          </div>
        )}

        {/* Basic Information Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-text-color mb-4 border-b border-border pb-2">
            Basic Information
          </h3>
          <div className="flex flex-wrap -mx-2">
            <FormField
              label="Component Type"
              required={true}
              error={errors.componentType}
              helpText="Select the type of element you want to create"
            >
              <Select
                options={componentTypeOptions}
                value={componentTypeOptions.find(option => option.value === elementsData.componentType) || null}
                onChange={(selectedOption) => {
                  handleInputChange('componentType', selectedOption.value);
                  setChangeComponentType(true);
                }}
                placeholder="Select component type..."
                classNames={{
                  control: ({ isFocused }) =>
                    `bg-white border-2 ${
                      errors.componentType ? 'border-red-500' :
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
            </FormField>

            <FormField
              label="Reference Name"
              required={true}
              error={errors.referenceName}
              helpText="Enter a unique name to identify this element"
            >
              <input
                type="text"
                value={elementsData.referenceName}
                onChange={(e) => handleInputChange('referenceName', e.target.value)}
                placeholder="Enter reference name..."
                className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
              />
            </FormField>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-text-color mb-4 border-b border-border pb-2">
            Configuration
          </h3>
          <div className="flex flex-wrap -mx-2">
            {/* Availability */}
            <FormField
              label="Availability"
              error={errors.availability}
              helpText="Select which apps this element will be available in"
            >
              <Select
                isMulti
                options={
                  appData?.apps?.map((app) => ({
                    value: app._id,
                    label: app.title,
                  })) || []
                }
                onChange={(selectedOptions) => {
                  const selectedAppObjects = selectedOptions.map((option) => ({
                    appId: option.value,
                  }));
                  setElementsData((prevState) => ({
                    ...prevState,
                    availability: selectedAppObjects,
                  }));
                  // Clear availability errors
                  if (errors.availability) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.availability;
                      return newErrors;
                    });
                  }
                }}
                value={elementsData.availability.map((item) => ({
                  value: item.appId,
                  label: appData?.apps?.find((app) => app._id === item.appId)?.title || item.appId,
                }))}
                isLoading={isAppLoading}
                placeholder="Select apps..."
                classNames={{
                  control: ({ isFocused }) =>
                    `bg-white border-2 ${
                      errors.availability ? 'border-red-500' :
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
                  multiValue: () => `bg-blue-100 text-blue-800 rounded px-2 py-1 m-1`,
                  multiValueLabel: () => `text-blue-800`,
                  multiValueRemove: () => `text-blue-800 hover:bg-red-500 hover:text-white rounded-r`,
                }}
              />
            </FormField>

            {/* View Text */}
            <FormField
              label="View Text"
              helpText="Text to display for 'view more' or similar actions"
            >
              <input
                type="text"
                value={elementsData.viewText}
                onChange={(e) => handleInputChange('viewText', e.target.value)}
                placeholder="Enter view text..."
                className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
              />
            </FormField>
          </div>
        </div>


        {/* Additional Settings Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-text-color mb-4 border-b border-border pb-2">
            Additional Settings
          </h3>
          <div className="flex flex-wrap -mx-2">
            {/* View All */}
            <FormField
              label="View All"
              helpText="Select a page to redirect to when 'view all' is clicked"
            >
              <Select
                options={pageOptions}
                value={pageOptions.find(option => option.value === elementsData.viewAll)}
                onChange={handlePageSelection}
                placeholder="Select a page..."
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
            </FormField>

            {/* Hover Effect */}
            <FormField
              label="Hover Effect"
              helpText="Select the hover effect for this element"
            >
              <Select
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'shadow', label: 'Shadow' },
                  { value: 'scale', label: 'Scale' },
                  { value: 'border', label: 'Border' },
                  { value: 'zoomIn', label: 'Zoom In' },
                  { value: 'zoomOut', label: 'Zoom Out' }
                ]}
                value={{ value: elementsData.hoverEffect, label: elementsData.hoverEffect }}
                onChange={(selectedOption) => handleInputChange('hoverEffect', selectedOption.value )}
                placeholder="Select hover effect..."
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
            </FormField>
          </div>
        </div>

        {/* Audio URL */}
        {/* <div className="flex flex-wrap mb-4">
          <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color primary-text">Audio URL</label>
            <input
              type="text"
              className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
              placeholder="Audio URL"
              value={elementsData.audioUrl}
              onChange={(e) => handleInputChange('audioUrl', e.target.value)}
            />
          </div> */}
        {/* </div> */}

        {/* Video URL */}
        {/* <div className="flex flex-wrap mb-4"> */}
          {/* <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color primary-text">Video URL</label>
            <input
              type="text"
              className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
              placeholder="Video URL"
              value={elementsData.videoUrl}
              onChange={(e) => handleInputChange('videoUrl', e.target.value)}
            />
          </div>
        </div> */}

<div className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <label className="block w-full mb-2 text-text-color primary-text">Information</label>
        <button 
          type="button" 
          className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" 
          onClick={addInfo}
        >
          Add
        </button>
      </div>
      <div className="notes-container p-4 bg-secondary-card rounded-lg">
        {info?.length === 0 && <p className='text-text-color'>No information added</p>}
        {info?.map((item, index) => (
          <div key={index} className="flex gap-4 mb-4">
            <input
              type="text"
              value={item.lanCode}
              onChange={(e) => handleInfoChange(index, 'lanCode', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
              placeholder="Language Code"
            />
            <input
              type="text"
              value={item.infoCode}
              onChange={(e) => handleInfoChange(index, 'infoCode', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
              placeholder="Info Code"
            />
            <input
              type="text"
              value={item.infoName}
              onChange={(e) => handleInfoChange(index, 'infoName', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
              placeholder="Info Name"
            />
            <input
              type="text"
              value={item.infoValue}
              onChange={(e) => handleInfoChange(index, 'infoValue', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
              placeholder="Info Value"
            />
            <button
              type="button"
              className="bg-secondary-card text-text-color px-4 py-2 rounded"
              onClick={() => removeInfo(index)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
        
        {/* Image URL */}

        {(elementsData.componentType === "image" || elementsData.componentType === "card" || elementsData.componentType === "banner") && (
  <div className="w-full p-4">
    <label className="block w-full mb-2 text-text-color primary-text">Image</label>
    <div {...getRootProps({ className: 'dropzone' })} className="w-full p-4 bg-secondary-card text-text-color border-2 border-border rounded mb-4">
      <input {...getInputProps()} />
      <p className='text-text-color'>Drag & drop images here, or click to select files</p>

      <div className="w-full p-4">
        {/* Show the existing image from elementsData if available */}
        {elementsData.imageUrl && (
          <div className="flex items-center justify-between mb-2">
            <img 
              src={elementsData.imageUrl} 
              alt="Uploaded Logo" 
              className="w-16 h-16 object-cover mr-4"
            />
            <span className="text-sm">{elementsData.imageUrl.split('/').pop()}</span>
            <button
              type="button"
              className="ml-2 text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveExistingImage();
              }}
            >
              X
            </button>
          </div>
        )}

        {/* Show newly uploaded images */}
        {images?.map((file, index) => (
          <div key={index} className="flex items-center justify-between mb-2">
            <img 
              src={URL.createObjectURL(file)} 
              alt={file.name} 
              className="w-16 h-16 object-cover mr-4" 
            />
            <span>{file.name}</span>
            <progress value={uploadProgress[file.name] || 0} max="100" className="flex-1 mx-2">
              {uploadProgress[file.name] || 0}%
            </progress>
            <button
              type="button"
              className="ml-2 text-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleUploadImages(index);
              }}
            >
              Upload
            </button>
            <button
              type="button"
              className="ml-2 text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage(index);
              }}
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

        {/* Swiper Options Settings */}
        {(elementsData.componentType === "swimlane") && (
          <div className="mb-4">
            <label className="block w-full mb-2 text-text-color primary-text">
              Swiper Options
              <span className="text-sm text-gray-500 ml-2">(Configure slider behavior)</span>
            </label>
            <div className="notes-container p-4 bg-secondary-card rounded-lg">
              {/* Slides Per View */}
              <div className="flex flex-wrap mb-4">
                <div className="w-full sm:w-1/2 p-4">
                  <label className="block w-full mb-2 text-text-color primary-text">
                    Slides Per View
                    <span className="text-sm text-gray-500 ml-1">(Number of slides visible at once)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className={`block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color ${
                      errors.swiperOptions?.slidesPerView ? 'border-red-500' : ''
                    }`}
                    placeholder="e.g., 3"
                    value={elementsData.swiperOptions.slidesPerView}
                    onChange={(e) => {
                      handleInputChange('swiperOptions', { ...elementsData.swiperOptions, slidesPerView: e.target.value });
                      // Clear specific error
                      if (errors.swiperOptions?.slidesPerView) {
                        setErrors(prev => ({
                          ...prev,
                          swiperOptions: {
                            ...prev.swiperOptions,
                            slidesPerView: undefined
                          }
                        }));
                      }
                    }}
                  />
                  {errors.swiperOptions?.slidesPerView && (
                    <div className="text-red-500 text-xs mt-1">{errors.swiperOptions.slidesPerView}</div>
                  )}
                </div>

                {/* Swiper Type Dropdown */}
                <div className="w-full sm:w-1/2 p-4">
                  <label className="block w-full mb-2 text-text-color primary-text">
                    Swiper Type
                    <span className="text-sm text-gray-500 ml-1">(Slide layout style)</span>
                  </label>
                  <Select
                    options={[
                      { value: 'portrait', label: 'Portrait' },
                      { value: 'landscape', label: 'Landscape' },
                      { value: 'hero', label: 'Hero' },
                      { value: 'circle', label: 'Circle' },
                      { value: 'square', label: 'Square' }
                    ]}
                    value={elementsData.swiperOptions.swiperType ?
                      { value: elementsData.swiperOptions.swiperType, label: elementsData.swiperOptions.swiperType } : null}
                    onChange={(selectedOption) => {
                      handleInputChange('swiperOptions', { ...elementsData.swiperOptions, swiperType: selectedOption.value });
                      // Clear specific error
                      if (errors.swiperOptions?.swiperType) {
                        setErrors(prev => ({
                          ...prev,
                          swiperOptions: {
                            ...prev.swiperOptions,
                            swiperType: undefined
                          }
                        }));
                      }
                    }}
                    placeholder="Select swiper type..."
                    classNames={{
                      control: ({ isFocused }) =>
                        `bg-primary border ${
                          errors.swiperOptions?.swiperType ? 'border-red-500' :
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
                  {errors.swiperOptions?.swiperType && (
                    <div className="text-red-500 text-xs mt-1">{errors.swiperOptions.swiperType}</div>
                  )}
                </div>
              </div>

              {/* Space Between */}
              <div className="flex flex-wrap mb-4">
                <div className="w-full sm:w-1/2 p-4">
                  <label className="block w-full mb-2 text-text-color primary-text">
                    Space Between
                    <span className="text-sm text-gray-500 ml-1">(Gap between slides in pixels)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={`block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color ${
                      errors.swiperOptions?.spaceBetween ? 'border-red-500' : ''
                    }`}
                    placeholder="e.g., 10"
                    value={elementsData.swiperOptions.spaceBetween}
                    onChange={(e) => {
                      handleInputChange('swiperOptions', { ...elementsData.swiperOptions, spaceBetween: e.target.value });
                      // Clear specific error
                      if (errors.swiperOptions?.spaceBetween) {
                        setErrors(prev => ({
                          ...prev,
                          swiperOptions: {
                            ...prev.swiperOptions,
                            spaceBetween: undefined
                          }
                        }));
                      }
                    }}
                  />
                  {errors.swiperOptions?.spaceBetween && (
                    <div className="text-red-500 text-xs mt-1">{errors.swiperOptions.spaceBetween}</div>
                  )}
                </div>

                {/* Autoplay Delay */}
                <div className="w-full sm:w-1/2 p-4">
                  <label className="block w-full mb-2 text-text-color primary-text">
                    Autoplay Delay
                    <span className="text-sm text-gray-500 ml-1">(Delay between slides in ms)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={`block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color ${
                      errors.swiperOptions?.autoplay?.delay ? 'border-red-500' : ''
                    }`}
                    placeholder="e.g., 3000"
                    value={elementsData.swiperOptions.autoplay?.delay}
                    onChange={(e) => {
                      handleInputChange('swiperOptions', {
                        ...elementsData.swiperOptions,
                        autoplay: { ...elementsData.swiperOptions.autoplay, delay: e.target.value }
                      });
                      // Clear specific error
                      if (errors.swiperOptions?.autoplay?.delay) {
                        setErrors(prev => ({
                          ...prev,
                          swiperOptions: {
                            ...prev.swiperOptions,
                            autoplay: {
                              ...prev.swiperOptions?.autoplay,
                              delay: undefined
                            }
                          }
                        }));
                      }
                    }}
                  />
                  {errors.swiperOptions?.autoplay?.delay && (
                    <div className="text-red-500 text-xs mt-1">{errors.swiperOptions.autoplay.delay}</div>
                  )}
                </div>
              </div>

              {/* Speed */}
              <div className="flex flex-wrap mb-4">
                <div className="w-full sm:w-1/2 p-4">
                  <label className="block w-full mb-2 text-text-color primary-text">
                    Speed
                    <span className="text-sm text-gray-500 ml-1">(Transition speed in ms)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={`block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color ${
                      errors.swiperOptions?.speed ? 'border-red-500' : ''
                    }`}
                    placeholder="e.g., 300"
                    value={elementsData.swiperOptions.speed}
                    onChange={(e) => {
                      handleInputChange('swiperOptions', { ...elementsData.swiperOptions, speed: e.target.value });
                      // Clear specific error
                      if (errors.swiperOptions?.speed) {
                        setErrors(prev => ({
                          ...prev,
                          swiperOptions: {
                            ...prev.swiperOptions,
                            speed: undefined
                          }
                        }));
                      }
                    }}
                  />
                  {errors.swiperOptions?.speed && (
                    <div className="text-red-500 text-xs mt-1">{errors.swiperOptions.speed}</div>
                  )}
                </div>

                {/* Effect */}
                <div className="w-full sm:w-1/2 p-4">
                  <label className="block w-full mb-2 text-text-color primary-text">
                    Effect
                    <span className="text-sm text-gray-500 ml-1">(Transition effect)</span>
                  </label>
                  <input
                    type="text"
                    className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                    placeholder="e.g., slide, fade, cube"
                    value={elementsData.swiperOptions.effect}
                    onChange={(e) => handleInputChange('swiperOptions', { ...elementsData.swiperOptions, effect: e.target.value })}
                  />
                </div>
              </div>

              {/* Toggle Options */}
              <div className="flex flex-wrap mb-4">
                {/* Loop Toggle */}
                <div className="w-full sm:w-1/2 p-4">
                  <label className="relative inline-flex items-center cursor-pointer primary-text">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={elementsData.swiperOptions.loop}
                      onChange={() => handleInputChange('swiperOptions', { ...elementsData.swiperOptions, loop: !elementsData.swiperOptions.loop })}
                    />
                    <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    <span className="ms-3 text-md font-medium text-text-color">
                      Loop
                      <span className="text-sm text-gray-500 ml-1">(Continuous loop)</span>
                    </span>
                  </label>
                </div>

                {/* Disable on Interaction */}
                <div className="w-full sm:w-1/2 p-4">
                  <label className="relative inline-flex items-center cursor-pointer primary-text">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={elementsData.swiperOptions.autoplay?.disableOnInteraction}
                      onChange={() => handleInputChange('swiperOptions', {
                        ...elementsData.swiperOptions,
                        autoplay: {
                          ...elementsData.swiperOptions.autoplay,
                          disableOnInteraction: !elementsData.swiperOptions.autoplay?.disableOnInteraction
                        }
                      })}
                    />
                    <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    <span className="ms-3 text-md font-medium text-text-color">
                      Disable on Interaction
                      <span className="text-sm text-gray-500 ml-1">(Stop autoplay on user interaction)</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}


    {/* Card Options Settings */}
{(elementsData.componentType === "card") && (
  <div className="mb-4">
    <label className="block w-full mb-2 text-text-color primary-text">Card Options</label>
    <div className="notes-container p-4 bg-secondary-card rounded-lg">

      {/* Image Position Dropdown */}
      <div className="flex flex-wrap mb-4">
        <div className="w-full sm:w-1/2 p-4">
        <label className="block w-full mb-2 text-text-color primary-text">Image Position</label>
          <Select
            options={[{ value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }, { value: 'none', label: 'None' }]}
            value={{ value: elementsData.cardOptions.imagePosition, label: elementsData.cardOptions.imagePosition }}
            onChange={(selectedOption) => handleInputChange('cardOptions', { ...elementsData.cardOptions, imagePosition: selectedOption.value })}
            placeholder="Image Position"
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
        </div>

        {/* Title Position Dropdown */}
        <div className="w-full sm:w-1/2 p-4">
        <label className="block w-full mb-2 text-text-color primary-text">Title Position</label>
          <Select
            options={[{ value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }, { value: 'none', label: 'None' }]}
            value={{ value: elementsData.cardOptions.titlePosition, label: elementsData.cardOptions.titlePosition }}
            onChange={(selectedOption) => handleInputChange('cardOptions', { ...elementsData.cardOptions, titlePosition: selectedOption.value })}
            placeholder="Title Position"
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
        </div>
      </div>

      {/* Description Position Dropdown */}
      <div className="flex flex-wrap mb-4">
        <div className="w-full sm:w-1/2 p-4">
        <label className="block w-full mb-2 text-text-color primary-text">Description Position</label>
          <Select
            options={[{ value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }, { value: 'none', label: 'None' }]}
            value={{ value: elementsData.cardOptions.descriptionPosition, label: elementsData.cardOptions.descriptionPosition }}
            onChange={(selectedOption) => handleInputChange('cardOptions', { ...elementsData.cardOptions, descriptionPosition: selectedOption.value })}
            placeholder="Description Position"
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
        </div>

        {/* Action Button Position Dropdown */}
        <div className="w-full sm:w-1/2 p-4">
        <label className="block w-full mb-2 text-text-color primary-text">Action Button Position</label>
          <Select
            options={[{ value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }, { value: 'inline', label: 'Inline' }, { value: 'hidden', label: 'Hidden' }]}
            value={{ value: elementsData.cardOptions.actionButtonPosition, label: elementsData.cardOptions.actionButtonPosition }}
            onChange={(selectedOption) => handleInputChange('cardOptions', { ...elementsData.cardOptions, actionButtonPosition: selectedOption.value })}
            placeholder="Action Button Position"
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
        </div>
      </div>

      {/* Action Button Text */}
      <div className="flex flex-wrap mb-4">
        <div className="w-full sm:w-1/2 p-4">
        <label className="block w-full mb-2 text-text-color primary-text">Action Button Text</label>
          <input
            type="text"
            className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
            placeholder="Action Button Text"
            value={elementsData.cardOptions.actionButtonText}
            onChange={(e) => handleInputChange('cardOptions', { ...elementsData.cardOptions, actionButtonText: e.target.value })}
          />
        </div>

        {/* Action Button URL */}
        <div className="w-full sm:w-1/2 p-4">
        <label className="block w-full mb-2 text-text-color primary-text">Action Button URL</label>
          <input
            type="text"
            className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
            placeholder="Action Button URL"
            value={elementsData.cardOptions.actionButtonUrl}
            onChange={(e) => handleInputChange('cardOptions', { ...elementsData.cardOptions, actionButtonUrl: e.target.value })}
          />
        </div>
      </div>

      {/* Card Aspect Ratio */}
      <div className="flex flex-wrap mb-4">
        <div className="w-full sm:w-1/2 p-4">
        <label className="block w-full mb-2 text-text-color primary-text">Card Aspect Ratio</label>
          <input
            type="text"
            className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
            placeholder="Card Aspect Ratio"
            value={elementsData.cardOptions.cardAspectRatio}
            onChange={(e) => handleInputChange('cardOptions', { ...elementsData.cardOptions, cardAspectRatio: e.target.value })}
          />
        </div>
      </div>

    </div>
  </div>
)}



        {/* Number Items Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-text-color mb-4 border-b border-border pb-2">
            Number of Items
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Specify how many items to display on each platform
          </p>
          {errors.numberItems && (
            <div className="text-red-500 text-sm mb-4">
              {Object.values(errors.numberItems).join(', ')}
            </div>
          )}
          <div className="flex flex-wrap -mx-2">
            <FormField label="Web Items" error={errors.numberItems?.web} className="w-full sm:w-1/3 p-4">
              <input
                type="number"
                min="0"
                value={elementsData.numberItems.web}
                onChange={(e) => {
                  handleInputChange('numberItems', { ...elementsData.numberItems, web: e.target.value });
                  // Clear specific platform error
                  if (errors.numberItems?.web) {
                    setErrors(prev => ({
                      ...prev,
                      numberItems: {
                        ...prev.numberItems,
                        web: undefined
                      }
                    }));
                  }
                }}
                className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                placeholder="Number of items for web"
              />
            </FormField>

            <FormField label="Android Items" error={errors.numberItems?.android} className="w-full sm:w-1/3 p-4">
              <input
                type="number"
                min="0"
                value={elementsData.numberItems.android}
                onChange={(e) => {
                  handleInputChange('numberItems', { ...elementsData.numberItems, android: e.target.value });
                  // Clear specific platform error
                  if (errors.numberItems?.android) {
                    setErrors(prev => ({
                      ...prev,
                      numberItems: {
                        ...prev.numberItems,
                        android: undefined
                      }
                    }));
                  }
                }}
                className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                placeholder="Number of items for Android"
              />
            </FormField>

            <FormField label="iOS Items" error={errors.numberItems?.iOS} className="w-full sm:w-1/3 p-4">
              <input
                type="number"
                min="0"
                value={elementsData.numberItems.iOS}
                onChange={(e) => {
                  handleInputChange('numberItems', { ...elementsData.numberItems, iOS: e.target.value });
                  // Clear specific platform error
                  if (errors.numberItems?.iOS) {
                    setErrors(prev => ({
                      ...prev,
                      numberItems: {
                        ...prev.numberItems,
                        iOS: undefined
                      }
                    }));
                  }
                }}
                className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                placeholder="Number of items for iOS"
              />
            </FormField>
          </div>
        </div>

        {/* Titles */}
        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-color border-b border-border pb-2">Titles</h3>
            <button
              type="button"
              className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded hover:bg-primary-button-hover transition-colors"
              onClick={addTitle}
            >
              Add Title
            </button>
          </div>
          <div className="space-y-3">
            {elementsData.title.length === 0 && (
              <p className='text-gray-400 text-sm'>No titles added</p>
            )}
            {elementsData.title?.map((title, index) => (
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
                      value: title.lanCode,
                      onChange: (e, { newValue }) => {
                        handleNestedChange('title', index, 'lanCode', newValue);
                        // Clear specific title error
                        if (errors.title?.[index]?.lanCode) {
                          setErrors(prev => ({
                            ...prev,
                            title: {
                              ...prev.title,
                              [index]: {
                                ...prev.title[index],
                                lanCode: undefined
                              }
                            }
                          }));
                        }
                      },
                      className: 'block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none'
                    }}
                    theme={{
                      container: 'relative',
                      suggestionsContainer: 'absolute w-full bg-secondary-card border rounded-md z-10 mt-1',
                      suggestion: 'p-2 cursor-pointer hover:bg-gray-700 text-gray-900',
                      suggestionHighlighted: 'bg-primary-button-color text-btn-text-color'
                    }}
                  />
                  {errors.title?.[index]?.lanCode && (
                    <div className="text-red-500 text-sm mt-1">{errors.title[index].lanCode}</div>
                  )}
                </div>
                <div className="flex-2">
                  <input
                    type="text"
                    value={title.name}
                    onChange={(e) => {
                      handleNestedChange('title', index, 'name', e.target.value);
                      // Clear specific title error
                      if (errors.title?.[index]?.name) {
                        setErrors(prev => ({
                          ...prev,
                          title: {
                            ...prev.title,
                            [index]: {
                              ...prev.title[index],
                              name: undefined
                            }
                          }
                        }));
                        }
                      }}
                      className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                      placeholder="Title Name"
                    />
                    {errors.title?.[index]?.name && (
                      <div className="text-red-500 text-sm mt-1">{errors.title[index].name}</div>
                    )}
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


        {/* Description */}
        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-color border-b border-border pb-2">Description</h3>
            <button
              type="button"
              className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded hover:bg-primary-button-hover transition-colors"
              onClick={addDescription}
            >
              Add Description
            </button>
          </div>
          <div className="space-y-3">
            {elementsData.description.length === 0 && (
              <p className='text-gray-400 text-sm'>No descriptions added</p>
            )}
            {elementsData.description?.map((desc, index) => (
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
                      value: desc.lanCode,
                      onChange: (e, { newValue }) =>
                        handleNestedChange('description', index, 'lanCode', newValue),
                      className: 'block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none'
                    }}
                    theme={{
                      container: 'relative',
                      suggestionsContainer: 'absolute w-full bg-secondary-card border rounded-md z-10 mt-1',
                      suggestion: 'p-2 cursor-pointer hover:bg-gray-700 text-gray-900',
                      suggestionHighlighted: 'bg-primary-button-color text-btn-text-color'
                    }}
                  />
                </div>
                <div className="flex-2">
                  <textarea
                    value={desc.paragraph}
                    onChange={(e) => handleNestedChange('description', index, 'paragraph', e.target.value)}
                    className="block w-full px-3 py-2 text-text-color secondary-card border rounded focus:border-primary-button-color focus:outline-none"
                    placeholder="Description"
                    rows="3"
                  />
                </div>
                <button
                  type="button"
                  className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                  onClick={() => removeDescription(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-color border-b border-border pb-2">Items</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded hover:bg-primary-button-hover transition-colors"
            >
              Add Item
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Select items to include in this element. You can drag and drop to reorder them.
          </p>

          {elementsData.items.length > 0 ? (
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">
                Selected Items ({elementsData.items.length})
              </h4>
              <div className="space-y-3 mb-6">
                {elementsData.items.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex gap-3 items-center">
                      <div className="flex-1">
                        <Select
                          options={[
                            { value: 'Catalogue', label: 'Catalogue' },
                            { value: 'Page', label: 'Page' },
                          ].filter((option) => {
                            // Filter out 'Catalogue' if it's already added
                            const isCatalogueAdded = elementsData?.items.some((existingItem) => existingItem.itemType === 'Catalogue');
                            return !(isCatalogueAdded && option.value === 'Catalogue');
                          })}
                          value={{ value: item.itemType, label: item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1) }}
                          onChange={(selectedOption) => handleNestedChange('items', index, 'itemType', selectedOption.value)}
                          placeholder="Select item type..."
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
                      <div className="flex-1">
                        <Select
                          options={getItemOptions(item.itemType)}
                          value={getItemOptions(item.itemType)?.find(option => option.value === item.itemId)}
                          onChange={(selectedOption) => handleNestedChange('items', index, 'itemId', selectedOption.value)}
                          placeholder="Select item..."
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
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="ml-3 px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DnD kit implementation for reordering */}
              {elementsData.items.length > 1 && (
                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Drag to Reorder</h4>
                  <DndContext onDragEnd={onDragEnd}>
                    <SortableContext items={elementsData.items.map((_, index) => index)}>
                      <div className="space-y-2">
                        {elementsData?.items?.map((item, index) => (
                          <SortableItemRow key={index} index={index} item={item} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm">No items selected</p>
              <p className="text-xs text-gray-400 mt-1">Use the button above to add items to this element</p>
            </div>
          )}
        </div>

        {/* Display Options Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-text-color mb-4 border-b border-border pb-2">
            Display Options
          </h3>
          <div className="flex flex-wrap -mx-2">
            {/* With Text */}
            <FormField label="With Text" className="w-full sm:w-1/2 p-4">
              <label className="relative inline-flex items-center cursor-pointer primary-text">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={elementsData.withText}
                  onChange={() => handleInputChange('withText', !elementsData.withText )}
                />
                <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                <span className="ms-3 text-md font-medium text-text-color">With Text</span>
              </label>
            </FormField>
            {/* With Description */}
            <FormField label="With Description" className="w-full sm:w-1/2 p-4">
              <label className="relative inline-flex items-center cursor-pointer primary-text">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={elementsData.withDescription}
                  onChange={() => handleInputChange('withDescription',  !elementsData.withDescription )}
                />
                <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                <span className="ms-3 text-md font-medium text-text-color">With Description</span>
              </label>
            </FormField>
          </div>
        </div>

        {/* Submit Button */}
        {renderSubmitButtons()}
      </form>
      <ToastContainer />
    </div>
  );

  // SortableItemRow component moved inside ElementForm to access data
  function SortableItemRow({ index, item }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: index });

    const style = {
      transform: `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)`,
      transition,
    };

    // Helper function to get item name from ID
    const getItemName = (itemType, itemId) => {
      if (!itemId) return 'Not selected';

      if (itemType === 'Catalogue') {
        const catalogue = cataloguesData?.catalogues?.find(cat => cat._id === itemId);
        return catalogue?.name || itemId;
      } else if (itemType === 'Page') {
        const page = pagesData?.pages?.find(page => page._id === itemId);
        return page?.title?.[0]?.title || page?.slug || itemId;
      }
      return itemId;
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
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
              <div className="font-medium text-gray-900">
                {item.itemType}: {getItemName(item.itemType, item.itemId)}
              </div>
              <div className="text-sm text-gray-500">Drag to reorder</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ElementForm;
