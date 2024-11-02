import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Select from 'react-select';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate, useParams } from 'react-router';
import { ToastContainer, toast } from 'react-toastify';


function SortableItem({ id, index, handleRemove, item }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex mb-2 items-center">
      <input
        type="text"
        className="block w-full px-3 py-2 text-white bg-black border rounded"
        value={item.elements}
        disabled
      />
      <button type="button" className="bg-red-500 text-white px-4 py-2 rounded ml-2" onClick={() => handleRemove(index)}>
        Remove
      </button>
    </div>
  );
}

function ContainerForm({ container }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [elementsData, setElementsData] = useState({
    referenceName: '',
    description: '',
    layoutOptions: {
    layout: "tab",
    gridOptions: {
      spacing: 2,
      direction: "row",
      justifyContent: "flex-start",
      alignItems: "stretch",
      wrap: "wrap",
      columns: 1,
      sizeData: [
        {
          column: 0,
          size: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12,
            xl: 12
          }
        }
      ],
      defaultSize: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12
      }
    },
    stackOptions: {
      spacing: 2,
      direction: "column",
      justifyContent: "flex-start",
      alignItems: "stretch",
      divider: {}
    },
    tabOptions: {
      orientation: "horizontal",
      variant: "standard",
      centered: false,
      indicatorColor: "primary",
      textColor: "primary"
    },
    fluidOptions: {
      gutter: 16,
      justify: "start"
    }
  },
    items: [],
    style: {
      backgroundColor: '',
      textColor: '',
      textMutedColor: '',
      headerFontFamily: '',
      textFontFamily: '',
      headerFontSize: '',
      textFontSize: '',
      borderRadius: '',
      padding: '',
      customCSS: '',
    },
    available: [],
    draft: false,
    publish: false,
  });

  
  const mutationHook = container | elementsData.draft ? usePutData : usePostData;
  const api_url = container | elementsData.draft ? `/containers/${container?._id}` : '/containers';
  const api_key = container | elementsData.draft ? 'updateContainer' : 'addContainer';
  
  // Call the mutation hook at the top level
  const { mutate: handleApiMutation } = mutationHook(api_key, api_url, elementsData);
  const { data: elementData, isLoading: isElementLoading } = useGetData("elementdata", "/elements", {});
  const { data: appData, isLoading: isAppLoading } = useGetData("appdata", "/app", {});

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
    if (container) {
      const cleanedContainer = removeUnwantedFields(container);
      setElementsData({
        referenceName: cleanedContainer.referenceName || '',
        description: cleanedContainer.description || '',
        layoutOptions: cleanedContainer.layoutOptions || {},
        items: cleanedContainer.items || [],
        style: cleanedContainer.style || {},
        available: cleanedContainer.available || [],
        draft: cleanedContainer.draft || false,
        publish: cleanedContainer.publish || false,
      });
    }
    setLoading(false);
  }, [container]);

  const handleInputChange = (field, value) => {
    setElementsData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSettingsChange = (section, sub, field, value) => {
    setElementsData((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        ...(sub
          ? {
              [sub]: {
                ...prevState[section][sub],
                [field]: value,
              },
            }
          : {
              [field]: value,
            }),
      },
    }));
  };

  const handleColorPickerChange = (value, field) => {
    handleSettingsChange('style', null, field, value);
  };

  const handleAddItem = (selectedOption) => {
    if (selectedOption) {
      setElementsData((prevState) => ({
        ...prevState,
        items: [...prevState.items, { elements: selectedOption.value }],
      }));
    }
  };

  const handleRemoveItem = (index) => {
    setElementsData((prevState) => ({
      ...prevState,
      items: prevState.items.filter((_, i) => i !== index),
    }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setElementsData((prevState) => ({
        ...prevState,
        items: arrayMove(prevState.items, active.id, over.id),
      }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      handleApiMutation({elementsData, draft: true, publish: false }, {
        onSuccess: () => {
          navigate('/containers');
        },
        onError: (error) => {
          console.error('Error submitting form:', error);
        },
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftSubmit = async () => {
    const cleanedContainer = removeUnwantedFields(elementsData);
    try {
      handleApiMutation({ ...cleanedContainer, draft: true, publish: false }, {
        onSuccess: (response) => {
          setElementsData(response.data);
          toast.success('Saved as draft!');
        },
        onError: (error) => {
          console.error('Error submitting form:', error);
        },
      });
    } catch (error) {
      toast.error('Failed to save draft.');
      console.error(error);
    }
  };

  const handlePublishSubmit = async () => {
    try {
      handleApiMutation({ ...elementsData, draft: true, publish: true }, {
        onSuccess: (response) => {
          setElementsData(response.data);
          toast.success('Published successfully!');
        },
        onError: (error) => {
          console.error('Error submitting form:', error);
        },
      });
    } catch (error) {
      toast.error('Failed to publish.');
      console.error(error);
    }
  };

  const renderSubmitButtons = () => {
    if (elementsData.draft && !elementsData.publish) {
      return (
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={handleDraftSubmit} className="bg-orange-500 text-white px-6 py-2 rounded-md">
            Redraft
          </button>
          <button type="button" onClick={handlePublishSubmit} className="bg-green-500 text-white px-6 py-2 rounded-md">
            Publish
          </button>
        </div>
      );
    } else if (elementsData.draft && elementsData.publish) {
      return (
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={handleDraftSubmit} className="bg-orange-500 text-white px-6 py-2 rounded-md">
            Redraft
          </button>
          <button type="button" onClick={handlePublishSubmit} className="bg-green-500 text-white px-6 py-2 rounded-md">
            Republish
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex justify-end">
          <button type="button" onClick={handleDraftSubmit} className="bg-orange-500 text-white px-6 py-2 rounded-md">
            Draft
          </button>
        </div>
      );
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  console.log(elementsData);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          {/* Reference Name */}
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-white">Reference Name</label>
              <input
                type="text"
                value={elementsData.referenceName}
                onChange={(e) => handleInputChange('referenceName', e.target.value)}
                className="block w-full px-3 py-2 text-white bg-black border rounded"
              />
            </div>
          </div>

          {/* Description */}
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-white">Description</label>
              <textarea
                value={elementsData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="block w-full px-3 py-2 text-white bg-black border rounded"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
  <label className="block w-full mb-2 text-white">Available Apps</label>
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
        available: selectedAppObjects,
      }));
    }}
    value={elementsData.available.map((item) => ({
      value: item.appId,
      label: appData?.apps?.find((app) => app._id === item.appId)?.title || item.appId,
    }))}
    isLoading={isAppLoading}
    styles={{
      control: (provided, state) => ({
        ...provided,
        backgroundColor: 'black',
        borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
        borderBottomWidth: '2px',
        borderRadius: '0px',
        height: '40px', // h-10: 2.5rem = 40px
        paddingLeft: '8px', // px-2: 0.5rem = 8px
        paddingRight: '8px', // px-2: 0.5rem = 8px
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
        backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
        color: state.isSelected ? 'black' : 'white',
        cursor: 'pointer',
      }),
    }}
  />
</div>



        {/* Layout Options */}
<div className="p-4">
  <label className="block w-full mb-2 text-white">Layout Settings</label>
  <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
    <div className="flex flex-wrap">
      <div className="w-full sm:w-1/2 p-4">
        <label className="block mb-2 text-white">Select Layout</label>
        <Select
          options={[
            { value: 'tab', label: 'Tab' },
            { value: 'normal', label: 'Normal' },
            { value: 'fluid', label: 'Fluid' },
            { value: 'grid', label: 'Grid' },
            { value: 'stack', label: 'Stack' },
          ]}
          value={{
            value: elementsData.layoutOptions.layout,
            label: elementsData.layoutOptions.layout.charAt(0).toUpperCase() + elementsData.layoutOptions.layout.slice(1),
          }}
          onChange={(selectedOption) => handleSettingsChange('layoutOptions',null, 'layout', selectedOption.value)}
          styles={{
            control: (provided, state) => ({
              ...provided,
              backgroundColor: 'black',
              borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
              borderBottomWidth: '2px',
              borderRadius: '0px',
              height: '40px', // h-10: 2.5rem = 40px
              paddingLeft: '8px', // px-2: 0.5rem = 8px
              paddingRight: '8px', // px-2: 0.5rem = 8px
              color: 'white'
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
              backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
              color: state.isSelected ? 'black' : 'white',
              cursor: 'pointer'
            })
          }}
        />
      </div>
    </div>

    {/* Grid Layout Options */}
    {elementsData.layoutOptions.layout === 'grid' && (
      <div className="grid-options">
        <label className="block mb-2 text-white">Grid Options</label>

        {/* Spacing */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Spacing</label>
          <input
            type="number"
            value={elementsData.layoutOptions.gridOptions?.spacing}
            onChange={(e) => handleSettingsChange('layoutOptions','gridOptions','spacing', e.target.value)}
            className="block w-full px-3 py-2 text-white bg-black border rounded"
          />
        </div>

        {/* Direction */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Direction</label>
          <Select
            options={[
              { value: 'row', label: 'Row' },
              { value: 'column', label: 'Column' },
              { value: 'row-reverse', label: 'Row Reverse' },
              { value: 'column-reverse', label: 'Column Reverse' },
            ]}
            value={{ value: elementsData.layoutOptions.gridOptions?.direction || 'row', label: elementsData.layoutOptions.gridOptions?.direction}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'gridOptions', 'direction', selectedOption.value)}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px', // h-10: 2.5rem = 40px
                paddingLeft: '8px', // px-2: 0.5rem = 8px
                paddingRight: '8px', // px-2: 0.5rem = 8px
                color: 'white'
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
                backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                color: state.isSelected ? 'black' : 'white',
                cursor: 'pointer'
              })
            }}
          />
        </div>

        {/* Justify Content */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Justify Content</label>
          <Select
            options={[
              { value: 'flex-start', label: 'Flex Start' },
              { value: 'center', label: 'Center' },
              { value: 'flex-end', label: 'Flex End' },
              { value: 'space-between', label: 'Space Between' },
              { value: 'space-around', label: 'Space Around' },
              { value: 'space-evenly', label: 'Space Evenly' },
            ]}
            value={{ value: elementsData.layoutOptions.gridOptions?.justifyContent || 'flex-start', label: elementsData.layoutOptions.gridOptions?.justifyContent}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'gridOptions', 'justifyContent', selectedOption.value)}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px', // h-10: 2.5rem = 40px
                paddingLeft: '8px', // px-2: 0.5rem = 8px
                paddingRight: '8px', // px-2: 0.5rem = 8px
                color: 'white'
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
                backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                color: state.isSelected ? 'black' : 'white',
                cursor: 'pointer'
              })
            }}
          />
        </div>

        {/* Align Items */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Align Items</label>
          <Select
            options={[
              { value: 'stretch', label: 'Stretch' },
              { value: 'flex-start', label: 'Flex Start' },
              { value: 'center', label: 'Center' },
              { value: 'flex-end', label: 'Flex End' },
              { value: 'baseline', label: 'Baseline' },
            ]}
            value={{ value: elementsData.layoutOptions.gridOptions?.alignItems || 'stretch', label: elementsData.layoutOptions.gridOptions?.alignItems}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'gridOptions', 'alignItems', selectedOption.value)}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px', // h-10: 2.5rem = 40px
                paddingLeft: '8px', // px-2: 0.5rem = 8px
                paddingRight: '8px', // px-2: 0.5rem = 8px
                color: 'white'
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
                backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                color: state.isSelected ? 'black' : 'white',
                cursor: 'pointer'
              })
            }}
          />
        </div>

        {/* Wrap */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Wrap</label>
          <Select
            options={[
              { value: 'nowrap', label: 'No Wrap' },
              { value: 'wrap', label: 'Wrap' },
              { value: 'wrap-reverse', label: 'Wrap Reverse' },
            ]}
            value={{ value: elementsData.layoutOptions.gridOptions?.wrap || 'wrap', label: elementsData.layoutOptions.gridOptions?.wrap}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'gridOptions' , 'wrap', selectedOption.value)}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px', // h-10: 2.5rem = 40px
                paddingLeft: '8px', // px-2: 0.5rem = 8px
                paddingRight: '8px', // px-2: 0.5rem = 8px
                color: 'white'
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
                backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                color: state.isSelected ? 'black' : 'white',
                cursor: 'pointer'
              })
            }}
          />
        </div>

        {/* Columns */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Columns</label>
          <input
            type="number"
            value={elementsData.layoutOptions.gridOptions?.columns}
            onChange={(e) => handleSettingsChange('layoutOptions', 'gridOptions', 'columns', e.target.value)}
            className="block w-full px-3 py-2 text-white bg-black border rounded"
          />
        </div>
      </div>
    )}

    {/* Stack Layout Options */}
    {elementsData.layoutOptions.layout === 'stack' && (
      <div className="stack-options">
        <label className="block mb-2 text-white">Stack Options</label>

        {/* Spacing */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Spacing</label>
          <input
            type="number"
            value={elementsData.layoutOptions.stackOptions?.spacing}
            onChange={(e) => handleSettingsChange('layoutOptions', 'stackOptions', 'spacing', e.target.value)}
            className="block w-full px-3 py-2 text-white bg-black border rounded"
          />
        </div>

        {/* Direction */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Direction</label>
          <Select
            options={[
              { value: 'column', label: 'Column' },
              { value: 'row', label: 'Row' },
              { value: 'row-reverse', label: 'Row Reverse' },
              { value: 'column-reverse', label: 'Column Reverse' },
            ]}
            value={{ value: elementsData.layoutOptions.stackOptions?.direction || 'column', label: elementsData.layoutOptions.stackOptions?.direction}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'stackOptions', 'direction', selectedOption.value)}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px', // h-10: 2.5rem = 40px
                paddingLeft: '8px', // px-2: 0.5rem = 8px
                paddingRight: '8px', // px-2: 0.5rem = 8px
                color: 'white'
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
                backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                color: state.isSelected ? 'black' : 'white',
                cursor: 'pointer'
              })
            }}
          />
        </div>

        {/* Justify Content */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Justify Content</label>
          <Select
            options={[
              { value: 'flex-start', label: 'Flex Start' },
              { value: 'center', label: 'Center' },
              { value: 'flex-end', label: 'Flex End' },
              { value: 'space-between', label: 'Space Between' },
              { value: 'space-around', label: 'Space Around' },
              { value: 'space-evenly', label: 'Space Evenly' },
            ]}
            value={{ value: elementsData.layoutOptions.stackOptions?.justifyContent || 'flex-start', label: elementsData.layoutOptions.stackOptions?.justifyContent}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'stackOptions', 'justifyContent', selectedOption.value)}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px', // h-10: 2.5rem = 40px
                paddingLeft: '8px', // px-2: 0.5rem = 8px
                paddingRight: '8px', // px-2: 0.5rem = 8px
                color: 'white'
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
                backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                color: state.isSelected ? 'black' : 'white',
                cursor: 'pointer'
              })
            }}
          />
        </div>

        {/* Align Items */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Align Items</label>
          <Select
            options={[
              { value: 'stretch', label: 'Stretch' },
              { value: 'flex-start', label: 'Flex Start' },
              { value: 'center', label: 'Center' },
              { value: 'flex-end', label: 'Flex End' },
              { value: 'baseline', label: 'Baseline' },
            ]}
            value={{ value: elementsData.layoutOptions.stackOptions?.alignItems || 'stretch', label: elementsData.layoutOptions.stackOptions?.alignItems}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'stackOptions', 'alignItems', selectedOption.value)}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px', // h-10: 2.5rem = 40px
                paddingLeft: '8px', // px-2: 0.5rem = 8px
                paddingRight: '8px', // px-2: 0.5rem = 8px
                color: 'white'
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
                backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                color: state.isSelected ? 'black' : 'white',
                cursor: 'pointer'
              })
            }}
          />
        </div>

        {/* Divider */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Divider</label>
          <input
            type="text"
            value={elementsData.layoutOptions.stackOptions?.divider}
            onChange={(e) => handleSettingsChange('layoutOptions', 'stackOptions', 'divider', e.target.value)}
            className="block w-full px-3 py-2 text-white bg-black border rounded"
          />
        </div>
      </div>
    )}

    {/* Tab Layout Options */}
    {elementsData.layoutOptions.layout === 'tab' && (
      <div className="tab-options">
        <label className="block mb-2 text-white">Tab Options</label>

        {/* Orientation */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Orientation</label>
          <Select
            options={[
              { value: 'horizontal', label: 'Horizontal' },
              { value: 'vertical', label: 'Vertical' },
            ]}
            value={{ value: elementsData.layoutOptions.tabOptions?.orientation || 'horizontal', label: elementsData.layoutOptions.tabOptions?.orientation}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'tabOptions', 'orientation', selectedOption.value)}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px', // h-10: 2.5rem = 40px
                paddingLeft: '8px', // px-2: 0.5rem = 8px
                paddingRight: '8px', // px-2: 0.5rem = 8px
                color: 'white'
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
                backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                color: state.isSelected ? 'black' : 'white',
                cursor: 'pointer'
              })
            }}
          />
        </div>

        {/* Variant */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Variant</label>
          <Select
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'scrollable', label: 'Scrollable' },
              { value: 'fullWidth', label: 'Full Width' },
            ]}
            value={{ value: elementsData.layoutOptions.tabOptions?.variant || 'standard', label: elementsData.layoutOptions.tabOptions?.variant}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'tabOptions', 'variant', selectedOption.value)}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px', // h-10: 2.5rem = 40px
                paddingLeft: '8px', // px-2: 0.5rem = 8px
                paddingRight: '8px', // px-2: 0.5rem = 8px
                color: 'white'
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
                backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                color: state.isSelected ? 'black' : 'white',
                cursor: 'pointer'
              })
            }}
          />
        </div>

        {/* Centered */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Centered</label>
          <Select
            options={[
              { value: 'true', label: 'True' },
              { value: 'false', label: 'False' },
            ]}
            value={{ value: elementsData.layoutOptions.tabOptions?.centered || 'false', label: elementsData.layoutOptions.tabOptions?.centered}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'tabOptions', 'centered', selectedOption.value)}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px', // h-10: 2.5rem = 40px
                paddingLeft: '8px', // px-2: 0.5rem = 8px
                paddingRight: '8px', // px-2: 0.5rem = 8px
                color: 'white'
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
                backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                color: state.isSelected ? 'black' : 'white',
                cursor: 'pointer'
              })
            }}
          />
        </div>

        {/* Indicator Color */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Indicator Color</label>
          <input
            type="text"
            value={elementsData.layoutOptions.tabOptions?.indicatorColor}
            onChange={(e) => handleSettingsChange('layoutOptions', 'tabOptions', 'indicatorColor', e.target.value)}
            className="block w-full px-3 py-2 text-white bg-black border rounded"
          />
        </div>

        {/* Text Color */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Text Color</label>
          <input
            type="text"
            value={elementsData.layoutOptions.tabOptions?.textColor}
            onChange={(e) => handleSettingsChange('layoutOptions', 'tabOptions', 'textColor', e.target.value)}
            className="block w-full px-3 py-2 text-white bg-black border rounded"
          />
        </div>
      </div>
    )}

    {/* Fluid Layout Options */}
    {elementsData.layoutOptions.layout === 'fluid' && (
      <div className="fluid-options">
        <label className="block mb-2 text-white">Fluid Options</label>

        {/* Gutter */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Gutter</label>
          <input
            type="number"
            value={elementsData.layoutOptions.fluidOptions?.gutter}
            onChange={(e) => handleSettingsChange('layoutOptions', 'fluidOptions', 'gutter', e.target.value)}
            className="block w-full px-3 py-2 text-white bg-black border rounded"
          />
        </div>

        {/* Justify */}
        <div className="mb-4">
          <label className="block mb-2 text-white">Justify</label>
          <Select
            options={[
              { value: 'start', label: 'Start' },
              { value: 'center', label: 'Center' },
              { value: 'end', label: 'End' },
              { value: 'space-around', label: 'Space Around' },
              { value: 'space-between', label: 'Space Between' },
            ]}
            value={{ value: elementsData.layoutOptions.fluidOptions?.justify || 'start', label: elementsData.layoutOptions.fluidOptions?.justify}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'fluidOptions', 'justify', selectedOption.value)}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px', // h-10: 2.5rem = 40px
                paddingLeft: '8px', // px-2: 0.5rem = 8px
                paddingRight: '8px', // px-2: 0.5rem = 8px
                color: 'white'
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
                backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                color: state.isSelected ? 'black' : 'white',
                cursor: 'pointer'
              })
            }}
          />
        </div>
      </div>
    )}
  </div>
