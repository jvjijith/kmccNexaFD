import React, { useState, useEffect } from 'react';
import { useGetData, usePostData, usePutData } from '../../common/api';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Select from 'react-select';
import LoadingScreen from '../ui/loading/loading';
import { useNavigate, useParams } from 'react-router';
import { ToastContainer, toast } from 'react-toastify';

// Validation schema based on the provided API schema
const validateContainerData = (data) => {
  const errors = {};

  // Required fields validation
  if (!data.referenceName || data.referenceName.trim() === '') {
    errors.referenceName = 'Reference name is required';
  }

  if (!data.description || data.description.trim() === '') {
    errors.description = 'Description is required';
  }

  // Layout options validation
  if (!data.layoutOptions?.layout) {
    errors.layout = 'Layout type is required';
  } else {
    const validLayouts = ['tab', 'normal', 'fluid', 'grid', 'stack'];
    if (!validLayouts.includes(data.layoutOptions.layout)) {
      errors.layout = 'Invalid layout type';
    }
  }

  // Grid options validation
  if (data.layoutOptions?.layout === 'grid' && data.layoutOptions.gridOptions) {
    const gridOptions = data.layoutOptions.gridOptions;
    
    if (gridOptions.spacing !== undefined && (gridOptions.spacing < 0 || isNaN(gridOptions.spacing))) {
      errors.gridSpacing = 'Grid spacing must be a non-negative number';
    }

    if (gridOptions.columns !== undefined && (gridOptions.columns < 1 || isNaN(gridOptions.columns))) {
      errors.gridColumns = 'Grid columns must be at least 1';
    }

    const validDirections = ['row', 'column', 'row-reverse', 'column-reverse'];
    if (gridOptions.direction && !validDirections.includes(gridOptions.direction)) {
      errors.gridDirection = 'Invalid grid direction';
    }

    const validJustifyContent = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'];
    if (gridOptions.justifyContent && !validJustifyContent.includes(gridOptions.justifyContent)) {
      errors.gridJustifyContent = 'Invalid justify content value';
    }

    const validAlignItems = ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'];
    if (gridOptions.alignItems && !validAlignItems.includes(gridOptions.alignItems)) {
      errors.gridAlignItems = 'Invalid align items value';
    }

    const validWrap = ['nowrap', 'wrap', 'wrap-reverse'];
    if (gridOptions.wrap && !validWrap.includes(gridOptions.wrap)) {
      errors.gridWrap = 'Invalid wrap value';
    }

    // Validate sizeData array
    if (gridOptions.sizeData && Array.isArray(gridOptions.sizeData)) {
      gridOptions.sizeData.forEach((sizeItem, index) => {
        if (sizeItem.size) {
          ['xs', 'sm', 'md', 'lg', 'xl'].forEach(breakpoint => {
            if (sizeItem.size[breakpoint] !== undefined) {
              const value = sizeItem.size[breakpoint];
              if (value < 0 || value > 12 || isNaN(value)) {
                errors[`gridSize_${index}_${breakpoint}`] = `${breakpoint.toUpperCase()} size must be between 0 and 12`;
              }
            }
          });
        }
      });
    }
  }

  // Stack options validation
  if (data.layoutOptions?.layout === 'stack' && data.layoutOptions.stackOptions) {
    const stackOptions = data.layoutOptions.stackOptions;

    if (stackOptions.spacing !== undefined && (stackOptions.spacing < 0 || isNaN(stackOptions.spacing))) {
      errors.stackSpacing = 'Stack spacing must be a non-negative number';
    }

    const validDirections = ['row', 'column', 'row-reverse', 'column-reverse'];
    if (stackOptions.direction && !validDirections.includes(stackOptions.direction)) {
      errors.stackDirection = 'Invalid stack direction';
    }

    const validJustifyContent = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'];
    if (stackOptions.justifyContent && !validJustifyContent.includes(stackOptions.justifyContent)) {
      errors.stackJustifyContent = 'Invalid justify content value';
    }

    const validAlignItems = ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'];
    if (stackOptions.alignItems && !validAlignItems.includes(stackOptions.alignItems)) {
      errors.stackAlignItems = 'Invalid align items value';
    }
  }

  // Tab options validation
  if (data.layoutOptions?.layout === 'tab' && data.layoutOptions.tabOptions) {
    const tabOptions = data.layoutOptions.tabOptions;

    const validOrientations = ['horizontal', 'vertical'];
    if (tabOptions.orientation && !validOrientations.includes(tabOptions.orientation)) {
      errors.tabOrientation = 'Invalid tab orientation';
    }

    const validVariants = ['standard', 'scrollable', 'fullWidth'];
    if (tabOptions.variant && !validVariants.includes(tabOptions.variant)) {
      errors.tabVariant = 'Invalid tab variant';
    }

    const validColors = ['primary', 'secondary', 'inherit', 'custom'];
    if (tabOptions.indicatorColor && !validColors.includes(tabOptions.indicatorColor)) {
      errors.tabIndicatorColor = 'Invalid indicator color value';
    }

    if (tabOptions.textColor && !validColors.includes(tabOptions.textColor)) {
      errors.tabTextColor = 'Invalid text color value';
    }
  }

  // Fluid options validation
  if (data.layoutOptions?.layout === 'fluid' && data.layoutOptions.fluidOptions) {
    const fluidOptions = data.layoutOptions.fluidOptions;
    
    if (fluidOptions.gutter !== undefined && (fluidOptions.gutter < 0 || isNaN(fluidOptions.gutter))) {
      errors.fluidGutter = 'Fluid gutter must be a non-negative number';
    }

    const validJustify = ['start', 'center', 'end', 'space-around', 'space-between'];
    if (fluidOptions.justify && !validJustify.includes(fluidOptions.justify)) {
      errors.fluidJustify = 'Invalid fluid justify value';
    }
  }

  // Items validation
  if (!data.items || data.items.length === 0) {
    errors.items = 'At least one element must be added to the container';
  }

  // Available apps validation
  if (!data.available || data.available.length === 0) {
    errors.available = 'At least one app must be selected';
  }

  return errors;
};

