import React, { useState, useEffect, useRef } from "react";
import { useGetData, usePutData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import { useNavigate } from "react-router";
import { FaSignOutAlt, FaList, FaPlay, FaSearch, FaPlusSquare, FaTimes, FaCheck, FaPencilAlt } from "react-icons/fa"; // Icons for UI

function Catalog({ catalogId }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [catalogName, setCatalogName] = useState("");
  const [description, setDescription] = useState("");
  const [catType, setCatType] = useState("manual"); // Default to manual
  const [dataType, setDataType] = useState("product"); // Default to product
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]); // Added for eventIds
  const [customParams, setCustomParams] = useState([]); // For custom parameters
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const { data: productData, refetch: refetchProducts, isLoading: productLoading } = useGetData("products", "/product", {
    params: { page: currentPage, limit: productsPerPage },
  });
  
  // Add event data fetching if needed
  const { data: eventData, isLoading: eventLoading } = useGetData("event", `/events`, {
    params: { page: currentPage, limit: productsPerPage },
  });
  
  const { data: catalogData, refetch: refetchCatalog, isLoading: catalogLoading } = useGetData("catalog", `/catalogues/${catalogId}`);
  const { mutate: editCatalog, isPending: isEditing, error: editError } = usePutData("editCatalog", `/catalogues/update/${catalogId}`);

  useEffect(() => {
    if (catalogData) {
      setCatalogName(catalogData?.name || "");
      setDescription(catalogData?.description || "");
      setCatType(catalogData?.catType || "manual");
      setDataType(catalogData?.dataType || "product");
      setSelectedProducts(catalogData?.productIds || []);
      setSelectedEvents(catalogData?.eventIds || []);
      setCustomParams(catalogData?.customParams || []);
    }
  }, [catalogData]);

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
    editCatalog({
      name: catalogName,
      description,
      catType,
      dataType,
      productIds: dataType === "product" ? selectedProducts : [],
      eventIds: dataType === "event" ? selectedEvents : [],
      customParams,
    }, {
      onSuccess: () => {
        navigate(`/product/catalog`);
      },
      onError: (error) => {
        console.error('Error updating catalog:', error);
      }
    });
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
    ? (productData?.products || []) 
    : (eventData?.events || []);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEditTitle = () => {
    setIsEditingTitle(!isEditingTitle);
  };

  console.log("selectedProducts",selectedProducts);
  console.log("selectedEvents",selectedEvents);
  console.log("catalogData",catalogData);
  
  return (
    <div className="flex min-h-screen text-text-color">
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative flex items-center">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                className="text-3xl bg-transparent border-none focus:ring-0 focus:outline-none pr-8 w-full max-w-xs italic"
                value={catalogName}
                onChange={(e) => setCatalogName(e.target.value)}
              />
            ) : (
              <p className="text-3xl font-bold pr-8">{catalogName}</p>
            )}
            <FaPencilAlt
              className="absolute top-0 right-0 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
              onClick={handleEditTitle}
            />
          </div>

          <button className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded flex items-center" onClick={handleSaveCatalog}>
            Save Catalog
          </button>
        </div>

        {/* Description */}
        <label className="float-left inline-block mb-2 text-text-color primary-text">
          &nbsp;Catalog Description &nbsp;
        </label>
        <textarea
          className="w-full p-2 mb-4 secondary-card border-none rounded focus:ring-2 focus:ring-green-400 text-text-color"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Catalog Description"
        />

        {/* Catalog Type and Data Type Selection */}
        <div className="flex mb-4 space-x-4">
          <div className="w-1/2">
            <label className="block mb-2 text-text-color primary-text">Catalog Type</label>
            <select
              className="w-full p-2 secondary-card border-none rounded focus:ring-2 focus:ring-green-400 text-text-color"
              value={catType}
              onChange={(e) => setCatType(e.target.value)}
            >
              <option value="manual">Manual</option>
              <option value="smart">Smart</option>
            </select>
          </div>
          <div className="w-1/2">
            <label className="block mb-2 text-text-color primary-text">Data Type</label>
            <select
              className="w-full p-2 secondary-card border-none rounded focus:ring-2 focus:ring-green-400 text-text-color"
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
            >
              <option value="product">Product</option>
              <option value="event">Event</option>
            </select>
          </div>
        </div>

        {/* Custom Parameters Section */}
        <div className="mb-6 secondary-card p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Custom Parameters</h2>
            <button 
              className="bg-primary-button-color text-btn-text-color px-4 py-2 rounded flex items-center"
              onClick={handleAddCustomParam}
            >
              <FaPlusSquare className="mr-2" />
              Add Parameter
            </button>
          </div>
          
          {customParams.length > 0 ? (
            <div className="space-y-4">
              {customParams.map((param, index) => (
                <div key={index} className="flex space-x-4 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Field Name"
                      className="w-full p-2 rounded border-b border-border secondary-card border-none focus:ring-2 focus:ring-green-400 text-text-color"
                      value={param.fieldName}
                      onChange={(e) => handleUpdateCustomParam(index, 'fieldName', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <select
                      className="w-full p-2 rounded border-b border-border secondary-card border-none focus:ring-2 focus:ring-green-400 text-text-color"
                      value={param.fieldType}
                      onChange={(e) => handleUpdateCustomParam(index, 'fieldType', e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="dropdown">Dropdown</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Field Value"
                      className="w-full p-2 rounded border-b border-border secondary-card border-none focus:ring-2 focus:ring-green-400 text-text-color"
                      value={param.fieldValue}
                      onChange={(e) => handleUpdateCustomParam(index, 'fieldValue', e.target.value)}
                    />
                  </div>
                  <button 
                    className="text-red-500 hover:text-red-600 p-2" 
                    onClick={() => handleRemoveCustomParam(index)}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No custom parameters added yet.</p>
          )}
        </div>

        {/* Content Area */}
        <div className="flex space-x-8">
          {/* Catalog Preview */}
          <div className="w-1/3 border-b border-border secondary-card p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Catalog Preview</h2>
            {dataType === "product" ? (
              <ul className="space-y-4">
                {selectedProducts.map((productId) => {
                  const product = productData?.products.find((p) => p._id === productId);
                  return (
                    <li key={productId} className="flex items-center justify-between p-2 bg-secondary-card rounded">
                      <div className="w-1/3 mr-2">
                        <img
                          src={product?.images?.[0]?.url || `/placeholder.png`}
                          alt={product?.name}
                          className="w-8 h-10 object-cover rounded"
                        />
                      </div>
                      <div className="justify-start">
                        <p className="font-semibold">{product?.name}</p>
                        <p className="text-sm text-gray-400">{product?.description}</p>
                      </div>
                      <button className="text-red-500 hover:text-red-600" onClick={() => handleRemoveProduct(productId)}>
                        <FaTimes />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="space-y-4">
                {selectedEvents.map((eventId) => {
                  const event = eventData?.events.find((e) => e._id === eventId);
                  return (
                    <li key={eventId} className="flex items-center justify-between p-2 bg-secondary-card rounded">
                      <div className="w-1/3 mr-2">
                        <img
                          src={event?.images?.[0]?.url || `/placeholder.png`}
                          alt={event?.name}
                          className="w-8 h-10 object-cover rounded"
                        />
                      </div>
                      <div className="justify-start">
                        <p className="font-semibold">{event?.name}</p>
                        <p className="text-sm text-gray-400">{event?.description}</p>
                      </div>
                      <button className="text-red-500 hover:text-red-600" onClick={() => handleRemoveEvent(eventId)}>
                        <FaTimes />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Products or Events Catalog */}
          <div className="flex-1 border-b border-border secondary-card p-4 rounded-lg">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">{dataType === "product" ? "Products" : "Events"}</h2>
            </div>

            {/* Search and Tabs */}
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <FaSearch className="absolute top-2 left-2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 rounded border-b border-border secondary-card border-none focus:ring-2 focus:ring-green-400 text-text-color"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-3 gap-4">
              {currentItems.map((item) => (
                <div key={item._id} className="p-4 bg-secondary-card rounded flex items-start">
                  {/* Image Section */}
                  <div className="w-1/3 mr-4">
                    <img
                      src={item.images?.[0]?.url || '/placeholder.png'}
                      alt={item.name}
                      className="w-full h-10 object-cover rounded"
                    />
                  </div>
                  
                  {/* Item Details */}
                  <div className="w-2/3">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-400">{item.description}</p>
                    {(dataType === "product" && selectedProducts.includes(item._id)) || 
                     (dataType === "event" && selectedEvents.includes(item._id)) ? (
                      <div className="flex flex-wrap justify-end">
                      <button className="mt-2 text-text-color px-4 py-2 rounded flex items-center bg-gray-500" disabled>
                        <FaCheck />
                      </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-end">
                      <button
                        className="mt-2 bg-primary-button-color text-btn-text-color px-4 py-2 rounded flex items-center"
                        onClick={() => {
                          dataType === "product" 
                            ? handleAddProduct(item._id) 
                            : handleAddEvent(item._id);
                        }}
                      >
                        <FaPlusSquare />
                      </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? "bg-primary-button-color" : "bg-gray-700"} text-btn-text-color`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Catalog;