import React, { useState, useEffect } from 'react';
import { usePostData, usePutData, useGetData } from '../../common/api';
import { ToastContainer, toast } from 'react-toastify';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate } from 'react-router';
import Select from 'react-select';
import { colorDefault } from '../../constant';

function ColorForm({ colorDatas, data }) {
  const navigate = useNavigate();
  
  const [colorData, setColorData] = useState(colorDatas ? colorDatas : colorDefault);
  const [loading, setLoading] = useState(true);
  const [changeAppId, setChangeAppId] = useState(false);

  const mutationHook = colorDatas ? usePutData : usePostData;
  const api_url = colorDatas ? `/colors/update/${colorDatas._id}` : '/colors/add';
  const api_key = colorDatas ? 'updateColor' : 'addColor';
  const { mutate: saveApp, isLoading, isError } = mutationHook(api_key, api_url);

  // Fetch app data
  const { data: appData, isLoading: isAppLoading } = useGetData("data", "/app", {});

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e, section, field) => {
    setColorData(prevState => ({
      ...prevState,
      theme: {
        ...prevState.theme,
        palette: {
          ...prevState.theme.palette,
          [section]: {
            ...prevState.theme.palette[section],
            [field]: e.target.value
          }
        }
      }
    }));
  };

  const handleColorPickerChange = (color, section, field) => {
    setColorData(prevState => ({
      ...prevState,
      theme: {
        ...prevState.theme,
        palette: {
          ...prevState.theme.palette,
          [section]: {
            ...prevState.theme.palette[section],
            [field]: color
          }
        }
      }
    }));
  };

// Extract existing appIds from colorDatas
const existingAppIds = data?.colorSchemes?.map(data => data.appId._id).filter(id => id !== colorDatas.appId._id);

