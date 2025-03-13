import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Select from 'react-select';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate, useParams } from 'react-router';
import { ToastContainer, toast } from 'react-toastify';


function SortableItem({ id, index, handleRemove, item, element }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex mb-2 items-center">
      <input
        type="text"
        className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
        value={
          element?.elements?.find(
            (el) => el._id === item.element
          )?.referenceName || "Unknown"
        }
        
        disabled
      />
      <button type="button" className="bg-primary-button-color text-btn-text-color-text-color px-4 py-2 rounded ml-2" onClick={() => handleRemove(index)}>
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
    title: '',
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
      sizeData: [],
      defaultSize: {}
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
  const limit = 100; // Set your desired limit value

  
  const mutationHook = container  ? usePutData : usePostData;
  const api_url = container  ? `/containers/${container?._id}` : '/containers';
  const api_key = container  ? 'updateContainer' : 'addContainer';
  
  // Call the mutation hook at the top level
  const { mutate: handleApiMutation } = mutationHook(api_key, api_url, elementsData);
  const { data: elementData, isLoading: isElementLoading } = useGetData("elementdata", `/elements?limit=${limit}`, {});
  const { data: appData, isLoading: isAppLoading } = useGetData("appdata", `/app?limit=${limit}`, {});

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
    if (container) {
      const cleanedContainer = removeUnwantedFields(container);

       // Transform items to only include itemType and itemId
       const transformedItems = container.items?.map(item => ({
        element: item.element?._id,
    }));

    // Transform availability to only include appId as a string
    const transformedAvailability = container.available?.map(avail => ({
        appId: avail.appId?._id,
    }));

      setElementsData({
        referenceName: cleanedContainer.referenceName || '',
        title: cleanedContainer.title || '',
        description: cleanedContainer.description || '',
        layoutOptions: cleanedContainer.layoutOptions || {},
        items: transformedItems || [],
        style: cleanedContainer.style || {},
        available: transformedAvailability || [],
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

  const handleSettingsDefaultSizeChange = (category, subCategory, key, ...args) => {
    setElementsData((prevData) => {
      const newData = { ...prevData };
  
      if (category === "layoutOptions" && subCategory === "gridOptions") {
        if (key === "sizeData") {
          const [index, sizeKey, value] = args;
          newData.layoutOptions.gridOptions.sizeData = newData.layoutOptions.gridOptions.sizeData.map((item, i) =>
            i === index
              ? {
                  ...item,
                  size: { ...item.size, [sizeKey]: Number(value) },
                }
              : item
          );
        } else if (key === "defaultSize") {
          const [sizeKey, value] = args;
          newData.layoutOptions.gridOptions.defaultSize = {
            ...newData.layoutOptions.gridOptions.defaultSize,
            [sizeKey]: Number(value),
          };
        } else {
          // Handle other gridOptions changes
          newData.layoutOptions.gridOptions[key] = args[0];
        }
      }
  
      return { ...newData };
    });
  };

  const handleSettingsSizeChange = (index, sizeKey, value) => {
    setElementsData((prevData) => {
      const updatedSizeData = prevData?.layoutOptions?.gridOptions?.sizeData
        ? [...prevData.layoutOptions.gridOptions.sizeData]
        : [];
  
      // Ensure the entry exists at the given index
      if (!updatedSizeData[index]) {
        updatedSizeData[index] = { column: "", size: {} };
      }
  
      // Update the specific sizeKey with the new value (clamped between 0 and 12)
      updatedSizeData[index].size = {
        ...updatedSizeData[index].size,
        [sizeKey]: Math.min(Math.max(Number(value), 0), 12),
      };
  
      return {
        ...prevData,
        layoutOptions: {
          ...prevData.layoutOptions,
          gridOptions: {
            ...prevData.layoutOptions.gridOptions,
            sizeData: updatedSizeData,
          },
        },
      };
    });
  };
  
  
  
  const addSizeData = () => {
    setElementsData((prevData) => ({
      ...prevData,
      layoutOptions: {
        ...prevData.layoutOptions,
        gridOptions: {
          ...prevData.layoutOptions.gridOptions,
          sizeData: [
            ...prevData.layoutOptions.gridOptions.sizeData,
            {
              column: prevData.layoutOptions.gridOptions.sizeData.length, // Auto-increment column
              size: { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 },
            },
          ],
        },
      },
    }));
  };
  
  const removeSizeData = (index) => {
    setElementsData((prevData) => {
      const newSizeData = prevData.layoutOptions.gridOptions.sizeData.filter((_, i) => i !== index);
  
      return {
        ...prevData,
        layoutOptions: {
          ...prevData.layoutOptions,
          gridOptions: {
            ...prevData.layoutOptions.gridOptions,
            sizeData: newSizeData,
          },
        },
      };
    });
  };
  
  
  const handleColorPickerChange = (value, field) => {
    handleSettingsChange('style', null, field, value);
  };
  
  const handleColorInputChange = (e, field) => {
    const value = e.target.value;
    handleSettingsChange('style', null, field, value);
  };

  const handleAddItem = (selectedOption) => {
    if (selectedOption) {
      setElementsData((prevState) => ({
        ...prevState,
        items: [...prevState.items, { element: selectedOption.value }],
      }));
    }
  };

  const handleRemoveItem = (index) => {
    setElementsData((prevState) => {
      if (!prevState.items) return prevState; // Ensure items exist
      return {
        ...structuredClone(prevState), // Ensures state update triggers re-render
        items: prevState.items.filter((_, i) => i !== index),
      };
    });
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
    const cleanedContainer = removeUnwantedFields(elementsData);
    console.log("cleanedContainer",cleanedContainer);
    try {
      handleApiMutation({ ...cleanedContainer, draft: true, publish: true }, {
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
          <button type="button" onClick={handleDraftSubmit} className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded-md">
            Redraft
          </button>
          <button type="button" onClick={handlePublishSubmit} className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded-md">
            Publish
          </button>
        </div>
      );
    } else if (elementsData.draft && elementsData.publish) {
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
          <button type="button" onClick={handleDraftSubmit} className="bg-primary-button-color text-btn-text-color px-6 py-2 rounded-md">
            Draft
          </button>
        </div>
      );
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  console.log("elementsData",elementsData);
  console.log("container",container);
  console.log("elementData",elementData);
  console.log("elementsData.layoutOptions.gridOptions?.sizeData?",elementsData.layoutOptions.gridOptions?.sizeData);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
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

          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-text-color primary-text">Title</label>
              <input
                type="text"
                value={elementsData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
              />
            </div>
          </div>

          {/* Description */}
          <div className="w-full sm:w-1/2 p-4">
            <div className="mb-4">
              <label className="block w-full mb-2 text-text-color primary-text">Description</label>
              <textarea
                value={elementsData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
  <label className="block w-full mb-2 text-text-color primary-text">Available Apps</label>
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



        {/* Layout Options */}
<div className="p-4">
  <label className="block w-full mb-2 text-text-color primary-text">Layout Settings</label>
  <div className="notes-container p-4 bg-secondary-card rounded-lg">
    <div className="flex flex-wrap">
      <div className="w-full sm:w-1/2 p-4">
        <label className="block mb-2 text-text-color">Select Layout</label>
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

    {/* Grid Layout Options */}
    {elementsData.layoutOptions.layout === 'grid' && (
      <div className="grid-options">
        <label className="block mb-2 text-text-color">Grid Options</label>

        {/* Spacing */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Spacing</label>
          <input
            type="number"
            value={elementsData.layoutOptions.gridOptions?.spacing}
            onChange={(e) => handleSettingsChange('layoutOptions','gridOptions','spacing', e.target.value)}
            className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
          />
        </div>

        {/* Direction */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Direction</label>
          <Select
            options={[
              { value: 'row', label: 'Row' },
              { value: 'column', label: 'Column' },
              { value: 'row-reverse', label: 'Row Reverse' },
              { value: 'column-reverse', label: 'Column Reverse' },
            ]}
            value={{ value: elementsData.layoutOptions.gridOptions?.direction || 'row', label: elementsData.layoutOptions.gridOptions?.direction}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'gridOptions', 'direction', selectedOption.value)}
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

        {/* Justify Content */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Justify Content</label>
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

        {/* Align Items */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Align Items</label>
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

        {/* Wrap */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Wrap</label>
          <Select
            options={[
              { value: 'nowrap', label: 'No Wrap' },
              { value: 'wrap', label: 'Wrap' },
              { value: 'wrap-reverse', label: 'Wrap Reverse' },
            ]}
            value={{ value: elementsData.layoutOptions.gridOptions?.wrap || 'wrap', label: elementsData.layoutOptions.gridOptions?.wrap}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'gridOptions' , 'wrap', selectedOption.value)}
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

        {/* Columns */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Columns</label>
          <input
            type="number"
            value={elementsData.layoutOptions.gridOptions?.columns}
            onChange={(e) => handleSettingsChange('layoutOptions', 'gridOptions', 'columns', e.target.value)}
            className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
          />
        </div>

        {/* Size Data */}
<div className="w-full p-4">
  <div className="flex items-center justify-between mb-4">
    <label className="block w-full mb-2 text-text-color primary-text">Size Data</label>
    <button
      type="button"
      className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded"
      onClick={addSizeData}
    >
      Add
    </button>
  </div>

  <div className="notes-container p-4 bg-secondary-card rounded-lg">
    {elementsData.layoutOptions.gridOptions?.sizeData?.length === 0 && (
      <p className="text-text-color">No Size Data available</p>
    )}

    {elementsData.layoutOptions.gridOptions?.sizeData?.map((item, index) => (
      <div key={index} className="flex items-center mb-2">
        <label className="block w-1/6 h-10 px-2 py-1 items-center text-text-color">
          Column: {item.column}
        </label>

        {['xs', 'sm', 'md', 'lg', 'xl'].map((size) => (
  <div key={size} className="flex flex-col mb-4">
    <label className="block text-text-color mb-1 ml-20">{size.toUpperCase()}</label>
    <input
      type="number"
      min="0"
      max="12"
      className="block w-full px-6 py-2 ml-12 text-text-color secondary-card border rounded"
      placeholder={size.toUpperCase()}
      value={item.size?.[size] || 0}
      onChange={(e) => handleSettingsSizeChange(index, size, Number(e.target.value))}
    />
  </div>
))}



        <button
          type="button"
          className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded ml-14 mt-2"
          onClick={() => removeSizeData(index)}
        >
          Remove
        </button>
      </div>
    ))}
  </div>
</div>



        {/* Default Size */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Default Size</label>
          {['xs', 'sm', 'md', 'lg', 'xl'].map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <label className="text-text-color w-10">{size.toUpperCase()}</label>
              <input
                type="number"
                min="0"
                max="12"
                value={elementsData.layoutOptions.gridOptions?.defaultSize?.[size] || 0}
                onChange={(e) => handleSettingsDefaultSizeChange('layoutOptions', 'gridOptions', 'defaultSize', size, e.target.value)}
                className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
              />
            </div>
          ))}
        </div>
      </div>

      
    )}

    {/* Stack Layout Options */}
    {elementsData.layoutOptions.layout === 'stack' && (
      <div className="stack-options">
        <label className="block mb-2 text-text-color">Stack Options</label>

        {/* Spacing */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Spacing</label>
          <input
            type="number"
            value={elementsData.layoutOptions.stackOptions?.spacing}
            onChange={(e) => handleSettingsChange('layoutOptions', 'stackOptions', 'spacing', e.target.value)}
            className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
          />
        </div>

        {/* Direction */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Direction</label>
          <Select
            options={[
              { value: 'column', label: 'Column' },
              { value: 'row', label: 'Row' },
              { value: 'row-reverse', label: 'Row Reverse' },
              { value: 'column-reverse', label: 'Column Reverse' },
            ]}
            value={{ value: elementsData.layoutOptions.stackOptions?.direction || 'column', label: elementsData.layoutOptions.stackOptions?.direction}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'stackOptions', 'direction', selectedOption.value)}
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

        {/* Justify Content */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Justify Content</label>
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

        {/* Align Items */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Align Items</label>
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

        {/* Divider */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Divider</label>
          <input
            type="text"
            value={elementsData.layoutOptions.stackOptions?.divider}
            onChange={(e) => handleSettingsChange('layoutOptions', 'stackOptions', 'divider', e.target.value)}
            className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
          />
        </div>
      </div>
    )}

    {/* Tab Layout Options */}
    {elementsData.layoutOptions.layout === 'tab' && (
      <div className="tab-options">
        <label className="block mb-2 text-text-color">Tab Options</label>

        {/* Orientation */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Orientation</label>
          <Select
            options={[
              { value: 'horizontal', label: 'Horizontal' },
              { value: 'vertical', label: 'Vertical' },
            ]}
            value={{ value: elementsData.layoutOptions.tabOptions?.orientation || 'horizontal', label: elementsData.layoutOptions.tabOptions?.orientation}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'tabOptions', 'orientation', selectedOption.value)}
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

        {/* Variant */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Variant</label>
          <Select
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'scrollable', label: 'Scrollable' },
              { value: 'fullWidth', label: 'Full Width' },
            ]}
            value={{ value: elementsData.layoutOptions.tabOptions?.variant || 'standard', label: elementsData.layoutOptions.tabOptions?.variant}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'tabOptions', 'variant', selectedOption.value)}
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

        {/* Centered */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Centered</label>
          <Select
            options={[
              { value: 'true', label: 'True' },
              { value: 'false', label: 'False' },
            ]}
            value={{ value: elementsData.layoutOptions.tabOptions?.centered || 'false', label: elementsData.layoutOptions.tabOptions?.centered}}
            onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'tabOptions', 'centered', selectedOption.value)}
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

        {/* Indicator Color */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Indicator Color</label>
          <input
            type="text"
            value={elementsData.layoutOptions.tabOptions?.indicatorColor}
            onChange={(e) => handleSettingsChange('layoutOptions', 'tabOptions', 'indicatorColor', e.target.value)}
            className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
          />
        </div>

        {/* Text Color */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Text Color</label>
          <input
            type="text"
            value={elementsData.layoutOptions.tabOptions?.textColor}
            onChange={(e) => handleSettingsChange('layoutOptions', 'tabOptions', 'textColor', e.target.value)}
            className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
          />
        </div>
      </div>
    )}

    {/* Fluid Layout Options */}
    {elementsData.layoutOptions.layout === 'fluid' && (
      <div className="fluid-options">
        <label className="block mb-2 text-text-color">Fluid Options</label>

        {/* Gutter */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Gutter</label>
          <input
            type="number"
            value={elementsData.layoutOptions.fluidOptions?.gutter}
            onChange={(e) => handleSettingsChange('layoutOptions', 'fluidOptions', 'gutter', e.target.value)}
            className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
          />
        </div>

        {/* Justify */}
        <div className="mb-4">
          <label className="block mb-2 text-text-color">Justify</label>
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
    )}
  </div>
</div>

 {/* Items Section with Drag-and-Drop */}
 <div className="w-full p-4">
          <label className="block w-full mb-2 text-text-color primary-text">Items</label>
          
          <Select
            options={elementData?.elements.map((element) => ({ value: element._id, label: element.referenceName }))}
            onChange={handleAddItem}
            placeholder="Select an Element to Add"
            className="mb-4"
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
          {(elementsData.items.length!==0) && <div className="notes-container p-4 bg-secondary-card rounded-lg">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={elementsData.items.map((_, index) => index)}>
              {elementsData.items.map((item, index) => (
                <SortableItem
                  key={index}
                  id={index}
                  index={index}
                  item={item}
                  element={elementData}
                  handleRemove={handleRemoveItem}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>}
        </div>

            {/* Style fields */}
            <div className="p-4">
  <label className="block w-full mb-2 text-text-color primary-text">Style</label>
  <div className="notes-container p-4 bg-secondary-card rounded-lg">
    <div className="flex flex-wrap">
      {['backgroundColor', 'textColor', 'textMutedColor'].map((field) => (
        <div key={field} className="w-full sm:w-1/2 p-4">
          <label className="block mb-2 text-text-color capitalize">{field}</label>
          <div className="flex items-center">
            {/* Text Input for Manual Color Entry */}
            <input
              type="text"
              className="block w-full h-10 px-2 py-1 secondary-card border-b border-border text-text-color"
              placeholder={`Enter ${field}`}
              value={elementsData.style[field] || ""}
              onChange={(e) => handleColorInputChange(e, field)}
            />
            {/* Color Picker */}
            <input
              type="color"
              value={elementsData.style[field] || "#ffffff"} // Default to white if undefined
              onChange={(e) => handleColorPickerChange(e.target.value, field)}
              className="w-10 h-10 ml-2 border-none"
            />
          </div>
        </div>
      ))}
              {['headerFontFamily', 'textFontFamily', 'headerFontSize', 'textFontSize', 'borderRadius', 'padding', 'customCSS'].map((field) => (
                <div key={field} className="w-full sm:w-1/2 p-4">
                  <label className="block mb-2 text-text-color capitalize">{field}</label>

                  {field === 'customCSS' ? (
                    <textarea
                      className="block w-full h-24 px-2 py-1 secondary-card border border-border text-text-color resize-none"
                      placeholder={`Enter ${field}`}
                      value={elementsData.style[field]}
                      onChange={(e) => handleSettingsChange('style', null, field, e.target.value)}
                    />
                  ) : (
                    <input
                      type="text"
                      className="block w-full h-10 px-2 py-1 secondary-card border-b border-border text-text-color"
                      placeholder={`Enter ${field}`}
                      value={elementsData.style[field]}
                      onChange={(e) => handleSettingsChange('style', null, field, e.target.value)}
                    />
                  )}
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
