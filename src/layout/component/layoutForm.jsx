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
  const [layoutData, setLayoutData] = useState(layoutDatas ? layoutDatas : layoutDefault);
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

  // Extract existing appIds from colorDatas
const existingAppIds = colorData?.colorSchemes?.map(data => data.appId._id).filter(id => id !== layoutDatas.appId._id);

// Filter out app options that already exist in colorDatas
const filteredAppOptions = appData?.apps?.filter(app => !existingAppIds?.includes(app._id)).map(app => ({
  value: app._id,
  label: app.title
}));

  const handleSettingsChange = (section, key, value) => {
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
          url: signedUrl.split("?")[0], // Extract the base URL
          altText: image.name
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
      _id: layoutData._id,
      appId: layoutData.appId._id || layoutData.appId,
      font: layoutData.font,
      logos: layoutData.logos.concat(uploadedImages), // Append uploaded images to logos
      fontSize: layoutData.fontSize
    };

    saveLayout(payload, {
      onSuccess: () => {
        toast.success('Layout saved successfully!');
        navigate('/layouts');
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

  return (
    <div>
      <form onSubmit={handleSubmit}>
          {/* App ID Dropdown */}
            <div className="mb-4">
              <label className="block w-full mb-2 text-white">App ID *</label>
              <Select
            options={filteredAppOptions}
            value={filteredAppOptions?.find(option => option.value === (layoutDatas ? changeAppId ? (layoutData?.appId) : (layoutData?.appId?._id) : (layoutData?.appId))) || null}
            onChange={(selectedOption) => {
              setLayoutData(prevState => ({
                ...prevState,
                appId: selectedOption.value
              }));
              setChangeAppId(true);
            }}
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
                color: 'white'
              }),
              singleValue: (provided) => ({
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
                cursor: 'pointer'
              })
            }}
          />
            </div>


        {/* Logo upload section */}
        <div className="w-full p-4">
          <label className="block w-full mb-2 text-white">Logos</label>
          <div {...getRootProps({ className: 'dropzone' })} className="w-full p-4 bg-sidebar-card-top text-white border-2 border-nexa-gray rounded mb-4">
            <input {...getInputProps()} />
            <p>Drag & drop images here, or click to select files</p>
            <div className="w-full p-4">
              {images.map((file, index) => (
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
  <label className="block w-full mb-2 text-white">Font Settings</label>

  <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
    <div className="flex flex-wrap">
      <div className="w-full sm:w-1/2 p-4">
        <div className="mb-4">
          <input
            type="text"
            className="block w-full h-10 px-2 py-1 mb-2 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
            placeholder="Enter font family"
            value={layoutData.font.fontFamily}
            onChange={(e) => handleSettingsChange('font', 'fontFamily', e.target.value)}
          />
        </div>
      </div>
      <div className="w-full sm:w-1/2 p-4">
        <div className="mb-4">
          <input
            type="text"
            className="block w-full h-10 px-2 py-1 mb-2 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
            placeholder="Enter subset"
            value={layoutData.font.subset}
            onChange={(e) => handleSettingsChange('font', 'subset', e.target.value)}
          />
        </div>
      </div>
    </div>

    {/* Dropdown for Weights */}
    <div className="flex flex-wrap">
      <div className="w-full sm:w-1/2 p-4">
        <div className="mb-4">
          <label className="block mb-2 text-white">Select Weights</label>
          <Select
            isMulti
            options={[
              { value: '100', label: '100 (Thin)' },
              { value: '200', label: '200 (Extra Light)' },
              { value: '300', label: '300 (Light)' },
              { value: '400', label: '400 (Regular)' },
              { value: '500', label: '500 (Medium)' },
              { value: '600', label: '600 (Semi Bold)' },
              { value: '700', label: '700 (Bold)' },
              { value: '800', label: '800 (Extra Bold)' },
              { value: '900', label: '900 (Black)' }
            ]}
            value={layoutData.font.weights.map(weight => ({
              value: weight,
              label: `${weight} (${getWeightLabel(weight)})`
            }))}
            onChange={(selectedOptions) =>
              handleSettingsChange('font', 'weights', selectedOptions.map(option => option.value))
            }
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

      {/* Dropdown for Styles */}
      <div className="w-full sm:w-1/2 p-4">
        <div className="mb-4">
          <label className="block mb-2 text-white">Select Styles</label>
          <Select
            isMulti
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'italic', label: 'Italic' }
            ]}
            value={layoutData.font.styles.map(style => ({
              value: style,
              label: style
            }))}
            onChange={(selectedOptions) =>
              handleSettingsChange('font', 'styles', selectedOptions.map(option => option.value))
            }
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
    </div>

    <div className="flex flex-wrap">
      <div className="w-full sm:w-1/2 p-4">
        <div className="mb-4">
          <input
            type="text"
            className="block w-full h-10 px-2 py-1 mb-2 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
            placeholder="Enter lanCode"
            value={layoutData.font.lanCode}
            onChange={(e) => handleSettingsChange('font', 'lanCode', e.target.value)}
          />
        </div>
      </div>
      <div className="w-full sm:w-1/2 p-4">
        <div className="mb-4">
          <input
            type="text"
            className="block w-full h-10 px-2 py-1 mb-2 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
            placeholder="Enter type"
            value={layoutData.font.type}
            onChange={(e) => handleSettingsChange('font', 'type', e.target.value)}
          />
        </div>
      </div>
    </div>
  </div>
</div>


        {/* Font Size Settings */}
        <div className="p-4">
          <label className="block w-full mb-2 text-white">Font Size</label>
          <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
                    <div className="flex flex-wrap">
          {Object.keys(layoutData.fontSize).map((size) => (
            <div key={size} className="w-full sm:w-1/2 p-4">
                            <div className="mb-4 flex items-center">
            <input
              key={size}
              type="text"
              className="block w-full h-10 px-2 py-1 border-b border-nexa-gray bg-black rounded-none focus:outline-none focus:border-white-500 transition text-white"
              placeholder={`Enter ${size} size`}
              value={layoutData.fontSize[size]}
              onChange={(e) => handleSettingsChange('fontSize', size, e.target.value)}
            />
            </div>
            </div>
          ))}
          </div>
        </div>
        </div>

        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-nexa-orange text-white px-6 py-2 rounded">
            Submit
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default LayoutForm;
