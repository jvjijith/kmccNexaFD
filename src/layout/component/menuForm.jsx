import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useGetData, usePostData, usePutData } from '../../common/api';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function MenuForm({ menu }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Fixed: Added missing state variables
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [itemImage, setItemImage] = useState([]);
  const [subItemImage, setSubItemImage] = useState([]);
  const [mediaId, setMediaId] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeSubIndex, setActiveSubIndex] = useState(null);
  const [uploadedImages, setUploadedImages] = useState(null);

  const toggleAccordion = (index, field) => {
    if(field==="menu"){
      setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
    }
    else{
      setActiveSubIndex((prevIndex) => (prevIndex === index ? null : index));
    }
  };

  const mutationHook = menu ? usePutData : usePostData;
  const api_url = menu ? `/menu/${menu._id}` : '/menu';
  const api_key = menu ? 'updateMenu' : 'addMenu';
  const { mutate: saveMenu, isLoading } = mutationHook(api_key, api_url);

  const { data: pageData, isLoading: isPageLoading } = useGetData('page', '/pages', {});
  const { data: appData, isLoading: isAppLoading } = useGetData('app', '/app', {});

  const { mutateAsync: generateSignedUrl } = usePostData('signedUrl', '/media/generateSignedUrl');
  const { mutateAsync: updateMediaStatus } = usePutData('updateMediaStatus', `/media/update/${mediaId}`, { enabled: !!mediaId });

  const [formData, setFormData] = useState({
    appId: '',
    menuName: '',
    menuType: 'single',
    layoutType: 'left drawer',
    menuPage: '',
    imageUrl: null,
    allowImage: false,
    items: [],
    active: true,
  });

  // Generate dropdown options
  const pageOptions = pageData?.pages.map((page) => ({
    value: page._id,
    label: page.title[0]?.title || 'Untitled Page',
  }));

  const appOptions = appData?.apps?.map((page) => ({
    value: page._id,
    label: page.title || 'Untitled Page',
  }));

  const menuTypeOptions = [
    { value: 'single', label: 'Single' },
    { value: 'multiple', label: 'Multiple' },
  ];

  const subMenuTypeOptions = [
    { value: 'single', label: 'Single' },
    { value: 'multiple', label: 'Multiple' },
  ];

  const itemSubMenuTypeOptions = [
    { value: 'single', label: 'Single' },
  ];

  const layoutTypeOptions = [
    { value: 'left drawer', label: 'Left Drawer' },
    { value: 'right drawer', label: 'Right Drawer' },
    { value: 'top', label: 'Top' },
    { value: 'left hamBurger', label: 'Left Hamburger' },
    { value: 'right hamBurger', label: 'Right Hamburger' },
  ];

  useEffect(() => {
    if (menu) {
      const cleanedMenu = removeUnwantedFields(menu);
      setFormData({
        appId: menu?.appId?._id,
        menuName: menu.menuName,
        menuType: menu.menuType,
        layoutType: menu.layoutType,
        menuPage: menu.menuPage,
        imageUrl: menu.imageUrl,
        allowImage: menu.allowImage,
        items: cleanedMenu.items,
        active: menu.active,
      });
      
      // Fixed: Set uploaded image if it exists
      if (menu.imageUrl) {
        setUploadedImages(menu.imageUrl);
      }
    }
    setTimeout(() => setLoading(false), 1000);
  }, [menu]);

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

  const handleNestedChange = (field, index, nestedField, value) => {
    setFormData((prevData) => {
      const updatedField = [...prevData[field]];
      updatedField[index][nestedField] = value;
      return { ...prevData, [field]: updatedField };
    });
  };

  const handleSectionChange = (templateIndex, sectionIndex, field, value) => {
    setFormData((prevData) => {
      const updatedTemplates = [...prevData.items];
      updatedTemplates[templateIndex].multiItems[sectionIndex][field] = value;
      return { ...prevData, items: updatedTemplates };
    });
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          menuName: '',
          menuType: 'single',
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
    updatedItems[itemIndex].multiItems.push({
      menuName: '',
      menuType: 'single',
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
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  // Fixed: Main menu image upload
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setImages([...images, ...acceptedFiles]);
    }
  });

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = () => {
    setUploadedImages(null);
    setFormData((prev) => ({
      ...prev,
      imageUrl: null,
    }));
  };

  const handleUploadImages = async (index) => {
    try {
      const image = images[index];
      console.log(`Generating signed URL for ${image.name}`);

      const signedUrlResponse = await generateSignedUrl({
        title: image.name,
        mediaType: "image",
        ext: image.name.split('.').pop(),
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

      await axios.put(signedUrl, image, {
        headers: {
          'Content-Type': image.type
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [image.name]: progress }));

          if (progress === 100) {
            updateMediaStatus({
              mediaType: "image",
              title: image.name,
              ext: image.name.split('.').pop(),
              active: true,
              uploadStatus: "completed",
              uploadProgress: 100,
            });
          }
        }
      });

      // Fixed: Use environment variable properly
      const imageUrl = `${import.meta.env.VITE_MEDIA_BASE_URL}${mediaId}.${image.name.split('.').pop()}`;
      setUploadedImages(imageUrl);
      
      setFormData(prev => ({
        ...prev,
        imageUrl: imageUrl
      }));

      // Remove uploaded image from pending list
      setImages(prev => prev.filter((_, i) => i !== index));
      toast.success('Image uploaded successfully!');

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('An error occurred while uploading the image. Please try again.');
    }
  };

  // Fixed: Item image upload
  const { getRootProps: getRootProps2, getInputProps: getInputProps2 } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setItemImage([acceptedFiles[0]]);
      } else {
        toast.error('Only one image can be uploaded at a time.');
      }
    },
  });

  // Fixed: Sub-item image upload
  const { getRootProps: getRootProps3, getInputProps: getInputProps3 } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSubItemImage([acceptedFiles[0]]);
      } else {
        toast.error('Only one image can be uploaded at a time.');
      }
    },
  });

  // Fixed: Generic upload function
  const handleUploadAttachment = async (file, callback) => {
    try {
      console.log(`Generating signed URL for ${file.name}`);

      const signedUrlResponse = await generateSignedUrl({
        title: file.name,
        mediaType: "image",
        ext: file.name.split('.').pop() || "",
        active: true,
        uploadStatus: "progressing",
        uploadProgress: 0,
      });

      if (!signedUrlResponse || !signedUrlResponse.signedUrl) {
        throw new Error('Invalid signed URL response');
      }

      const { signedUrl, media } = signedUrlResponse;
      const mediaId = media._id;

      setMediaId(mediaId);

      await axios.put(signedUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${progress}%`);

          if (progress === 100) {
            updateMediaStatus({
              mediaType: "image",
              title: file.name,
              ext: file.name.split('.').pop() || "",
              active: true,
              uploadStatus: "completed",
              uploadProgress: 100,
            });
          }
        },
      });

      const imageUrl = `${import.meta.env.VITE_MEDIA_BASE_URL}${mediaId}.${file.name.split('.').pop()}`;
      
      if (callback) {
        callback(imageUrl);
      }

      toast.success('Image uploaded successfully!');
      return imageUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error('Failed to upload the image. Please try again.');
      throw error;
    }
  };

  // Fixed: Item image upload handler
  const handleUploadImageForItem = async (itemIndex) => {
    if (itemImage.length === 0) {
      toast.error('Please select an image first.');
      return;
    }

    try {
      const imageUrl = await handleUploadAttachment(itemImage[0]);
      const updatedItems = [...formData.items];
      updatedItems[itemIndex].imageUrl = imageUrl;
      setFormData((prev) => ({ ...prev, items: updatedItems }));
      setItemImage([]); // Clear after upload
    } catch (error) {
      console.error('Error uploading item image:', error);
    }
  };

  // Fixed: Sub-item image upload handler
  const handleUploadImageForSubItem = async (itemIndex, subItemIndex) => {
    if (subItemImage.length === 0) {
      toast.error('Please select an image first.');
      return;
    }

    try {
      const imageUrl = await handleUploadAttachment(subItemImage[0]);
      const updatedItems = [...formData.items];
      updatedItems[itemIndex].multiItems[subItemIndex].imageUrl = imageUrl;
      setFormData((prev) => ({ ...prev, items: updatedItems }));
      setSubItemImage([]); // Clear after upload
    } catch (error) {
      console.error('Error uploading sub-item image:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMenu(formData, {
      onSuccess: () => {
        toast.success('Menu saved successfully!');
        navigate('/menu');
      },
      onError: (error) => {
        toast.error('Failed to save the menu.');
        console.error(error);
      },
    });
  };

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  console.log("image",images);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          {/* App ID Dropdown */}
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block mb-2 text-text-color">App ID</label>
              <Select
                options={appOptions}
                value={appOptions?.find((opt) => opt.value === formData.appId)}
                onChange={(opt) => setFormData((prev) => ({ ...prev, appId: opt.value }))}
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

          {/* Menu Name */}
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="float-left inline-block mb-2 text-text-color primary-text">Menu Name</label>
              <input 
                type="text" 
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color" 
                name="menuName" 
                value={formData.menuName} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          </div>

          {/* Menu Type */}
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block mb-2 text-text-color">Menu Type</label>
              <Select
                options={menuTypeOptions}
                value={menuTypeOptions?.find((opt) => opt.value === formData.menuType)}
                onChange={(opt) => setFormData((prev) => ({ ...prev, menuType: opt.value }))}
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

          {/* Layout Type */}
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block mb-2 text-text-color">Layout Type</label>
              <Select
                options={layoutTypeOptions}
                value={layoutTypeOptions?.find((opt) => opt.value === formData.layoutType)}
                onChange={(opt) => setFormData((prev) => ({ ...prev, layoutType: opt.value }))}
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

          {/* Menu Page */}
          <div className="w-full sm:w-1/2 p-4">
            <label className="block mb-2 text-text-color">Menu Page</label>
            <Select
              options={pageOptions}
              value={pageOptions?.find((opt) => opt.value === formData.menuPage)}
              onChange={(opt) => setFormData((prev) => ({ ...prev, menuPage: opt.value }))}
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

          {/* Main Image Upload */}
          <div className="w-full p-4">
            <label className="block w-full mb-2 text-text-color primary-text">Upload Image</label>

            {/* Display existing image */}
            {uploadedImages && (
              <div className="mb-4">
                <div className="relative inline-block">
                  <img 
                    src={uploadedImages} 
                    alt="Menu" 
                    className="w-full max-w-md h-auto rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveExistingImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    title="Remove image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Upload new image */}
            {!uploadedImages && (
              <div className="space-y-4">
                <div 
                  {...getRootProps()} 
                  className="border-2 border-dashed border-border p-6 rounded-lg text-center cursor-pointer hover:bg-secondary-card transition-colors"
                >
                  <input {...getInputProps()} />
                  <p className="text-sm text-gray-500">Drag & drop an image here, or click to select</p>
                  <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630 pixels</p>
                </div>
                
                {/* Display selected images */}
                {images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Selected Images:</h4>
                    <div className="space-y-3">
                      {images.map((image, index) => (
                        <div key={index} className="flex items-center justify-between bg-secondary-card p-2 rounded">
                          <div className="flex items-center">
                            <span className="text-sm truncate text-gray-500 max-w-xs">{image.name}</span>
                            {uploadProgress[image.name] && (
                              <div className="ml-2 w-24 bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-primary-button-color h-2.5 rounded-full" 
                                  style={{ width: `${uploadProgress[image.name]}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {!uploadProgress[image.name] && (
                              <button
                                type="button"
                                onClick={() => handleUploadImages(index)}
                                className="text-primary-button-color hover:text-primary-button-hover p-1"
                                title="Upload"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Allow Image Toggle */}
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="relative inline-flex items-center cursor-pointer primary-text">
                <input
                  type="checkbox"
                  name="allowImage"
                  checked={formData.allowImage}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 border border-gray-300 dark:black"></div>
                <span className="ml-3 text-sm font-medium text-text-color">Allow Image</span>
              </label>
            </div>
          </div>

          {/* Menu Items Section - Only show if not single */}
          {(formData?.menuType !== "single") && (
            <div className="w-full p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <label className="block w-full mb-2 text-text-color primary-text">Menu Items</label>
                  <button
                    type="button"
                    className="bg-secondary-card text-text-color px-4 py-2 rounded"
                    onClick={handleAddItem}
                  >
                    Add
                  </button>
                </div>
                
                <div className="accordion-container">
                  {formData.items.length === 0 && (
                    <div className="mb-4 border p-4 rounded border-border">
                      <p className='text-text-color'>No Menu Items added</p>
                    </div>
                  )}
                  
                  {formData.items.map((item, index) => (
                    <div key={index} className="border border-border rounded-lg mb-4">
                      <div
                        className="accordion-header secondary-card text-text-color px-4 py-2 flex justify-between items-center cursor-pointer"
                        onClick={() => toggleAccordion(index, "menu")}
                      >
                        <span>{item.menuName || `Menu Item ${index + 1}`}</span>
                        <div className="flex items-center space-x-2">
                          <span>{activeIndex === index ? "-" : "+"}</span>
                          <button
                            type="button"
                            className="bg-secondary-card text-text-color px-6 py-2 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(index);
                            }}
                          >
                            x
                          </button>
                        </div>
                      </div>

                      <div className={`accordion-content overflow-hidden transition-all ${
                        activeIndex === index ? "max-h-screen" : "max-h-0"
                      }`}>
                        <div className="flex justify-between items-center mb-2 mt-2">
                          <input
                            type="text"
                            placeholder="Menu Name"
                            value={item.menuName}
                            onChange={(e) => handleNestedChange('items', index, 'menuName', e.target.value)}
                            className="block w-1/2 h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color ml-2"
                          />
                          <Select
                            options={subMenuTypeOptions}
                            value={{ value: item.menuType, label: item.menuType }}
                            onChange={(option) =>
                              handleNestedChange('items', index, 'menuType', option.value)
                            }
                            className="w-1/2 ml-2 mr-2"
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
                        
                        <div className="flex items-center justify-between mb-2">
                          <Select
                            options={pageOptions}
                            value={pageOptions?.find((opt) => opt.value === item.menuPage)}
                            onChange={(opt) =>
                              handleNestedChange('items', index, 'menuPage', opt.value)
                            }
                            className="w-1/2 ml-2"
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

                        {/* Item Image Upload */}
                        <div className="w-full p-4">
                          <label className="block w-full mb-2 text-text-color primary-text">Upload image</label>

                          {/* Show existing image if available */}
                          {item.imageUrl && (
                            <div className="mb-4">
                              <div className="relative inline-block">
                                <img 
                                  src={item.imageUrl} 
                                  alt="Item" 
                                  className="w-32 h-32 object-cover rounded-lg border border-border"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedItems = [...formData.items];
                                    updatedItems[index].imageUrl = null;
                                    setFormData((prev) => ({ ...prev, items: updatedItems }));
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                  title="Remove image"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Upload new image if no existing image */}
                          {!item.imageUrl && (
                            <>
                              <div
                                {...getRootProps2({
                                  className: "dropzone",
                                })}
                                className="w-full p-4 border-dashed border-2 border-gray-300 rounded-lg text-center mb-4"
                              >
                                <input {...getInputProps2()} />
                                <p className="text-gray-600">
                                  <span className="font-semibold">Drop items here</span> or{" "}
                                  <span className="text-black font-semibold cursor-pointer">
                                    Browse files
                                  </span>
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                  Only one image allowed 
                                </p>
                              </div>

                              {/* File List */}
                              <div className="space-y-2">
                                {itemImage.map((file, fileIndex) => (
                                  <div
                                    key={fileIndex}
                                    className="flex items-center justify-between p-3 border rounded-md bg-secondary-card"
                                  >
                                    <div className="flex items-center">
                                      {file.type.startsWith("image/") ? (
                                        <img
                                          src={URL.createObjectURL(file)}
                                          alt="preview"
                                          className="w-10 h-10 object-cover rounded-md mr-8"
                                        />
                                      ) : (
                                        <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center mr-4">
                                          <svg
                                            className="w-5 h-5 text-gray-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="2"
                                              d="M7 8h10M7 12h4m1 8h.01M5 12a7 7 0 117 7A7 7 0 015 12z"
                                            ></path>
                                          </svg>
                                        </div>
                                      )}

                                      <div>
                                        <span className="block font-medium gray-300">{file.name}</span>
                                        <span className="text-xs text-gray-500">
                                          {Math.round(file.size / (1024 * 1024))} MB
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center">
                                      <button
                                        className="mr-2 text-blue-500 hover:text-blue-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          handleUploadImageForItem(index);
                                        }}
                                      >
                                        Upload
                                      </button>
                                      <button
                                        className="text-gray-600 hover:text-red-500"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setItemImage([]);
                                        }}
                                      >
                                        <svg
                                          className="w-6 h-6"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                          ></path>
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Allow Image Toggle for Item */}
                        <div className="w-full sm:w-1/2 p-4">
                          <div className="mb-4">
                            <label className="relative inline-flex items-center cursor-pointer primary-text">
                              <input
                                type="checkbox"
                                checked={item.allowImage}
                                onChange={(e) =>
                                  handleNestedChange('items', index, 'allowImage', e.target.checked)
                                }
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 border border-gray-300 dark:black"></div>
                              <span className="ml-3 text-sm font-medium text-text-color">Allow Image</span>
                            </label>
                          </div>
                        </div>

                        {/* Sub-items */}
                        {(formData?.items[index]?.menuType !== "single") && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-4 ml-2 mr-2">
                              <label className="block w-full mb-2 text-text-color primary-text">Sub-Menu</label>
                              <button
                                type="button"
                                className="bg-secondary-card text-text-color px-4 py-2 rounded"
                                onClick={() => handleAddSubItem(index)}
                              >
                                Add
                              </button>
                            </div>
                            
                            {item.multiItems.length === 0 && (
                              <div className="mb-4 ml-2 mr-2 border p-4 rounded border-border">
                                <p className="text-text-color">No Sub-Menu added</p>
                              </div>
                            )}
                            
                            <div className={`accordion-container ${
                              item.multiItems.length > 8 ? "max-h-96 overflow-y-auto" : ""
                            }`}>
                              {item.multiItems.map((subItem, subIndex) => (
                                <div key={subIndex} className="border border-border rounded-lg ml-2 mr-2">
                                  <div
                                    className="accordion-header secondary-card text-text-color px-4 py-2 flex justify-between items-center cursor-pointer"
                                    onClick={() => toggleAccordion(subIndex, "sub")}
                                  >
                                    <span>{subItem.menuName || `Sub-Menu Item ${subIndex + 1}`}</span>
                                    <div className="flex items-center space-x-2">
                                      <span>{activeSubIndex === subIndex ? "-" : "+"}</span>
                                      <button
                                        type="button"
                                        className="bg-secondary-card text-text-color px-4 py-2 rounded"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveSubItem(index, subIndex);
                                        }}
                                      >
                                        x
                                      </button>
                                    </div>
                                  </div>

                                  <div className={`accordion-content overflow-hidden transition-all ${
                                    activeSubIndex === subIndex ? "max-h-screen" : "max-h-0"
                                  }`}>
                                    <div className="flex items-center gap-4">
                                      <input
                                        type="text"
                                        placeholder="Sub-Item Name"
                                        value={subItem.menuName}
                                        onChange={(e) =>
                                          handleSectionChange(
                                            index,
                                            subIndex,
                                            'menuName',
                                            e.target.value
                                          )
                                        }
                                        className="block w-1/2 h-10 px-2 py-1 ml-2 mt-2 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color"
                                      />
                                      <Select
                                        options={itemSubMenuTypeOptions}
                                        value={itemSubMenuTypeOptions?.find((opt) => opt.value === subItem.menuType)}
                                        onChange={(opt) =>
                                          handleSectionChange(
                                            index,
                                            subIndex,
                                            'menuType',
                                            opt.value
                                          )
                                        }
                                        className="w-1/2 mr-2 mt-2"
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
                                    
                                    <div className="flex items-center gap-4 mt-2">
                                      <Select
                                        options={pageOptions}
                                        value={pageOptions?.find((opt) => opt.value === subItem.menuPage)}
                                        onChange={(opt) =>
                                          handleSectionChange(
                                            index,
                                            subIndex,
                                            'menuPage',
                                            opt.value
                                          )
                                        }
                                        className="w-1/2 ml-2 mr-2 mt-2"
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

                                    {/* Sub-Item Image Upload */}
                                    <div className="w-full p-4">
                                      <label className="block w-full mb-2 text-text-color primary-text">Upload image</label>

                                      {/* Show existing image if available */}
                                      {subItem.imageUrl && (
                                        <div className="mb-4">
                                          <div className="relative inline-block">
                                            <img 
                                              src={subItem.imageUrl} 
                                              alt="Sub-Item" 
                                              className="w-32 h-32 object-cover rounded-lg border border-border"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updatedItems = [...formData.items];
                                                updatedItems[index].multiItems[subIndex].imageUrl = null;
                                                setFormData((prev) => ({ ...prev, items: updatedItems }));
                                              }}
                                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                              title="Remove image"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* Upload new image if no existing image */}
                                      {!subItem.imageUrl && (
                                        <>
                                          <div
                                            {...getRootProps3({
                                              className: "dropzone",
                                            })}
                                            className="w-full p-4 border-dashed border-2 border-gray-300 rounded-lg text-center mb-4"
                                          >
                                            <input {...getInputProps3()} />
                                            <p className="text-gray-600">
                                              <span className="font-semibold">Drop items here</span> or{" "}
                                              <span className="text-black font-semibold cursor-pointer">
                                                Browse files
                                              </span>
                                            </p>
                                            <p className="text-sm text-gray-400 mt-2">
                                              Only one image allowed 
                                            </p>
                                          </div>

                                          {/* File List */}
                                          <div className="space-y-2">
                                            {subItemImage.map((file, fileIndex) => (
                                              <div
                                                key={fileIndex}
                                                className="flex items-center justify-between p-3 border rounded-md bg-secondary-card"
                                              >
                                                <div className="flex items-center">
                                                  {file.type.startsWith("image/") ? (
                                                    <img
                                                      src={URL.createObjectURL(file)}
                                                      alt="preview"
                                                      className="w-10 h-10 object-cover rounded-md mr-8"
                                                    />
                                                  ) : (
                                                    <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center mr-4">
                                                      <svg
                                                        className="w-5 h-5 text-gray-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          strokeWidth="2"
                                                          d="M7 8h10M7 12h4m1 8h.01M5 12a7 7 0 117 7A7 7 0 015 12z"
                                                        ></path>
                                                      </svg>
                                                    </div>
                                                  )}

                                                  <div>
                                                    <span className="block font-medium gray-300">{file.name}</span>
                                                    <span className="text-xs text-gray-500">
                                                      {Math.round(file.size / (1024 * 1024))} MB
                                                    </span>
                                                  </div>
                                                </div>

                                                <div className="flex items-center">
                                                  <button
                                                    className="mr-2 text-blue-500 hover:text-blue-700"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      e.preventDefault();
                                                      handleUploadImageForSubItem(index, subIndex);
                                                    }}
                                                  >
                                                    Upload
                                                  </button>
                                                  <button
                                                    className="text-gray-600 hover:text-red-500"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setSubItemImage([]);
                                                    }}
                                                  >
                                                    <svg
                                                      className="w-6 h-6"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      viewBox="0 0 24 24"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M6 18L18 6M6 6l12 12"
                                                      ></path>
                                                    </svg>
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    {/* Allow Image Toggle for Sub-Item */}
                                    <div className="w-full sm:w-1/2 p-4">
                                      <div className="mb-4">
                                        <label className="relative inline-flex items-center cursor-pointer primary-text">
                                          <input
                                            type="checkbox"
                                            checked={subItem.allowImage}
                                            onChange={(e) =>
                                              handleSectionChange(index, subIndex, 'allowImage', e.target.checked)
                                            }
                                            className="sr-only peer"
                                          />
                                          <div className="w-11 h-6 secondary-card peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 border border-gray-300 dark:black"></div>
                                          <span className="ml-3 text-sm font-medium text-text-color">Allow Image</span>
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded">
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MenuForm;