</div>

 {/* Items Section with Drag-and-Drop */}
 <div className="w-full p-4">
          <label className="block w-full mb-2 text-white">Items</label>
          
          <Select
            options={elementData?.elements.map((element) => ({ value: element._id, label: element.referenceName }))}
            onChange={handleAddItem}
            placeholder="Select an Element to Add"
            className="mb-4"
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: 'black',
                borderColor: state.isFocused ? 'white' : '#D3D3D3', // border-nexa-gray: #D3D3D3
                borderBottomWidth: '2px',
                borderRadius: '0px',
                height: '40px', // h-10: 2.5rem = 40px
                paddingLeft: '8px', // px-2: 0.5rem = 8px
                paddingRight: '8px', // px-2: 0.5rem = 8px
                color: 'white'
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
                backgroundColor: state.isSelected ? '#007bff' : 'black', // bg-blue-500: #007bff
                color: state.isSelected ? 'black' : 'white',
                cursor: 'pointer'
              })
            }}
          />
          {(elementsData.items.length!==0) && <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={elementsData.items.map((_, index) => index)}>
              {elementsData.items.map((item, index) => (
                <SortableItem
                  key={index}
                  id={index}
                  index={index}
                  item={item}
                  handleRemove={handleRemoveItem}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>}
        </div>

        {/* Style fields */}
        <div className="p-4">
        <label className="block w-full mb-2 text-white">Style</label>
          <div className="notes-container p-4 bg-sidebar-card-top rounded-lg">
            <div className="flex flex-wrap">
              {['backgroundColor', 'textColor', 'textMutedColor'].map((field) => (
                <div key={field} className="w-full sm:w-1/2 p-4">
                  <label className="block mb-2 text-white capitalize">{field}</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="block w-full h-10 px-2 py-1 bg-black border-b border-nexa-gray text-white"
                      placeholder={`Enter ${field}`}
                      value={elementsData.style[field]}
                      onChange={(e) => handleSettingsChange('style', field, e.target.value)}
                    />
                    <input
                      type="color"
                      value={elementsData.style[field]}
                      onChange={(e) => handleColorPickerChange(e.target.value, field)}
                      className="w-10 h-10 ml-2 border-none"
                    />
                  </div>
                </div>
              ))}
              {['headerFontFamily', 'textFontFamily', 'headerFontSize', 'textFontSize', 'borderRadius', 'padding', 'customCSS'].map((field) => (
                <div key={field} className="w-full sm:w-1/2 p-4">
                  <label className="block mb-2 text-white capitalize">{field}</label>
                  <input
                    type="text"
                    className="block w-full h-10 px-2 py-1 bg-black border-b border-nexa-gray text-white"
                    placeholder={`Enter ${field}`}
                    value={elementsData.style[field]}
                    onChange={(e) => handleSettingsChange('style', null, field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

       

        {/* Submit button */}
         {/* Render submit buttons */}
      {renderSubmitButtons()}
      </form>
    </div>
  );
}

export default ContainerForm;
