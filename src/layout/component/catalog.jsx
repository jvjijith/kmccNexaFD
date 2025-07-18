import React, { useState, useEffect, useRef } from "react";
import { useGetData, usePutData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import { useNavigate } from "react-router";
import {
  FaList,
  FaSearch,
  FaPlusSquare,
  FaTimes,
  FaCheck,
  FaPencilAlt,
  FaGripVertical,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSave,
  FaArrowLeft
} from "react-icons/fa";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component for Drag and Drop
function SortableItem({ id, children, disabled = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center">
        {!disabled && (
          <div {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600">
            <FaGripVertical />
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

// Validation functions
const validateCatalogName = (name) => {
  if (!name || name.trim().length === 0) {
    return "Catalog name is required";
  }
  if (name.trim().length < 3) {
    return "Catalog name must be at least 3 characters long";
  }
  if (name.trim().length > 100) {
    return "Catalog name must be less than 100 characters";
  }
  return null;
};

const validateDescription = (description) => {
  if (!description || description.trim().length === 0) {
    return "Description is required";
  }
  if (description.trim().length < 10) {
    return "Description must be at least 10 characters long";
  }
  if (description.trim().length > 500) {
    return "Description must be less than 500 characters";
  }
  return null;
};

const validateCustomParam = (param) => {
  const errors = {};
  if (!param.fieldName || param.fieldName.trim().length === 0) {
    errors.fieldName = "Field name is required";
  }
  if (!param.fieldValue || param.fieldValue.trim().length === 0) {
    errors.fieldValue = "Field value is required";
  }
  return Object.keys(errors).length > 0 ? errors : null;
};

function Catalog({ catalogId }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [catalogName, setCatalogName] = useState("");
  const [description, setDescription] = useState("");
  const [catType, setCatType] = useState("manual");
  const [dataType, setDataType] = useState("product");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [customParams, setCustomParams] = useState([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  
  const productsPerPage = 6;
  const titleInputRef = useRef(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  // API hooks
  const { data: productData, isLoading: productLoading } = useGetData("products", "/product", {
    params: { page: currentPage, limit: productsPerPage, search: search },
  });

  const { data: eventData, isLoading: eventLoading } = useGetData("event", `/events`, {
    params: { page: currentPage, limit: productsPerPage, search: search },
  });

  const { data: catalogData, isLoading: catalogLoading } = useGetData("catalog", `/catalogues/${catalogId}`);
  const { mutate: editCatalog, isPending: isEditing } = usePutData("editCatalog", `/catalogues/update/${catalogId}`);

  // Load catalog data
  useEffect(() => {
    if (catalogData) {
      setCatalogName(catalogData?.name || "");
      setDescription(catalogData?.description || "");
      setCatType(catalogData?.catType || "manual");
      setDataType(catalogData?.dataType || "product");
      setSelectedProducts(catalogData?.productIds || []);
      setSelectedEvents(catalogData?.eventIds || []);
      setCustomParams(catalogData?.customParams || []);
      setHasUnsavedChanges(false);
    }
  }, [catalogData]);

  // Form validation
  useEffect(() => {
    const nameError = validateCatalogName(catalogName);
    const descError = validateDescription(description);
    const hasSelectedItems = (dataType === "product" && selectedProducts.length > 0) || 
                            (dataType === "event" && selectedEvents.length > 0);
    
    const customParamErrors = customParams.reduce((acc, param, index) => {
      const paramError = validateCustomParam(param);
      if (paramError) {
        acc[`customParam_${index}`] = paramError;
      }
      return acc;
    }, {});

    const newErrors = {
      ...nameError && { catalogName: nameError },
      ...descError && { description: descError },
      ...!hasSelectedItems && { items: `At least one ${dataType} must be selected` },
      ...customParamErrors
    };

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  }, [catalogName, description, selectedProducts, selectedEvents, customParams, dataType]);

  // Track unsaved changes
  useEffect(() => {
    if (catalogData) {
      const hasChanges = 
        catalogName !== (catalogData?.name || "") ||
        description !== (catalogData?.description || "") ||
        catType !== (catalogData?.catType || "manual") ||
        dataType !== (catalogData?.dataType || "product") ||
        JSON.stringify(selectedProducts) !== JSON.stringify(catalogData?.productIds || []) ||
        JSON.stringify(selectedEvents) !== JSON.stringify(catalogData?.eventIds || []) ||
        JSON.stringify(customParams) !== JSON.stringify(catalogData?.customParams || []);
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [catalogName, description, catType, dataType, selectedProducts, selectedEvents, customParams, catalogData]);

  // Handle drag end for reordering
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      if (dataType === "product") {
        setSelectedProducts((items) => {
          const oldIndex = items.indexOf(active.id);
          const newIndex = items.indexOf(over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      } else {
        setSelectedEvents((items) => {
          const oldIndex = items.indexOf(active.id);
          const newIndex = items.indexOf(over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  };

  const handleAddProduct = (productId) => {
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((id) => id !== productId));
  };

  const handleAddEvent = (eventId) => {
    if (!selectedEvents.includes(eventId)) {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  const handleRemoveEvent = (eventId) => {
    setSelectedEvents(selectedEvents.filter((id) => id !== eventId));
  };

  const handleAddCustomParam = () => {
    setCustomParams([...customParams, { fieldName: "", fieldType: "text", fieldValue: "" }]);
  };

  const handleUpdateCustomParam = (index, field, value) => {
    const updatedParams = [...customParams];
    updatedParams[index][field] = value;
    setCustomParams(updatedParams);
  };

  const handleRemoveCustomParam = (index) => {
    const updatedParams = [...customParams];
    updatedParams.splice(index, 1);
    setCustomParams(updatedParams);
  };

  const handleSaveCatalog = () => {
    if (!isFormValid) {
      return;
    }

    editCatalog({
      name: catalogName.trim(),
      description: description.trim(),
      catType,
      dataType,
      productIds: dataType === "product" ? selectedProducts : [],
      eventIds: dataType === "event" ? selectedEvents : [],
      customParams: customParams.map(param => ({
        ...param,
        fieldName: param.fieldName.trim(),
        fieldValue: param.fieldValue.trim()
      })),
    }, {
      onSuccess: () => {
        setShowSuccess(true);
        setHasUnsavedChanges(false);
        setTimeout(() => {
          navigate(`/product/catalog`);
        }, 1500);
      },
      onError: (error) => {
        console.error('Error updating catalog:', error);
        setErrors({ submit: error.message || 'Failed to save catalog. Please try again.' });
      }
    });
  };

  const handleEditTitle = () => {
    setIsEditingTitle(!isEditingTitle);
  };

  const handleDataTypeChange = (newDataType) => {
    setDataType(newDataType);
    setCurrentPage(1); // Reset pagination when switching data types
  };

  if (productLoading || catalogLoading || (dataType === "event" && eventLoading)) {
    return <LoadingScreen />;
  }

  const totalPages = Math.ceil(
    (dataType === "product" 
      ? (productData?.pagination?.totalCount || 0) 
      : (eventData?.pagination?.totalCount || 0)
    ) / productsPerPage
  );
  
  const currentItems = dataType === "product" 
    ? (productData?.products || []).filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      )
    : (eventData?.events || []).filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      );

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const selectedItems = dataType === "product" ? selectedProducts : selectedEvents;
  const selectedItemsData = selectedItems.map(id => {
    const items = dataType === "product" ? productData?.products : eventData?.events;
    return items?.find(item => item._id === id);
  }).filter(Boolean);

  return (
    <div className="flex min-h-screen text-text-color">
      <div className="flex-1 p-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
            <FaCheck className="mr-2" />
            Catalog saved successfully!
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/product/catalog')}
              className="mr-4 text-gray-400 hover:text-gray-600 p-2"
            >
              <FaArrowLeft size={20} />
            </button>
            <div className="relative flex items-center">
              {isEditingTitle ? (
                <div className="flex flex-col">
                  <input
                    ref={titleInputRef}
                    type="text"
                    className={`text-3xl bg-transparent border-b-2 ${errors.catalogName ? 'border-red-500' : 'border-gray-300'} focus:border-green-400 focus:outline-none pr-8 w-full max-w-xs`}
                    value={catalogName}
                    onChange={(e) => setCatalogName(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  />
                  {errors.catalogName && (
                    <span className="text-red-500 text-sm mt-1">{errors.catalogName}</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col">
                  <h1 className="text-3xl font-bold pr-8">{catalogName || 'Untitled Catalog'}</h1>
                  {errors.catalogName && (
                    <span className="text-red-500 text-sm mt-1">{errors.catalogName}</span>
                  )}
                </div>
              )}
              <FaPencilAlt
                className="absolute top-0 right-0 text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={handleEditTitle}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {hasUnsavedChanges && (
              <div className="flex items-center text-yellow-500 text-sm">
                <FaExclamationTriangle className="mr-1" />
                Unsaved changes
              </div>
            )}
            <button 
              className={`px-6 py-3 rounded-lg flex items-center font-medium transition-all ${
                isFormValid && !isEditing
                  ? 'bg-primary-button-color text-btn-text-color hover:bg-opacity-90' 
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
              onClick={handleSaveCatalog}
              disabled={!isFormValid || isEditing}
            >
              {isEditing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save Catalog
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {errors.submit && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {errors.submit}
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <label className="block mb-2 text-text-color font-medium">
            Catalog Description *
          </label>
          <textarea
            className={`w-full p-3 secondary-card border-2 ${errors.description ? 'border-red-500' : 'border-transparent'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent text-text-color resize-none`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a detailed description of your catalog..."
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description ? (
              <span className="text-red-500 text-sm">{errors.description}</span>
            ) : (
              <span className="text-gray-400 text-sm">
                Provide a clear description to help users understand this catalog
              </span>
            )}
            <span className="text-gray-400 text-sm">{description.length}/500</span>
          </div>
        </div>

        {/* Catalog Type and Data Type Selection */}
        <div className="flex mb-6 space-x-6">
          <div className="flex-1">
            <label className="block mb-2 text-text-color font-medium">Catalog Type</label>
            <select
              className="w-full p-3 secondary-card border-2 border-transparent rounded-lg focus:ring-2 focus:ring-green-400 text-text-color"
              value={catType}
              onChange={(e) => setCatType(e.target.value)}
            >
              <option value="manual">Manual - Manually select items</option>
              <option value="smart">Smart - Auto-populate based on rules</option>
            </select>
            <p className="text-gray-400 text-sm mt-1">
              {catType === "manual" ? "You'll manually choose which items to include" : "Items will be automatically added based on criteria"}
            </p>
          </div>
          <div className="flex-1">
            <label className="block mb-2 text-text-color font-medium">Data Type</label>
            <select
              className="w-full p-3 secondary-card border-2 border-transparent rounded-lg focus:ring-2 focus:ring-green-400 text-text-color"
              value={dataType}
              onChange={(e) => handleDataTypeChange(e.target.value)}
            >
              <option value="product">Products</option>
              <option value="event">Events</option>
            </select>
            <p className="text-gray-400 text-sm mt-1">
              Choose whether this catalog contains products or events
            </p>
          </div>
        </div>

        {/* Custom Parameters Section */}
        <div className="mb-8 secondary-card p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">Custom Parameters</h2>
              <p className="text-gray-400 text-sm">Add custom fields to enhance your catalog</p>
            </div>
            <button 
              className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded-lg flex items-center hover:bg-opacity-90 transition-all"
              onClick={handleAddCustomParam}
            >
              <FaPlusSquare className="mr-2" />
              Add Parameter
            </button>
          </div>
          
          {customParams.length > 0 ? (
            <div className="space-y-4">
              {customParams.map((param, index) => (
                <div key={index} className="p-4 bg-opacity-50 secondary-card rounded-lg">
                  <div className="flex space-x-4 items-start">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Field Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Color, Size, Category"
                        className={`w-full p-2 rounded border-2 ${errors[`customParam_${index}`]?.fieldName ? 'border-red-500' : 'border-transparent'} secondary-card focus:ring-2 focus:ring-green-400 text-text-color`}
                        value={param.fieldName}
                        onChange={(e) => handleUpdateCustomParam(index, 'fieldName', e.target.value)}
                      />
                      {errors[`customParam_${index}`]?.fieldName && (
                        <span className="text-red-500 text-xs mt-1">{errors[`customParam_${index}`].fieldName}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Field Type</label>
                      <select
                        className="w-full p-2 rounded border-2 border-transparent secondary-card focus:ring-2 focus:ring-green-400 text-text-color"
                        value={param.fieldType}
                        onChange={(e) => handleUpdateCustomParam(index, 'fieldType', e.target.value)}
                      >
                        <option value="text">Text Input</option>
                        <option value="dropdown">Dropdown</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        {param.fieldType === 'dropdown' ? 'Options (comma-separated)' : 'Default Value'}
                      </label>
                      <input
                        type="text"
                        placeholder={param.fieldType === 'dropdown' ? 'Red, Blue, Green' : 'Default value'}
                        className={`w-full p-2 rounded border-2 ${errors[`customParam_${index}`]?.fieldValue ? 'border-red-500' : 'border-transparent'} secondary-card focus:ring-2 focus:ring-green-400 text-text-color`}
                        value={param.fieldValue}
                        onChange={(e) => handleUpdateCustomParam(index, 'fieldValue', e.target.value)}
                      />
                      {errors[`customParam_${index}`]?.fieldValue && (
                        <span className="text-red-500 text-xs mt-1">{errors[`customParam_${index}`].fieldValue}</span>
                      )}
                    </div>
                    <button 
                      className="text-red-500 hover:text-red-600 p-2 mt-6 hover:bg-red-100 rounded transition-all" 
                      onClick={() => handleRemoveCustomParam(index)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FaInfoCircle className="mx-auto mb-2 text-2xl" />
              <p>No custom parameters added yet.</p>
              <p className="text-sm">Add parameters to customize your catalog structure</p>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex space-x-8">
          {/* Catalog Preview with Drag and Drop */}
          <div className="w-1/3 secondary-card p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Catalog Preview</h2>
              <span className="text-sm text-gray-400">
                {selectedItems.length} {dataType}(s) selected
              </span>
            </div>
            
            {errors.items && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center text-sm">
                <FaExclamationTriangle className="mr-2" />
                {errors.items}
              </div>
            )}

            {selectedItems.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={selectedItems} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {selectedItemsData.map((item) => (
                      <SortableItem key={item._id} id={item._id}>
                        <div className="flex items-center p-3 bg-opacity-50 secondary-card rounded-lg">
                          <div className="w-12 h-12 mr-3 flex-shrink-0">
                            <img
                              src={item?.images?.[0]?.url || `/placeholder.png`}
                              alt={item?.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{item?.name}</p>
                            {/* <p className="text-sm text-gray-400 truncate">{item?.description}</p> */}
                          </div>
                          <button 
                            className="text-red-500 hover:text-red-600 p-2 hover:bg-red-100 rounded transition-all ml-2" 
                            onClick={() => dataType === "product" ? handleRemoveProduct(item._id) : handleRemoveEvent(item._id)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FaList className="mx-auto mb-3 text-3xl" />
                <p className="font-medium">No {dataType}s selected</p>
                <p className="text-sm">Add {dataType}s from the catalog to see them here</p>
                <p className="text-xs mt-2">You can drag and drop to reorder items</p>
              </div>
            )}
          </div>

          {/* Products or Events Catalog */}
          <div className="flex-1 secondary-card p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">{dataType === "product" ? "Products" : "Events"} Catalog</h2>
                <p className="text-gray-400 text-sm">Select {dataType}s to add to your catalog</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <FaSearch className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${dataType}s...`}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-transparent secondary-card focus:ring-2 focus:ring-green-400 text-text-color"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Items Grid */}
            {currentItems.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {currentItems.map((item) => {
                  const isSelected = selectedItems.includes(item._id);
                  return (
                    <div key={item._id} className="p-4 bg-opacity-50 secondary-card rounded-lg hover:bg-opacity-70 transition-all">
                      <div className="flex items-start space-x-3">
                        <div className="w-16 h-16 flex-shrink-0">
                          <img
                            src={item.images?.[0]?.url || '/placeholder.png'}
                            alt={item.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{item.name}</p>
                          <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                          
                          <div className="mt-3">
                            {isSelected ? (
                              <button className="w-full bg-gray-500 text-white px-3 py-2 rounded flex items-center justify-center" disabled>
                                <FaCheck className="mr-2" />
                                Added
                              </button>
                            ) : (
                              <button
                                className="w-full bg-primary-button-color text-btn-text-color px-3 py-2 rounded flex items-center justify-center hover:bg-opacity-90 transition-all"
                                onClick={() => {
                                  dataType === "product" 
                                    ? handleAddProduct(item._id) 
                                    : handleAddEvent(item._id);
                                }}
                              >
                                <FaPlusSquare className="mr-2" />
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FaSearch className="mx-auto mb-3 text-3xl" />
                <p className="font-medium">No {dataType}s found</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded bg-gray-700 text-btn-text-color disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-all"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-2 rounded transition-all ${
                      currentPage === index + 1 
                        ? "bg-primary-button-color text-btn-text-color" 
                        : "bg-gray-700 text-btn-text-color hover:bg-gray-600"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded bg-gray-700 text-btn-text-color disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Catalog;