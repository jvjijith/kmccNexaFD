import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useGetData, usePostData, usePutData } from '../../common/api';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';

function MenuForm({ menu }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [itemImage, setItemImage] = useState([]);
    const [subItemImage, setSubItemImage] = useState([]);
    const [mediaId, setMediaId] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);
    const [activeSubIndex, setActiveSubIndex] = useState(null);
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

// Generate dropdown options for menuPage
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
    // { value: 'mega', label: 'Mega' },
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
        items: menu.items,
        active: menu.active,
      });
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

//   const handleNestedChange = (key, index, field, value) => {
//     if (!Array.isArray(formData[key])) {
//       console.error(`Expected an array for formData[${key}], but got:`, formData[key]);
//       return;
//     }
//     const updatedArray = [...formData[key]];
//     updatedArray[index][field] = value;
//     setFormData((prev) => ({ ...prev, [key]: updatedArray }));
//   };

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
          multiItems: [], // Initialize multiItems
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


  const {  getRootProps: getRootProps1, getInputProps: getInputProps1 } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        // Ensure only one image is stored
        setFiles([acceptedFiles[0]]);
      } else {
        toast.error('Only one image can be uploaded at a time.');
      }
    },
  });
  const {  getRootProps: getRootProps2, getInputProps: getInputProps2 } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        // Ensure only one image is stored
        setItemImage([acceptedFiles[0]]);
      } else {
        toast.error('Only one image can be uploaded at a time.');
      }
    },
  });
  const {  getRootProps: getRootProps3, getInputProps: getInputProps3 } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        // Ensure only one image is stored
        setSubItemImage([acceptedFiles[0]]);
      } else {
        toast.error('Only one image can be uploaded at a time.');
      }
    },
  });
  
  const handleRemoveAttachment = () => {
    // Clear the single file
    setFiles([]);
  };
  
  const handleUploadAttachment = async (file) => {
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
      
      console.log("Signed URL:", signedUrl, "Media ID:", mediaId);
  
      // Perform the file upload
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
  
      // Add the uploaded file URL to formData
      setFormData((prevValues) => ({
        ...prevValues,
        imageUrl: `${import.meta.env.VITE_MEDIA_BASE_URL}${mediaId}.${file.name.split('.').pop()}`,
      }));
  
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error("Upload error:", error);
      toast.error('Failed to upload the image. Please try again.');
    }
  };
  

  const handleUploadImageForItem = (index, file) => {
    handleUploadAttachment(file, (imageUrl) => {
      const updatedItems = [...formData.items];
      updatedItems[index].imageUrl = imageUrl;
      setFormData((prev) => ({ ...prev, items: updatedItems }));
    });
  };

  const handleUploadImageForSubItem = (itemIndex, subItemIndex, file) => {
    handleUploadAttachment(file, (imageUrl) => {
      const updatedItems = [...formData.items];
      updatedItems[itemIndex].multiItems[subItemIndex].imageUrl = imageUrl;
      setFormData((prev) => ({ ...prev, items: updatedItems }));
    });
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

  console.log(formData);
  console.log(appData);

  return (
    <div>
      <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap">
        <div className="w-full sm:w-1/2 p-4">
      {/* App ID as a Dropdown */}
      <div className="mb-4">
          <label  className="block mb-2 text-white">App ID</label>
    <Select
            options={appOptions}
            value={appOptions.find((opt) => opt.value === formData.appId)}
            onChange={(opt) => setFormData((prev) => ({ ...prev, appId: opt.value }))}
            styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : '#D3D3D3',
                  borderBottomWidth: '2px',
                  borderRadius: '0px',
                  height: '40px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  color: 'white',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: 'black',
                  color: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#007bff' : 'black',
                  color: state.isSelected ? 'black' : 'white',
                  cursor: 'pointer',
                }),
              }}
          />
        </div>
        </div>
        <div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
    <label className="float-left inline-block mb-2 text-white">Menu Name</label>
          <input type="text" className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white" name="menuName" value={formData.menuName} onChange={handleInputChange} required />
        </div>
        </div>
        <div className="w-full sm:w-1/2 p-4">
      {/* Menu Type as a Dropdown */}
      <div className="mb-4">
          <label  className="block mb-2 text-white">Menu Type</label>
          <Select
            options={menuTypeOptions}
            value={menuTypeOptions.find((opt) => opt.value === formData.menuType)}
            onChange={(opt) => setFormData((prev) => ({ ...prev, menuType: opt.value }))}
            styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : '#D3D3D3',
                  borderBottomWidth: '2px',
                  borderRadius: '0px',
                  height: '40px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  color: 'white',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: 'black',
                  color: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#007bff' : 'black',
                  color: state.isSelected ? 'black' : 'white',
                  cursor: 'pointer',
                }),
              }}
          />
        </div>
        </div>
        <div className="w-full sm:w-1/2 p-4">
      {/* Layout Type as a Dropdown */}
      <div className="mb-4">
          <label  className="block mb-2 text-white">Layout Type</label>
          <Select
            options={layoutTypeOptions}
            value={layoutTypeOptions.find((opt) => opt.value === formData.layoutType)}
            onChange={(opt) => setFormData((prev) => ({ ...prev, layoutType: opt.value }))}
            styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : '#D3D3D3',
                  borderBottomWidth: '2px',
                  borderRadius: '0px',
                  height: '40px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  color: 'white',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: 'black',
                  color: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#007bff' : 'black',
                  color: state.isSelected ? 'black' : 'white',
                  cursor: 'pointer',
                }),
              }}
          />
        </div>
        </div>
        <div className="w-full sm:w-1/2 p-4">
            <label className="block mb-2 text-white">Menu Page</label>
            <Select
              options={pageOptions}
              value={pageOptions?.find((opt) => opt.value === formData.menuPage)}
              onChange={(opt) => setFormData((prev) => ({ ...prev, menuPage: opt.value }))}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : '#D3D3D3',
                  borderBottomWidth: '2px',
                  borderRadius: '0px',
                  height: '40px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  color: 'white',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: 'black',
                  color: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#007bff' : 'black',
                  color: state.isSelected ? 'black' : 'white',
                  cursor: 'pointer',
                }),
              }}
            />
          </div>


          <div className="w-full p-4">
  <label className="block w-full mb-2 text-white">Upload Image</label>

  <div
    {...getRootProps1({
      className: "dropzone",
    })}
    className="w-full p-4 border-dashed border-2 border-gray-300 rounded-lg text-center mb-4"
  >
    <input {...getInputProps1()} />
    <p className="text-gray-600">
      <span className="font-semibold">Drop an image here</span> or{" "}
      <span className="text-black font-semibold cursor-pointer">
        Browse file
      </span>
    </p>
    <p className="text-sm text-gray-400 mt-2">
      Only one image allowed 
    </p>
  </div>

  {files.length > 0 && (
    <div className="flex items-center justify-between p-3 border rounded-md bg-sidebar-card-top">
      <div className="flex items-center">
        <img
          src={URL.createObjectURL(files[0])}
          alt="preview"
          className="w-10 h-10 object-cover rounded-md mr-8"
        />
        <div>
          <span className="block font-medium text-gray-300">{files[0].name}</span>
          <span className="text-xs text-gray-500">
            {Math.round(files[0].size / (1024 * 1024))} MB
          </span>
        </div>
      </div>

      <div className="flex items-center">
        <button
          className="mr-2 text-blue-500 hover:text-blue-700"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleUploadAttachment(files[0]);
          }}
        >
          Upload
        </button>
        <button
          className="text-gray-600 hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveAttachment();
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
  )}