// Color picker component with hex input
const ColorPicker = ({ value, onChange, defaultValue, error }) => {
  const [hexValue, setHexValue] = useState(value || defaultValue);
  const [showHexInput, setShowHexInput] = useState(false);

  useEffect(() => {
    setHexValue(value || defaultValue);
  }, [value, defaultValue]);

  const handleColorChange = (newValue) => {
    setHexValue(newValue);
    onChange(newValue);
  };

  const handleHexInputChange = (e) => {
    const newValue = e.target.value;
    setHexValue(newValue);
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={hexValue}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-12 h-10 border rounded cursor-pointer"
        />
        <button
          type="button"
          onClick={() => setShowHexInput(!showHexInput)}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Hex
        </button>
        <span className="text-sm text-gray-600">{hexValue}</span>
      </div>
      {showHexInput && (
        <input
          type="text"
          value={hexValue}
          onChange={handleHexInputChange}
          placeholder="#000000"
          className={`block w-full px-3 py-2 text-text-color secondary-card border rounded ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      )}
    </div>
  );
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

// Helper function to safely render description
const getElementDescription = (description) => {
  if (typeof description === 'string') {
    return description;
  }
  if (description && typeof description === 'object') {
    return description.paragraph || description.text || 'No description';
  }
  return 'No description';
};

function SortableItem({ id, index, handleRemove, item, element, navigate }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRemoveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleRemove(index);
  };

  const handleElementClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const elementData = element?.elements?.find((el) => el._id === item.element);
    if (elementData) {
      navigate(`/element/edit`, { state: { element: elementData } });
    }
  };

  const elementData = element?.elements?.find((el) => el._id === item.element);

  return (
    <div
      ref={setNodeRef}
      style={style}
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
              onClick={handleElementClick}
            >
              {elementData?.referenceName || "Unknown Element"}
            </div>
            <div className="text-sm text-gray-500">
              {getElementDescription(elementData?.description)}
            </div>
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

function ContainerForm({ container }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      defaultSize: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 4,
        xl: 3
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
      backgroundColor: '#ffffff',
      textColor: '#000000',
      textMutedColor: '#6b7280',
      headerFontFamily: 'Times New Roman',
      textFontFamily: 'Times New Roman',
      headerFontSize: '24px',
      textFontSize: '16px',
      borderRadius: '0px',
      padding: '0px',
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
  const { mutate: handleApiMutation, isLoading: isSavingMutation } = mutationHook(api_key, api_url);

  // Fetch element data
  const { data: elementData, isLoading: isElementLoading } = useGetData("elementdata", `/elements?limit=${limit}`, {});

  // Fetch app data
  const { data: appData, isLoading: isAppLoading } = useGetData("appdata", `/app?limit=${limit}`, {});

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
    if (container) {
      const cleanedContainer = removeUnwantedFields(container);
      const transformedAppId = container.available?.map(avail => ({
        appId: avail.appId?._id || avail.appId,
      })) || [];
      const transformedItems = container.items?.map((item) => ({
        element: item.element?._id || item.element,
      })) || [];
      
      setElementsData({
        ...cleanedContainer,
        available: transformedAppId,
        items: transformedItems,
      });
    }
  }, [container]);

  const handleInputChange = (name, value) => {
    setElementsData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSettingsChange = (section, subsection, key, value) => {
    setElementsData((prevState) => {
      if (subsection) {
        return {
          ...prevState,
          [section]: {
            ...prevState[section],
            [subsection]: {
              ...prevState[section][subsection],
              [key]: value,
            },
          },
        };
      } else {
        return {
          ...prevState,
          [section]: {
            ...prevState[section],
            [key]: value,
          },
        };
      }
    });

    // Clear related errors
    const errorKey = subsection ? `${subsection}${key.charAt(0).toUpperCase() + key.slice(1)}` : key;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const handleAddItem = (selectedElement) => {
    if (selectedElement) {
      const newItem = { element: selectedElement.value };
      setElementsData((prevState) => ({
        ...prevState,
        items: [...prevState.items, newItem],
      }));
      
      // Clear items error
      if (errors.items) {
        setErrors(prev => ({ ...prev, items: undefined }));
      }
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
    
    const validationErrors = validateContainerData(elementsData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors before submitting.');
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);
    
    try {
      handleApiMutation({elementsData, draft: true, publish: false }, {
        onSuccess: () => {
          toast.success('Container saved successfully!');
          navigate('/store/appmanagement/container');
        },
        onError: (error) => {
          console.error('Error submitting form:', error);
          toast.error('Failed to save container. Please try again.');
        },
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save container. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDraftSubmit = async () => {
    const validationErrors = validateContainerData(elementsData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors before saving as draft.');
      return;
    }

    setErrors({});
    const cleanedContainer = removeUnwantedFields(elementsData);

    try {
      handleApiMutation({ ...cleanedContainer, draft: true, publish: false }, {
        onSuccess: (response) => {
          // Don't navigate away after drafting - stay on the form
          toast.success('Draft saved successfully!');
          setElementsData(response.data);
        },
        onError: (error) => {
          console.error('Error submitting form:', error);
          toast.error('Failed to save draft. Please try again.');
        },
      });
    } catch (error) {
      toast.error('Failed to save draft.');
      console.error(error);
    }
  };

  const handlePublishSubmit = async () => {
    const validationErrors = validateContainerData(elementsData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors before publishing.');
      return;
    }

    setErrors({});
    const cleanedContainer = removeUnwantedFields(elementsData);

    try {
      handleApiMutation({ ...cleanedContainer, draft: true, publish: true }, {
        onSuccess: (response) => {
          // Only navigate away after publishing
          navigate('/store/appmanagement/container');
          toast.success('Container published successfully!');
          setElementsData(response.data);
        },
        onError: (error) => {
          console.error('Error submitting form:', error);
          toast.error('Failed to publish. Please try again.');
        },
      });
    } catch (error) {
      toast.error('Failed to publish.');
      console.error(error);
    }
  };

  const renderSubmitButtons = () => {
    const { draft, publish } = elementsData;
    const isLoading = isSubmitting || isSavingMutation;
    const isNewContainer = !container; // Check if this is a new container

    // For new containers, only show draft button initially
    if (isNewContainer && !draft) {
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

    // For drafted containers (new or existing), show both draft and publish buttons
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

    // For published containers, show draft and update published buttons
    else if (draft && publish) {
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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">
          {/* Reference Name */}
          <FormField 
            label="Reference Name" 
            required 
            error={errors.referenceName}
          >
            <input
              type="text"
              value={elementsData.referenceName}
              onChange={(e) => handleInputChange('referenceName', e.target.value)}
              className={`block w-full px-3 py-2 text-text-color secondary-card border rounded ${
                errors.referenceName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter a unique reference name"
            />
          </FormField>

          <FormField 
            label="Title" 
            error={errors.title}
          >
            <input
              type="text"
              value={elementsData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
              placeholder="Enter container title"
            />
          </FormField>

          {/* Description */}
          <FormField 
            label="Description" 
            required 
            error={errors.description}
            className="w-full p-4"
          >
            <textarea
              value={elementsData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`block w-full px-3 py-2 text-text-color secondary-card border rounded ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="3"
              placeholder="Enter container description"
            />
          </FormField>
        </div>

        <FormField 
          label="Available Apps" 
          required 
          error={errors.available}
          className="w-full p-4"
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
                available: selectedAppObjects,
              }));
              
              // Clear error
              if (errors.available) {
                setErrors(prev => ({ ...prev, available: undefined }));
              }
            }}
            value={elementsData.available.map((item) => ({
              value: item.appId,
              label: appData?.apps?.find((app) => app._id === item.appId)?.title || item.appId,
            }))}
            isLoading={isAppLoading}
            placeholder="Select apps where this container will be available"
            classNames={{
                control: ({ isFocused }) =>
                  `bg-primary border ${
                    isFocused ? 'border-secondary' : errors.available ? 'border-red-500' : 'border-focus-color'
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
        </FormField>

        {/* Layout Options */}
        <div className="p-4">
          <label className="block w-full mb-2 text-text-color primary-text">
            Layout Settings <span className="text-red-500">*</span>
          </label>
          <ErrorMessage error={errors.layout} />
          <div className="notes-container p-4 bg-secondary-card rounded-lg">
            <div className="flex flex-wrap">
              <FormField 
                label="Select Layout" 
                required 
                error={errors.layout}
              >
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
                        isFocused ? 'border-secondary' : errors.layout ? 'border-red-500' : 'border-focus-color'
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
              </FormField>
            </div>

            {/* Grid Layout Options */}
            {elementsData.layoutOptions.layout === 'grid' && (
              <div className="grid-options">
                <h3 className="text-lg font-medium text-text-color mb-4">Grid Options</h3>

                <div className="flex flex-wrap">
                  {/* Spacing */}
                  <FormField 
                    label="Spacing" 
                    error={errors.gridSpacing}
                  >
                    <input
                      type="number"
                      min="0"
                      value={elementsData.layoutOptions.gridOptions?.spacing || ''}
                      onChange={(e) => handleSettingsChange('layoutOptions','gridOptions','spacing', parseInt(e.target.value) || 0)}
                      className={`block w-full px-3 py-2 text-text-color secondary-card border rounded ${
                        errors.gridSpacing ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter spacing value"
                    />
                  </FormField>

                  {/* Columns */}
                  <FormField 
                    label="Columns" 
                    error={errors.gridColumns}
                  >
                    <input
                      type="number"
                      min="1"
                      value={elementsData.layoutOptions.gridOptions?.columns || ''}
                      onChange={(e) => handleSettingsChange('layoutOptions','gridOptions','columns', parseInt(e.target.value) || 1)}
                      className={`block w-full px-3 py-2 text-text-color secondary-card border rounded ${
                        errors.gridColumns ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Number of columns"
                    />
                  </FormField>

                  {/* Direction */}
                  <FormField 
                    label="Direction" 
                    error={errors.gridDirection}
                  >
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
                            isFocused ? 'border-secondary' : errors.gridDirection ? 'border-red-500' : 'border-focus-color'
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
                  </FormField>

                  {/* Justify Content */}
                  <FormField 
                    label="Justify Content" 
                    error={errors.gridJustifyContent}
                  >
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
                            isFocused ? 'border-secondary' : errors.gridJustifyContent ? 'border-red-500' : 'border-focus-color'
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
                  </FormField>

                  {/* Align Items */}
                  <FormField 
                    label="Align Items" 
                    error={errors.gridAlignItems}
                  >
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
                            isFocused ? 'border-secondary' : errors.gridAlignItems ? 'border-red-500' : 'border-focus-color'
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
                  </FormField>

                  {/* Wrap */}
                  <FormField 
                    label="Wrap" 
                    error={errors.gridWrap}
                  >
                    <Select
                      options={[
                        { value: 'wrap', label: 'Wrap' },
                        { value: 'nowrap', label: 'No Wrap' },
                        { value: 'wrap-reverse', label: 'Wrap Reverse' },
                      ]}
                      value={{ value: elementsData.layoutOptions.gridOptions?.wrap || 'wrap', label: elementsData.layoutOptions.gridOptions?.wrap}}
                      onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'gridOptions', 'wrap', selectedOption.value)}
                      classNames={{
                        control: ({ isFocused }) =>
                          `bg-primary border ${
                            isFocused ? 'border-secondary' : errors.gridWrap ? 'border-red-500' : 'border-focus-color'
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
                  </FormField>
                </div>

                {/* Size Data Configuration */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-text-color mb-3">Responsive Size Configuration</h4>
                  {elementsData.layoutOptions.gridOptions?.sizeData?.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium">Size Configuration {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => {
                            const newSizeData = [...(elementsData.layoutOptions.gridOptions?.sizeData || [])];
                            newSizeData.splice(index, 1);
                            handleSettingsChange('layoutOptions', 'gridOptions', 'sizeData', newSizeData);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-5 gap-4">
                        {['xs', 'sm', 'md', 'lg', 'xl'].map(breakpoint => (
                          <FormField 
                            key={breakpoint}
                            label={breakpoint.toUpperCase()}
                            error={errors[`gridSize_${index}_${breakpoint}`]}
                            className="w-full"
                          >
                            <input
                              type="number"
                              min="0"
                              max="12"
                              value={item.size?.[breakpoint] || ''}
                              onChange={(e) => {
                                const newSizeData = [...(elementsData.layoutOptions.gridOptions?.sizeData || [])];
                                if (!newSizeData[index].size) newSizeData[index].size = {};
                                newSizeData[index].size[breakpoint] = parseInt(e.target.value) || 0;
                                handleSettingsChange('layoutOptions', 'gridOptions', 'sizeData', newSizeData);
                              }}
                              className={`block w-full px-2 py-1 text-text-color secondary-card border rounded text-sm ${
                                errors[`gridSize_${index}_${breakpoint}`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="0-12"
                            />
                          </FormField>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newSizeData = [...(elementsData.layoutOptions.gridOptions?.sizeData || [])];
                      newSizeData.push({ column: newSizeData.length, size: {} });
                      handleSettingsChange('layoutOptions', 'gridOptions', 'sizeData', newSizeData);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Add Size Configuration
                  </button>
                </div>

                {/* Default Size Configuration */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-text-color mb-3">Default Size Configuration</h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-3">Set default sizes for all grid items across different breakpoints</p>
                    <div className="grid grid-cols-5 gap-4">
                      {['xs', 'sm', 'md', 'lg', 'xl'].map(breakpoint => (
                        <FormField
                          key={breakpoint}
                          label={breakpoint.toUpperCase()}
                          error={errors[`gridDefaultSize_${breakpoint}`]}
                          className="w-full"
                        >
                          <input
                            type="number"
                            min="0"
                            max="12"
                            value={elementsData.layoutOptions.gridOptions?.defaultSize?.[breakpoint] || ''}
                            onChange={(e) => {
                              const currentDefaultSize = elementsData.layoutOptions.gridOptions?.defaultSize || {};
                              const newDefaultSize = {
                                ...currentDefaultSize,
                                [breakpoint]: parseInt(e.target.value) || 0
                              };
                              handleSettingsChange('layoutOptions', 'gridOptions', 'defaultSize', newDefaultSize);
                            }}
                            className={`block w-full px-2 py-1 text-text-color secondary-card border rounded text-sm ${
                              errors[`gridDefaultSize_${breakpoint}`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0-12"
                          />
                        </FormField>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stack Layout Options */}
            {elementsData.layoutOptions.layout === 'stack' && (
              <div className="stack-options">
                <h3 className="text-lg font-medium text-text-color mb-4">Stack Options</h3>
                
                <div className="flex flex-wrap">
                  <FormField 
                    label="Spacing" 
                    error={errors.stackSpacing}
                  >
                    <input
                      type="number"
                      min="0"
                      value={elementsData.layoutOptions.stackOptions?.spacing || ''}
                      onChange={(e) => handleSettingsChange('layoutOptions','stackOptions','spacing', parseInt(e.target.value) || 0)}
                      className={`block w-full px-3 py-2 text-text-color secondary-card border rounded ${
                        errors.stackSpacing ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter spacing value"
                    />
                  </FormField>

                  <FormField 
                    label="Direction" 
                    error={errors.stackDirection}
                  >
                    <Select
                      options={[
                        { value: 'column', label: 'Column' },
                        { value: 'row', label: 'Row' },
                        { value: 'column-reverse', label: 'Column Reverse' },
                        { value: 'row-reverse', label: 'Row Reverse' },
                      ]}
                      value={{ value: elementsData.layoutOptions.stackOptions?.direction || 'column', label: elementsData.layoutOptions.stackOptions?.direction}}
                      onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'stackOptions', 'direction', selectedOption.value)}
                      classNames={{
                        control: ({ isFocused }) =>
                          `bg-primary border ${
                            isFocused ? 'border-secondary' : errors.stackDirection ? 'border-red-500' : 'border-focus-color'
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
                   </FormField>

                   {/* Justify Content */}
                   <FormField
                     label="Justify Content"
                     error={errors.stackJustifyContent}
                   >
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
                             isFocused ? 'border-secondary' : errors.stackJustifyContent ? 'border-red-500' : 'border-focus-color'
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
                   </FormField>

                   {/* Align Items */}
                   <FormField
                     label="Align Items"
                     error={errors.stackAlignItems}
                   >
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
                             isFocused ? 'border-secondary' : errors.stackAlignItems ? 'border-red-500' : 'border-focus-color'
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
                   </FormField>

                   {/* Divider Options */}
                   <FormField
                     label="Divider"
                     className="w-full p-4"
                   >
                     <div className="space-y-3">
                       <div className="flex items-center space-x-4">
                         <label className="flex items-center">
                           <input
                             type="checkbox"
                             checked={elementsData.layoutOptions.stackOptions?.divider?.enabled || false}
                             onChange={(e) => {
                               const currentDivider = elementsData.layoutOptions.stackOptions?.divider || {};
                               handleSettingsChange('layoutOptions', 'stackOptions', 'divider', {
                                 ...currentDivider,
                                 enabled: e.target.checked
                               });
                             }}
                             className="mr-2"
                           />
                           <span className="text-text-color">Enable Divider</span>
                         </label>
                       </div>

                       {elementsData.layoutOptions.stackOptions?.divider?.enabled && (
                         <div className="grid grid-cols-2 gap-4 pl-6">
                           <div>
                             <label className="block text-sm font-medium text-text-color mb-1">Divider Color</label>
                             <ColorPicker
                               value={elementsData.layoutOptions.stackOptions?.divider?.color}
                               onChange={(color) => {
                                 const currentDivider = elementsData.layoutOptions.stackOptions?.divider || {};
                                 handleSettingsChange('layoutOptions', 'stackOptions', 'divider', {
                                   ...currentDivider,
                                   color: color
                                 });
                               }}
                               defaultValue="#e5e7eb"
                             />
                           </div>
                           <div>
                             <label className="block text-sm font-medium text-text-color mb-1">Divider Thickness</label>
                             <input
                               type="text"
                               value={elementsData.layoutOptions.stackOptions?.divider?.thickness || '1px'}
                               onChange={(e) => {
                                 const currentDivider = elementsData.layoutOptions.stackOptions?.divider || {};
                                 handleSettingsChange('layoutOptions', 'stackOptions', 'divider', {
                                   ...currentDivider,
                                   thickness: e.target.value
                                 });
                               }}
                               className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
                               placeholder="e.g., 1px, 2px"
                             />
                           </div>
                         </div>
                       )}
                     </div>
                   </FormField>
                 </div>
               </div>
             )}

            {/* Tab Layout Options */}
            {elementsData.layoutOptions.layout === 'tab' && (
              <div className="tab-options">
                <h3 className="text-lg font-medium text-text-color mb-4">Tab Options</h3>
                
                <div className="flex flex-wrap">
                  <FormField 
                    label="Orientation" 
                    error={errors.tabOrientation}
                  >
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
                            isFocused ? 'border-secondary' : errors.tabOrientation ? 'border-red-500' : 'border-focus-color'
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
                  </FormField>

                  <FormField 
                    label="Variant" 
                    error={errors.tabVariant}
                  >
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
                            isFocused ? 'border-secondary' : errors.tabVariant ? 'border-red-500' : 'border-focus-color'
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
                  </FormField>

                  <FormField 
                    label="Centered" 
                    className="w-full sm:w-1/2 p-4 flex items-center"
                  >
                    <input
                      type="checkbox"
                      checked={elementsData.layoutOptions.tabOptions?.centered || false}
                      onChange={(e) => handleSettingsChange('layoutOptions', 'tabOptions', 'centered', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-text-color">Center tabs</span>
                  </FormField>

                  {/* Indicator Color */}
                  <FormField
                    label="Indicator Color"
                    error={errors.tabIndicatorColor}
                  >
                    <Select
                      options={[
                        { value: 'primary', label: 'Primary' },
                        { value: 'secondary', label: 'Secondary' },
                        { value: 'inherit', label: 'Inherit' },
                        { value: 'custom', label: 'Custom' },
                      ]}
                      value={{ value: elementsData.layoutOptions.tabOptions?.indicatorColor || 'primary', label: elementsData.layoutOptions.tabOptions?.indicatorColor}}
                      onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'tabOptions', 'indicatorColor', selectedOption.value)}
                      classNames={{
                        control: ({ isFocused }) =>
                          `bg-primary border ${
                            isFocused ? 'border-secondary' : errors.tabIndicatorColor ? 'border-red-500' : 'border-focus-color'
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
                  </FormField>

                  {/* Text Color */}
                  <FormField
                    label="Text Color"
                    error={errors.tabTextColor}
                  >
                    <Select
                      options={[
                        { value: 'primary', label: 'Primary' },
                        { value: 'secondary', label: 'Secondary' },
                        { value: 'inherit', label: 'Inherit' },
                        { value: 'custom', label: 'Custom' },
                      ]}
                      value={{ value: elementsData.layoutOptions.tabOptions?.textColor || 'primary', label: elementsData.layoutOptions.tabOptions?.textColor}}
                      onChange={(selectedOption) => handleSettingsChange('layoutOptions', 'tabOptions', 'textColor', selectedOption.value)}
                      classNames={{
                        control: ({ isFocused }) =>
                          `bg-primary border ${
                            isFocused ? 'border-secondary' : errors.tabTextColor ? 'border-red-500' : 'border-focus-color'
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
                  </FormField>
                </div>
              </div>
            )}

            {/* Fluid Layout Options */}
            {elementsData.layoutOptions.layout === 'fluid' && (
              <div className="fluid-options">
                <h3 className="text-lg font-medium text-text-color mb-4">Fluid Options</h3>
                
                <div className="flex flex-wrap">
                  <FormField 
                    label="Gutter" 
                    error={errors.fluidGutter}
                  >
                    <input
                      type="number"
                      min="0"
                      value={elementsData.layoutOptions.fluidOptions?.gutter || ''}
                      onChange={(e) => handleSettingsChange('layoutOptions','fluidOptions','gutter', parseInt(e.target.value) || 0)}
                      className={`block w-full px-3 py-2 text-text-color secondary-card border rounded ${
                        errors.fluidGutter ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter gutter size"
                    />
                  </FormField>

                  <FormField 
                    label="Justify" 
                    error={errors.fluidJustify}
                  >
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
                            isFocused ? 'border-secondary' : errors.fluidJustify ? 'border-red-500' : 'border-focus-color'
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
                  </FormField>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Style Options */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-text-color mb-4">Style Options</h3>
          <div className="notes-container p-4 bg-secondary-card rounded-lg">
            <div className="flex flex-wrap">
              {/* Background Color */}
              <FormField label="Background Color">
                <ColorPicker
                  value={elementsData.style?.backgroundColor}
                  onChange={(color) => handleSettingsChange('style', null, 'backgroundColor', color)}
                  defaultValue="#ffffff"
                />
              </FormField>

              {/* Text Color */}
              <FormField label="Text Color">
                <ColorPicker
                  value={elementsData.style?.textColor}
                  onChange={(color) => handleSettingsChange('style', null, 'textColor', color)}
                  defaultValue="#000000"
                />
              </FormField>

              {/* Text Muted Color */}
              <FormField label="Text Muted Color">
                <ColorPicker
                  value={elementsData.style?.textMutedColor}
                  onChange={(color) => handleSettingsChange('style', null, 'textMutedColor', color)}
                  defaultValue="#6b7280"
                />
              </FormField>

              {/* Header Font Family */}
              <FormField label="Header Font Family">
                <Select
                  options={[
                    { value: 'Times New Roman', label: 'Times New Roman' },
                    { value: 'Arial', label: 'Arial' },
                    { value: 'Helvetica', label: 'Helvetica' },
                    { value: 'Georgia', label: 'Georgia' },
                    { value: 'Verdana', label: 'Verdana' },
                    { value: 'Courier New', label: 'Courier New' },
                    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
                    { value: 'Impact', label: 'Impact' },
                    { value: 'Comic Sans MS', label: 'Comic Sans MS' },
                    { value: 'Palatino', label: 'Palatino' },
                    { value: 'Garamond', label: 'Garamond' },
                    { value: 'Bookman', label: 'Bookman' },
                    { value: 'Avant Garde', label: 'Avant Garde' },
                    { value: 'custom', label: 'Custom' },
                  ]}
                  value={{ value: elementsData.style?.headerFontFamily || 'Times New Roman', label: elementsData.style?.headerFontFamily || 'Times New Roman'}}
                  onChange={(selectedOption) => {
                    if (selectedOption.value === 'custom') {
                      // Allow custom input
                      handleSettingsChange('style', null, 'headerFontFamily', '');
                    } else {
                      handleSettingsChange('style', null, 'headerFontFamily', selectedOption.value);
                    }
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
                {elementsData.style?.headerFontFamily === '' && (
                  <input
                    type="text"
                    value={elementsData.style?.headerFontFamily || ''}
                    onChange={(e) => handleSettingsChange('style', null, 'headerFontFamily', e.target.value)}
                    className="block w-full px-3 py-2 text-text-color secondary-card border rounded mt-2"
                    placeholder="Enter custom font family"
                  />
                )}
              </FormField>

              {/* Text Font Family */}
              <FormField label="Text Font Family">
                <Select
                  options={[
                    { value: 'Times New Roman', label: 'Times New Roman' },
                    { value: 'Arial', label: 'Arial' },
                    { value: 'Helvetica', label: 'Helvetica' },
                    { value: 'Georgia', label: 'Georgia' },
                    { value: 'Verdana', label: 'Verdana' },
                    { value: 'Courier New', label: 'Courier New' },
                    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
                    { value: 'Impact', label: 'Impact' },
                    { value: 'Comic Sans MS', label: 'Comic Sans MS' },
                    { value: 'Palatino', label: 'Palatino' },
                    { value: 'Garamond', label: 'Garamond' },
                    { value: 'Bookman', label: 'Bookman' },
                    { value: 'Avant Garde', label: 'Avant Garde' },
                    { value: 'custom', label: 'Custom' },
                  ]}
                  value={{ value: elementsData.style?.textFontFamily || 'Times New Roman', label: elementsData.style?.textFontFamily || 'Times New Roman'}}
                  onChange={(selectedOption) => {
                    if (selectedOption.value === 'custom') {
                      // Allow custom input
                      handleSettingsChange('style', null, 'textFontFamily', '');
                    } else {
                      handleSettingsChange('style', null, 'textFontFamily', selectedOption.value);
                    }
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
                {elementsData.style?.textFontFamily === '' && (
                  <input
                    type="text"
                    value={elementsData.style?.textFontFamily || ''}
                    onChange={(e) => handleSettingsChange('style', null, 'textFontFamily', e.target.value)}
                    className="block w-full px-3 py-2 text-text-color secondary-card border rounded mt-2"
                    placeholder="Enter custom font family"
                  />
                )}
              </FormField>

              {/* Header Font Size */}
              <FormField label="Header Font Size">
                <input
                  type="text"
                  value={elementsData.style?.headerFontSize || '24px'}
                  onChange={(e) => handleSettingsChange('style', null, 'headerFontSize', e.target.value)}
                  className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
                  placeholder="e.g., 24px, 1.5rem, 2em"
                />
              </FormField>

              {/* Text Font Size */}
              <FormField label="Text Font Size">
                <input
                  type="text"
                  value={elementsData.style?.textFontSize || '16px'}
                  onChange={(e) => handleSettingsChange('style', null, 'textFontSize', e.target.value)}
                  className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
                  placeholder="e.g., 16px, 1rem, 1em"
                />
              </FormField>

              {/* Border Radius */}
              <FormField label="Border Radius">
                <input
                  type="text"
                  value={elementsData.style?.borderRadius || '0px'}
                  onChange={(e) => handleSettingsChange('style', null, 'borderRadius', e.target.value)}
                  className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
                  placeholder="e.g., 8px, 1rem, 50%"
                />
              </FormField>

              {/* Padding */}
              <FormField label="Padding">
                <input
                  type="text"
                  value={elementsData.style?.padding || '0px'}
                  onChange={(e) => handleSettingsChange('style', null, 'padding', e.target.value)}
                  className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
                  placeholder="e.g., 16px, 1rem 2rem, 10px 15px 20px 25px"
                />
              </FormField>

              {/* Custom CSS */}
              <FormField label="Custom CSS" className="w-full p-4">
                <textarea
                  value={elementsData.style?.customCSS || ''}
                  onChange={(e) => handleSettingsChange('style', null, 'customCSS', e.target.value)}
                  className="block w-full px-3 py-2 text-text-color secondary-card border rounded"
                  rows="4"
                  placeholder="Enter custom CSS rules (e.g., .container { margin: 10px; })"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Elements Section */}
        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-text-color mb-4 border-b border-border pb-2">
            Container Elements
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Select elements to include in this container. You can drag and drop to reorder them.
          </p>
          <div className="mb-6">
            <Select
              options={elementData?.elements?.map((element) => ({
                value: element._id,
                label: `${element.referenceName} - ${getElementDescription(element.description)}`,
                element: element
              })) || []}
              onChange={(selectedOption) => handleAddItem(selectedOption)}
              isLoading={isElementLoading}
              placeholder="Select an element to add..."
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

          {elementsData.items.length > 0 ? (
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">
                Selected Elements ({elementsData.items.length})
              </h4>
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={elementsData.items.map((_, index) => index)}>
                  <div className="space-y-3">
                    {elementsData.items.map((item, index) => (
                      <SortableItem
                        key={index}
                        id={index}
                        index={index}
                        handleRemove={handleRemoveItem}
                        item={item}
                        element={elementData}
                        navigate={navigate}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm">No elements selected</p>
              <p className="text-xs text-gray-400 mt-1">Use the dropdown above to add elements to this container</p>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-border p-4">
          <button
            type="button"
            onClick={() => navigate('/store/appmanagement/container')}
            className="bg-gray-600 text-btn-text-color px-6 py-2 rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
          {renderSubmitButtons()}
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default ContainerForm;