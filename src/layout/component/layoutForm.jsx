import React, { useState, useEffect } from 'react';
import { layoutDefault } from '../../constant';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import LoadingScreen from "../ui/loading/loading";
import { useNavigate } from 'react-router';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const getWeightLabel = (weight) => {
  switch (weight) {
    case '100': return 'Thin';
    case '200': return 'Extra Light';
    case '300': return 'Light';
    case '400': return 'Regular';
    case '500': return 'Medium';
    case '600': return 'Semi Bold';
    case '700': return 'Bold';
    case '800': return 'Extra Bold';
    case '900': return 'Black';
    default: return weight;
  }
};

function LayoutForm({ layoutDatas }) {
  const navigate = useNavigate();
  const [layoutData, setLayoutData] = useState(layoutDefault);
  const [loading, setLoading] = useState(true);
  const [changeAppId, setChangeAppId] = useState(false); // Manage app ID change
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mediaId, setMediaId] = useState([]);

  const mutationHook = layoutDatas ? usePutData : usePostData;
  const api_url = layoutDatas ? `/layout/${layoutDatas._id}` : '/layout';
  const api_key = layoutDatas ? 'updateLayout' : 'addLayout';
  const { mutate: saveLayout, isLoading, isError } = mutationHook(api_key, api_url);
  const { mutateAsync: generateSignedUrl } = usePostData('signedUrl', '/media/generateSignedUrl');
  const { mutateAsync: updateMediaStatus } = usePutData('updateMediaStatus', `/media/update/${mediaId}`, { enabled: !!mediaId });

  // Fetch app data
  const { data: appData, isLoading: isAppLoading } = useGetData("data", "/app", {});

  const { data: colorData, isColorLoading, error, refetch } = useGetData(
    "ColorData",
    {}
  );

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

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setImages([...images, ...acceptedFiles]);
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (layoutDatas) {
        // Remove unwanted fields
        const cleanedContainer = removeUnwantedFields(layoutDatas);

        // Transform items to only include itemType and itemId
        // const transformedItems = elementsDatas.items?.map(item => ({
        //     itemType: item.itemType,
        //     itemId: item.itemId?._id,
        // }));

        // Transform availability to only include appId as a string
        // const transformedAppId = elementsDatas.availability?.map(avail => ({
        //     appId: avail.appId?._id,
        // }));

        const appId = layoutDatas?.appId?._id;

        // Set the transformed data
        setLayoutData({
          appId: appId,
          font: cleanedContainer.font,
          logos: cleanedContainer.logos,
          fontSize:cleanedContainer.fontSize
        });
    }
    setLoading(false);
}, [layoutDatas]);


  // Extract existing appIds from colorDatas
const existingAppIds = colorData?.colorSchemes?.map(data => data.appId._id).filter(id => id !== layoutDatas.appId._id);

// Filter out app options that already exist in colorDatas
const filteredAppOptions = appData?.apps?.filter(app => !existingAppIds?.includes(app._id))?.map(app => ({
  value: app._id,
  label: app.title
}));

const handleFontChange = (index, key, value) => {
  const updatedFonts = [...layoutData.font];
  updatedFonts[index] = { ...updatedFonts[index], [key]: value };
  setLayoutData({ ...layoutData, font: updatedFonts });
};

const addFont = () => {
  setLayoutData({
    ...layoutData,
    font: [
      ...(layoutData?.font || []), // Fallback to an empty array if layoutData.font is undefined
      {
        fontFamily: "",
        subset: "latin",
        weights: [],
        styles: [],
        type: "",
        lanCode: "",
      },
    ],
  });
};