</div>

<div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        name="allowImage"
        checked={formData.allowImage}
        onChange={handleInputChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
      <span className="ml-3 text-sm font-medium text-white">Allow Image</span>
    </label>
  </div>
</div>


{(formData?.menuType !== "single") && 
(<div className="w-full p-4">
{/* Menu Items Section */}
<div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block w-full mb-2 text-white">Menu Items</label>
            <button
              type="button"
              className="bg-black text-white px-4 py-2 rounded"
              onClick={handleAddItem}
            >
              Add
            </button>
          </div>
          <div className="accordion-container">
            {formData.items.length === 0 && 
            <div className="mb-4 border p-4 rounded border-nexa-gray">
            <p>No Menu Items added</p>
            </div>}
            {formData.items.map((item, index) => (
              <div key={index} className="border border-nexa-gray rounded-lg mb-4">
                <div
                    className="accordion-header bg-black text-white px-4 py-2 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleAccordion(index, "menu")}
                  >
                    {/* Menu Item Name */}
                    <span>{item.menuName || `Menu Item ${index + 1}`}</span>

                    {/* Toggle and Close Button */}
                    <div className="flex items-center space-x-2">
                      {/* + / - Toggle */}
                      <span>{activeIndex === index ? "-" : "+"}</span>

                      {/* Close Button */}
                      <button
                        type="button"
                        className="bg-black text-white px-6 py-2 rounded"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering accordion toggle
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
                    className="block w-1/2 h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white ml-2"
                  />
                  <Select
                    options={subMenuTypeOptions}
                    value={{ value: item.menuType, label: item.menuType }}
                    onChange={(option) =>
                      handleNestedChange('items', index, 'menuType', option.value)
                    }
                    className="w-1/2 ml-2 mr-2"
                    styles={{
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: 'black',
                          borderColor: state.isFocused ? 'white' : '#D3D3D3',
                          borderBottomWidth: '2px',
                          borderRadius: '0px',
                          height: '40px',
                          paddingLeft: '8px',
                          paddingRight: '8px',
                          color: 'white',
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: 'white',
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: 'white',
                        }),
                        menu: (provided) => ({
                          ...provided,
                          backgroundColor: 'black',
                          color: 'white',
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected ? '#007bff' : 'black',
                          color: state.isSelected ? 'black' : 'white',
                          cursor: 'pointer',
                        }),
                      }}
                  />
                </div>
                <div className="flex items-center justify-between mb-2">
                <Select
              options={pageOptions}
              value={pageOptions?.find((opt) => opt.value === formData?.items.menuPage)}
              onChange={(opt) =>
                handleNestedChange('items', index, 'menuPage', opt.value)
              }
              className="w-1/2 ml-2"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : '#D3D3D3',
                  borderBottomWidth: '2px',
                  borderRadius: '0px',
                  height: '40px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  color: 'white',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: 'black',
                  color: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#007bff' : 'black',
                  color: state.isSelected ? 'black' : 'white',
                  cursor: 'pointer',
                }),
              }}
            />
                </div>

                <div className="w-full p-4">
  {/* Upload File Header */}
    <label className="block w-full mb-2 text-white">Upload image</label>

  {/* Dropzone */}
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
    {itemImage.map((file, index) => (
      <div
        key={index}
        className="flex items-center justify-between p-3 border rounded-md bg-sidebar-card-top"
      >
        {/* Image Preview and Info */}
        <div className="flex items-center">
          {/* Image Preview */}
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

          {/* File Info */}
          <div>
            <span className="block font-medium gray-300">{file.name}</span>
            {/* {file.size > 25 * 1024 * 1024 ? (
              <span className="text-xs text-red-500">
                File is too large (max. 25 MB)
              </span>
            ) : ( */}
              <span className="text-xs text-gray-500">
                {Math.round(file.size / (1024 * 1024))} MB
              </span>
            {/* )} */}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center">
          {/* Upload Button */}
          <button
            className="mr-2 text-blue-500 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleUploadAttachment(file, index);
            }}
          >
            Upload
          </button>
          {/* Remove Button */}
          <button
            className="text-gray-600 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              setFiles(files.filter((_, i) => i !== index));
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
</div>

<div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={item.allowImage}
        onChange={(e) =>
          handleNestedChange('items', index, 'allowImage', e.target.checked)
        }
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
      <span className="ml-3 text-sm font-medium text-white">Allow Image</span>
    </label>
  </div>
</div>

{/* <div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={item.active}
        onChange={(e) =>
          handleNestedChange('items', index, 'active', e.target.checked)
        }
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
      <span className="ml-3 text-sm font-medium text-white">Active</span>
    </label>
  </div>
</div> */}


               {/* Sub-items */}
{(formData?.items[index]?.menuType !== "single") && 
  (<div className="mb-4">
  <div className="flex items-center justify-between mb-4 ml-2 mr-2">
    <label className="block w-full mb-2 text-white">Sub-Menu</label>
    <button
      type="button"
      className="bg-black text-white px-4 py-2 rounded"
      onClick={() => handleAddSubItem(index)}
    >
      Add
    </button>
  </div>
  {item.multiItems.length === 0 && (
            <div className="mb-4 ml-2 mr-2 border p-4 rounded border-nexa-gray">
    <p className="text-white">No Sub-Menu added</p>
    </div>
  )}
  <div
    className={`accordion-container ${
      item.multiItems.length > 8 ? "max-h-96 overflow-y-auto" : ""
    }`}
  >
  {item.multiItems.map((subItem, subIndex) => (
    <div
      key={subIndex}
      className="border border-nexa-gray rounded-lg ml-2 mr-2">
                <div
  className="accordion-header bg-black text-white px-4 py-2 flex justify-between items-center cursor-pointer"
  onClick={() => toggleAccordion(subIndex, "sub")}
>
  {/* Sub-Menu Name */}
  <span>{item.menuName || `Sub-Menu Item ${subIndex + 1}`}</span>

  {/* Toggle and Close Button */}
  <div className="flex items-center space-x-2">
    {/* + / - Toggle */}
    <span>{activeSubIndex === subIndex ? "-" : "+"}</span>

    {/* Close Button */}
    <button
      type="button"
      className="bg-black text-white px-4 py-2 rounded"
      onClick={(e) => {
        e.stopPropagation(); // Prevent toggle when clicking "x"
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
        {/* Sub-Item Name Input */}
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
          className="block w-1/2 h-10 px-2 py-1 ml-2 mt-2 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white transition text-white"
        />
        {/* Sub-Item Dropdown */}
        <Select
          options={itemSubMenuTypeOptions}
          value={itemSubMenuTypeOptions.find((opt) => opt.value === subItem.menuType)}
          onChange={(opt) =>
            handleSectionChange(
              index,
              subIndex,
              'menuType',
              opt.value
            )
          }
          className="w-1/2 mr-2 mt-2"
          styles={{
            control: (provided, state) => ({
              ...provided,
              backgroundColor: 'black',
              borderColor: state.isFocused ? 'white' : '#D3D3D3',
              borderBottomWidth: '2px',
              borderRadius: '0px',
              height: '40px',
              paddingLeft: '8px',
              paddingRight: '8px',
              color: 'white',
            }),
            singleValue: (provided) => ({
              ...provided,
              color: 'white',
            }),
            placeholder: (provided) => ({
              ...provided,
              color: 'white',
            }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: 'black',
              color: 'white',
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isSelected ? '#007bff' : 'black',
              color: state.isSelected ? 'black' : 'white',
              cursor: 'pointer',
            }),
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
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: 'black',
                  borderColor: state.isFocused ? 'white' : '#D3D3D3',
                  borderBottomWidth: '2px',
                  borderRadius: '0px',
                  height: '40px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  color: 'white',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: 'black',
                  color: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#007bff' : 'black',
                  color: state.isSelected ? 'black' : 'white',
                  cursor: 'pointer',
                }),
              }}
            />
    </div>

    <div className="w-full p-4">
  {/* Upload File Header */}
    <label className="block w-full mb-2 text-white">Upload image</label>

  {/* Dropzone */}
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
    {subItemImage.map((file, index) => (
      <div
        key={index}
        className="flex items-center justify-between p-3 border rounded-md bg-sidebar-card-top"
      >
        {/* Image Preview and Info */}
        <div className="flex items-center">
          {/* Image Preview */}
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

          {/* File Info */}
          <div>
            <span className="block font-medium gray-300">{file.name}</span>
            {/* {file.size > 25 * 1024 * 1024 ? (
              <span className="text-xs text-red-500">
                File is too large (max. 25 MB)
              </span>
            ) : ( */}
              <span className="text-xs text-gray-500">
                {Math.round(file.size / (1024 * 1024))} MB
              </span>
            {/* )} */}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center">
          {/* Upload Button */}
          <button
            className="mr-2 text-blue-500 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleUploadAttachment(file, index);
            }}
          >
            Upload
          </button>
          {/* Remove Button */}
          <button
            className="text-gray-600 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              setFiles(files.filter((_, i) => i !== index));
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
</div>

<div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={subItem.allowImage}
        onChange={(e) =>
            handleSectionChange(index, subIndex, 'allowImage', e.target.checked)
        }
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
      <span className="ml-3 text-sm font-medium text-white">Allow Image</span>
    </label>
  </div>
</div>



      
    </div>
    </div>
  ))}
</div>

              </div>)
              }
          </div>
          </div>
            ))}
          </div>
        </div>
        </div>)}


      

{/* <div className="w-full sm:w-1/2 p-4">
  <div className="mb-4">
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        name="active"
        checked={formData.active}
        onChange={handleInputChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-orange after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-black peer-checked:bg-orange-600"></div>
      <span className="ml-3 text-sm font-medium text-white">Active</span>
    </label>
  </div>
</div> */}
        </div>

<div className="flex flex-wrap justify-end p-4">
  <button type="submit" className="bg-nexa-orange text-white px-6 py-2 rounded">
    {isLoading ? 'Saving...' : 'Save'}
  </button>
</div>
      </form>
    </div>
  );
}

export default MenuForm;