// Filter out app options that already exist in colorDatas
const filteredAppOptions = appData?.apps?.filter(app => !existingAppIds?.includes(app._id)).map(app => ({
  value: app._id,
  label: app.title
}));


  const handleSubmit = (e) => {
    e.preventDefault();

  const { _id, __v, ...cleanedData } = colorData;

  const payload = colorDatas ? {
    ...cleanedData,
    appId: changeAppId ? colorData.appId : colorData.appId._id,
  }: {
    ...colorData,
  }

    // Save the cleaned-up data
    saveApp(payload, {
      onSuccess: () => {
        toast.success('Color saved successfully');
        navigate('/store/color/list');
      },
      onError: () => {
        toast.error('Error saving color');
      }
    });
  };
  

  if (loading || isAppLoading) {
    return <LoadingScreen />;
  }

  const appOptions = appData?.apps.map(app => ({
    value: app._id,
    label: app.title
  }));

  const modeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ];


  return (
    <div>
      <form onSubmit={handleSubmit}>

      <div className="flex flex-wrap">
        {/* App ID Dropdown */}
        <div className="w-full sm:w-1/2 p-4">
          <div className="mb-4">
            <label className="block w-full mb-2 text-text-color primary-text">App ID *</label>
            <Select
            options={filteredAppOptions}
            value={filteredAppOptions?.find(option => option.value === (colorDatas ? changeAppId ? colorData.appId : colorData.appId._id : colorData.appId)) || null}
            onChange={(selectedOption) => {
              setColorData(prevState => ({
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
        </div>

        {/* Mode Dropdown */}
        <div className="w-full sm:w-1/2 p-4">
          <div className="mb-4">
            <label className="block w-full mb-2 text-text-color primary-text">Mode *</label>
            <Select
              options={modeOptions}
              value={modeOptions?.find(option => option.value === colorData.mode) || null}
              onChange={(selectedOption) => {
                setColorData(prevState => ({
                  ...prevState,
                  mode: selectedOption.value
                }));
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
        </div>

         {/* Palette fields with Color Pickers */}
            {['primary', 'secondary', 'error', 'warning', 'info', 'success', 'text', 'background', 'action'].map((section) => (
                <div key={section} className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <label className="block w-full mb-2 text-text-color capitalize">{section}</label>
                </div>
                <div className="notes-container p-4 bg-secondary-card rounded-lg">
                    <div className="flex flex-wrap">
                    {/* Check if section is 'action' to render different fields */}
                    {section === 'action' ? (
                        ['active', 'hover', 'selected', 'disabled', 'disabledBackground', 'focus'].map((field) => (
                        <div key={field} className="w-full sm:w-1/2 p-4">
                            <div className="mb-4 flex items-center">
                            <div className="w-[95%]">
                                <label className="float-left inline-block mb-2 text-text-color capitalize">{field}</label>
                                <input
                                type="text"
                                name={field}
                                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                                placeholder={`Enter ${section} ${field}`}
                                value={colorData.theme.palette[section][field]}
                                onChange={(e) => handleChange(e, section, field)}
                                />
                            </div>
                            <div className="w-[5%] ml-2 mt-8">
                                <input
                                type="color"
                                value={colorData.theme.palette[section][field]}
                                onChange={(e) => handleColorPickerChange(e.target.value, section, field)}
                                className="w-full h-10 border-none"
                                style={{ backgroundColor: 'rgb(156 163 175 / var(--tw-border-opacity))', borderRadius: '4px' }}
                                />
                            </div>
                            </div>
                        </div>
                        ))
                    ) : section === 'text' ? (['primary', 'secondary', 'disabled'].map((field) => (
                        <div key={field} className="w-full sm:w-1/2 p-4">
                          <div className="mb-4 flex items-center">
                            <div className="w-[95%]">
                              <label className="float-left inline-block mb-2 text-text-color capitalize">{field}</label>
                              <input
                                type="text"
                                name={field}
                                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                                placeholder={`Enter text ${field}`}
                                value={colorData.theme.palette.text[field]}
                                onChange={(e) => handleChange(e, 'text', field)}
                              />
                            </div>
                            <div className="w-[5%] ml-2 mt-8">
                              <input
                                type="color"
                                value={colorData.theme.palette.text[field]}
                                onChange={(e) => handleColorPickerChange(e.target.value, 'text', field)}
                                className="w-full h-10 border-none"
                                style={{ backgroundColor: 'rgb(156 163 175 / var(--tw-border-opacity))', borderRadius: '4px' }}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                      ) : section === 'background' ? (['default', 'paper'].map((field) => (
                        <div key={field} className="w-full sm:w-1/2 p-4">
                          <div className="mb-4 flex items-center">
                            <div className="w-[95%]">
                              <label className="float-left inline-block mb-2 text-text-color capitalize">{field}</label>
                              <input
                                type="text"
                                name={field}
                                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                                placeholder={`Enter background ${field}`}
                                value={colorData.theme.palette.background[field]}
                                onChange={(e) => handleChange(e, 'background', field)}
                              />
                            </div>
                            <div className="w-[5%] ml-2 mt-8">
                              <input
                                type="color"
                                value={colorData.theme.palette.background[field]}
                                onChange={(e) => handleColorPickerChange(e.target.value, 'background', field)}
                                className="w-full h-10 border-none"
                                style={{ backgroundColor: 'rgb(156 163 175 / var(--tw-border-opacity))', borderRadius: '4px' }}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                      ) : (
                        ['light', 'main', 'dark', 'contrastText'].map((field) => (
                        <div key={field} className="w-full sm:w-1/2 p-4">
                            <div className="mb-4 flex items-center">
                            <div className="w-[95%]">
                                <label className="float-left inline-block mb-2 text-text-color capitalize">{field}</label>
                                <input
                                type="text"
                                name={field}
                                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                                placeholder={`Enter ${section} ${field}`}
                                value={colorData.theme.palette[section][field]}
                                onChange={(e) => handleChange(e, section, field)}
                                />
                            </div>
                            <div className="w-[5%] ml-2 mt-8">
                                <input
                                type="color"
                                value={colorData.theme.palette[section][field]}
                                onChange={(e) => handleColorPickerChange(e.target.value, section, field)}
                                className="w-full h-10 border-none"
                                style={{ backgroundColor: 'rgb(156 163 175 / var(--tw-border-opacity))', borderRadius: '4px' }}
                                />
                            </div>
                            </div>
                        </div>
                        ))
                    )}
                    </div>
                </div>
                </div>
            ))}


        {/* Divider color */}
        <div className="p-4">
          <label className="block mb-2 text-text-color">Divider</label>
          <div className="flex items-center">
            <div className="w-[97%]">
              <input
                type="text"
                name="divider"
                className="block w-full h-10 px-2 py-1 border-b border-border secondary-card rounded-none focus:outline-none focus:border-white-500 transition text-text-color"
                placeholder="Enter divider color"
                value={colorData.theme.palette.divider}
                onChange={(e) => setColorData({
                  ...colorData,
                  theme: {
                    ...colorData.theme,
                    palette: {
                      ...colorData.theme.palette,
                      divider: e.target.value
                    }
                  }
                })}
              />
            </div>
            <div className="w-[3%] ml-2" >
  <input
    type="color"
    value={colorData.theme.palette.divider}
    onChange={(e) => setColorData({
      ...colorData,
      theme: {
        ...colorData.theme,
        palette: {
          ...colorData.theme.palette,
          divider: e.target.value
        }
      }
    })}
    className="w-full h-10 border-none"
    style={{ backgroundColor: 'rgb(156 163 175 / var(--tw-border-opacity))', borderRadius: '4px' }}
  />
</div>


          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-wrap justify-end p-4">
          <button type="submit" className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded">Submit</button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default ColorForm;