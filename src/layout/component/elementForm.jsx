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
            info: cleanedContainer.info,
        });
        setUploadedImages(cleanedContainer.imageUrl);
    }
    setLoading(false);
}, [elementsDatas]);


  const handleSubmit = (e) => {
    e.preventDefault();
    saveLayout({ ...elementsData, draft: true, publish: false, imageUrl: uploadedImages, info: info }, {
      onSuccess: (response) => {
        // Update the state with response to reflect draft and publish status
        // console.log("response",response.data);
        // setElementsData(response.data);
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

  const getSuggestionValue = (suggestion) => suggestion.name;

const renderSuggestion = (suggestion) => (
  <div>
    {suggestion.name}
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
    if (active.id !== over.id) {
      setElementsData((prevState) => ({
        ...prevState,
        items: arrayMove(prevState.items, active.id, over.id),
      }));
    }
  };


  const handleInputChange = (field, value) => {
    // Check if the component type is changed to something other than "swimlane"
    if (field === 'componentType' && value !== 'swimlane') {
      setElementsData((prevState) => ({ 
        ...prevState, 
        [field]: value, 
        swiperOptions: {} // Set swiperOptions to null if not swimlane
      }));
    } else if (field === 'componentType' && value !== 'card') {
      setElementsData((prevState) => ({ 
        ...prevState, 
        [field]: value, 
        cardOptions: {} // Set cardOptions to null if not card
      }));
     } else {
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
         setImages([...images, ...acceptedFiles]);
         console.log("images",images);
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
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4">
      {/* Component Type as a Dropdown */}
      <div className="mb-4">
        <label className="block w-full mb-2 text-text-color primary-text">Component Type</label>
        <Select
          options={componentTypeOptions}
          value={componentTypeOptions.find(option => option.value === elementsData.componentType) || null}
          onChange={(selectedOption) => {
            handleInputChange('componentType', selectedOption.value);
            setChangeComponentType(true);
          }}
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
        {/* Reference Name */}
        <div className="w-full sm:w-1/2 p-4">
        <div className="mb-4">
          <label className="block w-full mb-2 text-text-color primary-text">Reference Name</label>
          <input
            type="text"
            value={elementsData.referenceName}
            onChange={(e) => handleInputChange('referenceName', e.target.value)}
            className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
          />
          </div>
        </div>
        </div>

  <div className="flex flex-wrap">
  {/* Availability */}
  
  <div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
      <label className="block w-full mb-2 text-text-color primary-text">Availability</label>
      {/* {elementsData?.availability?.map((avail, index) => ( */}
        {/* <div key={index} className="mb-2"> */}
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
    }}
    value={elementsData.availability.map((item) => ({
      value: item.appId,
      label: appData?.apps?.find((app) => app._id === item.appId)?.title || item.appId,
    }))}
    isLoading={isAppLoading}
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


        {/* </div> */}
      {/* // ))} */}
    </div>
  </div>
  {/* View Text */}
  <div className="w-full sm:w-1/2 p-4">
        <div className="mb-4">
          <label className="block w-full mb-2 text-text-color primary-text">View Text</label>
          <input
            type="text"
            value={elementsData.viewText}
            onChange={(e) => handleInputChange('viewText', e.target.value)}
            className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
          />
          </div>
        </div>
</div>


<div className="flex flex-wrap">
{/* View All */}
<div className="w-full sm:w-1/2 p-4">
          <div className="mb-4">
            <label className="block w-full mb-2 text-text-color primary-text">View All</label>
            <Select
              options={pageOptions}  // Dropdown options populated with page names
              value={pageOptions.find(option => option.value === elementsData.viewAll)}  // Set the current selected value
              onChange={handlePageSelection}  // Handle selection change
              className="block w-full"
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
{/* </div> */}

 {/* Hover Effect */}
 {/* <div className="flex flex-wrap mb-4"> */}
 <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color primary-text">Hover Effect</label>
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
          placeholder="Hover Effect"
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
{(elementsData.componentType === "swimlane" )&& <div className="mb-4">
      <label className="block w-full mb-2 text-text-color primary-text">Swiper Options</label>
      <div className="notes-container p-4 bg-secondary-card rounded-lg">

        {/* Slides Per View */}
        <div className="flex flex-wrap mb-4">
          <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color primary-text">Slides Per View</label>
            <input
              type="number"
              className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
              placeholder="Slides Per View"
              value={elementsData.swiperOptions.slidesPerView}
              onChange={(e) => handleInputChange('swiperOptions', { ...elementsData.swiperOptions, slidesPerView: e.target.value })}
            />
          </div>

          {/* Swiper Type Dropdown */}
          <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color primary-text">Swiper Type</label>
          <Select
  options={[
    { value: 'portrait', label: 'Portrait' },
    { value: 'landscape', label: 'Landscape' },
    { value: 'hero', label: 'Hero' },
    { value: 'circle', label: 'Circle' },
    { value: 'square', label: 'Square' }
  ]}
  value={{ value: elementsData.swiperOptions.swiperType, label: elementsData.swiperOptions.swiperType }}
  onChange={(selectedOption) => handleInputChange('swiperOptions', { ...elementsData.swiperOptions, swiperType: selectedOption.value })}
  placeholder="Swiper Type"
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

        {/* Space Between */}
        <div className="flex flex-wrap mb-4">
          <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color primary-text">Space Between</label>
            <input
              type="number"
              className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
              placeholder="Space Between"
              value={elementsData.swiperOptions.spaceBetween}
              onChange={(e) => handleInputChange('swiperOptions', { ...elementsData.swiperOptions, spaceBetween: e.target.value })}
            />
          </div>

          {/* Autoplay Delay */}
          <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color primary-text">Autoplay Delay</label>
            <input
              type="number"
              className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
              placeholder="Autoplay Delay"
              value={elementsData.swiperOptions.autoplay?.delay}
              onChange={(e) => handleInputChange('swiperOptions', { ...elementsData.swiperOptions, autoplay: { ...elementsData.swiperOptions.autoplay, delay: e.target.value } })}
            />
          </div>
        </div>

        {/* Speed */}
        <div className="flex flex-wrap mb-4">
          <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color primary-text">Speed</label>
            <input
              type="number"
              className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
              placeholder="Speed"
              value={elementsData.swiperOptions.speed}
              onChange={(e) => handleInputChange('swiperOptions', { ...elementsData.swiperOptions, speed: e.target.value })}
            />
          </div>

          {/* Effect */}
          <div className="w-full sm:w-1/2 p-4">
          <label className="block w-full mb-2 text-text-color primary-text">Effect</label>
            <input
              type="text"
              className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
              placeholder="Effect"
              value={elementsData.swiperOptions.effect}
              onChange={(e) => handleInputChange('swiperOptions', { ...elementsData.swiperOptions, effect: e.target.value })}
            />
          </div>
        </div>

        {/* Loop Toggle */}
        <div className="flex flex-wrap mb-4">
          <div className="w-full sm:w-1/2 p-4">
            <label className="relative inline-flex items-center cursor-pointer primary-text">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={elementsData.swiperOptions.loop}
                onChange={() => handleInputChange('swiperOptions', { ...elementsData.swiperOptions, loop: !elementsData.swiperOptions.loop })}
              />
              <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              <span className="ms-3 text-md font-medium text-text-color">Loop</span>
            </label>
          </div>

          {/* Disable on Interaction */}
          <div className="w-full sm:w-1/2 p-4">
            <label className="relative inline-flex items-center cursor-pointer primary-text">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={elementsData.swiperOptions.autoplay?.disableOnInteraction}
                onChange={() => handleInputChange('swiperOptions', { ...elementsData.swiperOptions, autoplay: { ...elementsData.swiperOptions.autoplay, disableOnInteraction: !elementsData.swiperOptions.autoplay?.disableOnInteraction } })}
              />
              <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              <span className="ms-3 text-md font-medium text-text-color">Disable on Interaction</span>
            </label>
          </div>
        </div>

      </div>
    </div>}


    {/* Card Options Settings */}
{(elementsData.componentType === "card")&&<div className="mb-4">
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
</div>}



        {/* Number Items */}
        <div className="mb-4">
          <label className="block w-full mb-2 text-text-color primary-text">Number of Items (Web, Android, iOS)</label>
          
          <div className="notes-container p-4 bg-secondary-card rounded-lg">
          <div className="flex gap-4">
            <input
              type="number"
              value={elementsData.numberItems.web}
              onChange={(e) => handleInputChange('numberItems', { ...elementsData.numberItems, web: e.target.value })}
              className="block w-1/3 px-3 py-2 text-text-color secondary-card border rounded"
              placeholder="Web"
            />
            <input
              type="number"
              value={elementsData.numberItems.android}
              onChange={(e) => handleInputChange('numberItems', { ...elementsData.numberItems, android: e.target.value })}
              className="block w-1/3 px-3 py-2 text-text-color secondary-card border rounded"
              placeholder="Android"
            />
            <input
              type="number"
              value={elementsData.numberItems.iOS}
              onChange={(e) => handleInputChange('numberItems', { ...elementsData.numberItems, iOS: e.target.value })}
              className="block w-1/3 px-3 py-2 text-text-color secondary-card border rounded"
              placeholder="iOS"
            />
          </div>
        </div>
        </div>

        {/* Titles */}
        <div className="mb-4">
  <div className="flex items-center justify-between mb-4">
    <label className="block w-full mb-2 text-text-color primary-text">Titles</label>
    <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addTitle}>Add</button>
  </div>
  <div className="notes-container p-4 bg-secondary-card rounded-lg">
    {elementsData.title.length === 0 && <p className='text-text-color'>No Titles added</p>}
    {elementsData.title?.map((title, index) => (
      <div className="flex gap-4 mb-2">
        <Autosuggest
  suggestions={suggestions}
  onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
  onSuggestionsClearRequested={handleSuggestionsClearRequested}
  getSuggestionValue={getSuggestionValue}
  renderSuggestion={renderSuggestion}
  inputProps={{
    placeholder: 'Enter Language',
    value: title.lanCode,
    onChange: (e, { newValue }) =>
      handleNestedChange('title', index, 'lanCode', newValue),
    className: 'block w-full px-3 py-2 text-text-color secondary-card border rounded'
  }}
  theme={{
    container: 'relative', // Make sure the container is relatively positioned
    suggestionsContainer: 'absolute w-full secondary-card rounded-md z-10',
    suggestion: 'p-2 cursor-pointer',
    suggestionHighlighted: 'bg-blue-500 text-black'
  }}
/>
<input
  type="text"
  value={title.name}
  onChange={(e) => handleNestedChange('title', index, 'name', e.target.value)}
  className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
  placeholder="Title Name"
/>

        <button
          type="button"
          className="bg-secondary-card text-text-color px-4 py-2 rounded ml-2"
          onClick={() => removeTitle(index)}
        >
          Remove
        </button>
      </div>
    ))}
  </div>
  </div>


        {/* Description */}
        <div className="mb-4">
<div className="flex items-center justify-between mb-4">
  <label className="block w-full mb-2 text-text-color primary-text">Description</label>
  <button type="button" className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded" onClick={addDescription}>Add</button>
</div>
<div className="notes-container p-4 bg-secondary-card rounded-lg">
  {elementsData.description.length === 0 && <p className='text-text-color'>No Descriptions added</p>}
  {elementsData.description?.map((desc, index) => (
    <div className="flex gap-4 mb-2" key={index}>
      <Autosuggest
  suggestions={suggestions}
  onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
  onSuggestionsClearRequested={handleSuggestionsClearRequested}
  getSuggestionValue={getSuggestionValue}
  renderSuggestion={renderSuggestion}
  inputProps={{
    placeholder: 'Enter Language',
    value: desc.lanCode,
    onChange: (e, { newValue }) =>
      handleNestedChange('description', index, 'lanCode', newValue),
    className: 'block w-full px-3 py-2 text-text-color secondary-card border rounded'
  }}
  theme={{
    container: 'relative', // Make sure the container is relatively positioned
    suggestionsContainer: 'absolute w-full secondary-card rounded-md z-10',
    suggestion: 'p-2 cursor-pointer',
    suggestionHighlighted: 'bg-blue-500 text-black'
  }}
/>
      <textarea
        type="text"
        value={desc.paragraph}
        onChange={(e) => handleNestedChange('description', index, 'paragraph', e.target.value)}
        className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
        placeholder="Description"
      />
      <button
        type="button"
        className="bg-secondary-card text-text-color px-4 py-2 rounded ml-2"
        onClick={() => removeDescription(index)}
      >
        Remove
      </button>
    </div>
  ))}
</div>
</div>

        {/* Items */}
        <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
      <label className="block w-full mb-2 text-text-color primary-text">Items</label>
      <button type="button" onClick={handleAddItem} className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded">Add</button>
      </div>
      <div className="notes-container p-4 bg-secondary-card rounded-lg">
          {(elementsData?.items?.length===0)&&<p className='text-text-color'>No Items added</p>}
      {elementsData.items.map((item, index) => (
        <div key={index} className="flex gap-4 mb-2">
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
  className="block w-1/2"
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

          <Select
            options={getItemOptions(item.itemType)}
            value={getItemOptions(item.itemType)?.find(option => option.value === item.itemId)}
            onChange={(selectedOption) => handleNestedChange('items', index, 'itemId', selectedOption.value)}
            className="block w-1/2"
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
           <button
           type="button"
            onClick={() => handleRemoveItem(index)}
            className="bg-secondary-card text-text-color px-4 py-2 rounded"
          >
            Remove
          </button>
        </div>
      ))}
      

      {/* DnD kit implementation */}
      {!(elementsData?.items?.length===0)&&
      <DndContext onDragEnd={onDragEnd}>
        <SortableContext items={elementsData.items.map((_, index) => index)}>
          <table className="mt-4 w-full">
            <thead>
              <tr className="border-gray-700 bg-secondary-card text-text-color">
                <th className="border-gray-700 bg-secondary-card text-text-color rounded-l-lg">Item Type</th>
                <th className="border-gray-700 bg-secondary-card text-text-color rounded-r-lg">Item ID</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {elementsData?.items?.map((item, index) => (
                <SortableRow key={index} index={index} item={item} />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>}
    </div>
    
    </div>




        {/* With Text */}
        <div className="flex flex-wrap mb-4">
          <div className="w-full sm:w-1/2 p-4">
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
          </div>


          {/* With Description */}
          <div className="w-full sm:w-1/2 p-4">
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
          </div>
        </div>



        {/* Submit Button */}
        {renderSubmitButtons()}
      </form>
      <ToastContainer />
    </div>
  );
}

const SortableRow = ({ index, item }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: index });

  const style = {
    transform: `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)`,
    transition,
  };

  return (
    <tr
  ref={setNodeRef}
  style={style}
  {...attributes}
  {...listeners}
  className="border-gray-700 bg-secondary-card text-center"
>
  <td className="whitespace-nowrap font-medium text-text-color rounded-l-lg">{item.itemType}</td>
  <td className="whitespace-nowrap font-medium text-text-color rounded-r-lg">{item.itemId}</td>
</tr>

  );
};

export default ElementForm;