const removeFont = (index) => {
  const updatedFonts = layoutData.font.filter((_, i) => i !== index);
  setLayoutData({ ...layoutData, font: updatedFonts });
};


  const handleSettingChange = (section, key, value) => {
    const updatedData = { ...layoutData };
    updatedData[section][key] = value;
    setLayoutData(updatedData);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
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
      setUploadedImages(prev => [
        ...prev,
        { 
          type: "dark",
          imageUrl: signedUrl.split("?")[0]// Extract the base URL
        }
      ]);

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('An error occurred while uploading the image. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      appId: layoutData.appId._id || layoutData.appId,
      font: layoutData.font,
      logos: uploadedImages, // Append uploaded images to logos
      fontSize: layoutData.fontSize
    };

    saveLayout(payload, {
      onSuccess: () => {
        toast.success('Layout saved successfully!');
        navigate('/layout');
      },
      onError: (error) => {
        toast.error('Failed to save layout.');
        console.error(error);
      }
    });
  };

  if (loading || isLoading) {
    return <LoadingScreen />;
  }

  console.log(layoutData);
  console.log("layoutDatas",layoutDatas);
  console.log("images",images);
  console.log(uploadedImages);

  return (
    <div>
      <form onSubmit={handleSubmit}>
          {/* App ID Dropdown */}
            <div className="mb-4">
              <label className="block w-full mb-2 text-text-color primary-text">App ID *</label>
              <Select
            options={filteredAppOptions}
            value={filteredAppOptions?.find(option => option.value === layoutData?.appId) || null}
            onChange={(selectedOption) => {
              setLayoutData(prevState => ({
                ...prevState,
                appId: selectedOption.value
              }));
              setChangeAppId(true);
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


        {/* Logo upload section */}
        <div className="w-full p-4">
          <label className="block w-full mb-2 text-text-color primary-text">Logos</label>
          <div {...getRootProps({ className: 'dropzone' })} className="w-full p-4 bg-secondary-card text-text-color border-2 border-border rounded mb-4">
            <input {...getInputProps()} />
            <p className='text-text-color'>Drag & drop images here, or click to select files</p>
            <div className="w-full p-4">
              {images?.map((file, index) => (
                <div key={index} className="flex items-center justify-between mb-2">
                  {/* Image preview */}
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
                      e.stopPropagation(); // Prevent the event from bubbling up
                      e.preventDefault();
                      handleUploadImages(index); // Upload only this image
                    }}
                  >
                    Upload
                  </button>
                  <button
                  type="button"
                    className="ml-2 text-red-500"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the event from bubbling up
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


 {/* Font Settings */}
 <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <label className="block w-full mb-2 text-text-color primary-text">Font Settings</label>
            <button
              type="button"
              className="bg-secondary-card text-text-color px-4 py-2 rounded"
              onClick={addFont}
            >
              Add
            </button>
          </div>

          <div className="notes-container p-4 bg-secondary-card rounded-lg">
            {layoutData?.font?.length === 0 && <p className='text-text-color'>No fonts added</p>}
            {layoutData?.font?.map((font, index) => (
              <div key={index} className="mb-4">
                <div className="flex flex-wrap">
                <div className="w-full sm:w-1/2 p-4">
                <label className="block mb-2 text-text-color">Font Family</label>
                  <input
                    type="text"
                    className="block w-full h-10 px-2 py-1 mb-2 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color mr-2"
                    placeholder="Font Family"
                    value={font.fontFamily}
                    onChange={(e) =>
                      handleFontChange(index, "fontFamily", e.target.value)
                    }
                  />
                </div>
                
                <div className="w-full sm:w-1/2 p-4">
                <label className="block mb-2 text-text-color">Subset</label>
                  <input
                    type="text"
                    className="block w-full h-10 px-2 py-1 mb-2 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color mr-2"
                    placeholder="Subset"
                    value={font.subset}
                    onChange={(e) =>
                      handleFontChange(index, "subset", e.target.value)
                    }
                  />
                </div>
                <div className="w-full sm:w-1/2 p-4">
                <label className="block mb-2 text-text-color">Font Weight</label>
                  <Select
                    isMulti
                    options={[
                      { value: "100", label: "Thin" },
                      { value: "200", label: "Extra Light" },
                      { value: "300", label: "Light" },
                      { value: "400", label: "Regular" },
                      { value: "500", label: "Medium" },
                      { value: "600", label: "Semi Bold" },
                      { value: "700", label: "Bold" },
                      { value: "800", label: "Extra Bold" },
                      { value: "900", label: "Black" },
                    ]}
                    value={font.weights.map((weight) => ({
                      value: weight,
                      label: getWeightLabel(weight),
                    }))}
                    onChange={(selectedOptions) =>
                      handleFontChange(
                        index,
                        "weights",
                        selectedOptions.map((option) => option.value)
                      )
                    }
                    className="w-full mr-2"
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
                
                <div className="w-full sm:w-1/2 p-4">
                <label className="block mb-2 text-text-color">Font Style</label>
                  <Select
                    isMulti
                    options={[
                      { value: "normal", label: "Normal" },
                      { value: "italic", label: "Italic" },
                    ]}
                    value={font.styles.map((style) => ({
                      value: style,
                      label: style,
                    }))}
                    onChange={(selectedOptions) =>
                      handleFontChange(
                        index,
                        "styles",
                        selectedOptions.map((option) => option.value)
                      )
                    }
                    className="w-full mr-2"
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
                <div className="flex flex-wrap mt-2">
                  
                <div className="w-full sm:w-1/2 p-4">
                <label className="block mb-2 text-text-color">Language</label>
                  <input
                    type="text"
                    className="block w-full h-10 px-2 py-1 mb-2 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white transition text-text-color mr-2"
                    placeholder="Language Code"
                    value={font.lanCode}
                    onChange={(e) =>
                      handleFontChange(index, "lanCode", e.target.value)
                    }
                  />
                </div>
                <div className="w-full sm:w-1/2 p-4">
  <label className="block mb-2 text-text-color">Select Type</label>
  <Select
    options={[
      { value: "body", label: "Body" },
      { value: "header", label: "Header" },
      { value: "small", label: "Small" },
    ]}
    value={
      font.type
        ? { value: font.type, label: font.type.charAt(0).toUpperCase() + font.type.slice(1) }
        : null
    }
    onChange={(selectedOption) =>
      handleFontChange(index, "type", selectedOption?.value || "")
    }
    className="w-full"
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
                <div className="flex flex-wrap justify-end p-4">
                  <button
                    type="button"
                    className="bg-secondary-card text-text-color px-4 py-2 rounded "
                    onClick={() => removeFont(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>



       {/* Font Size Settings */}
<div className="p-4">
  <label className="block w-full mb-2 text-text-color primary-text">Font Size</label>
  <div className="notes-container p-4 bg-secondary-card rounded-lg">
    <div className="flex flex-wrap">
      {['base', 'xs', 'sm', 'md', 'lg'].map((size) => (
        <div key={size} className="w-full sm:w-1/2 p-4">
          <div className="mb-4 flex items-center">
            <input
              type="text"
              className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
              placeholder={`Enter ${size} size`}
              value={layoutData?.fontSize?.[size] || ''} // Use optional chaining and fallback to an empty string
              onChange={(e) => handleSettingChange('fontSize', size, e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded">
            Submit
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default LayoutForm;
