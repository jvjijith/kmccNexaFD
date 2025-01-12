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
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false); // New state to toggle title edit mode
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus(); // Automatically focus the input field when editing
    }
  }, [isEditingTitle]);

  const { data: productData, refetch: refetchProducts, isLoading: productLoading } = useGetData("products", "/product", {
    params: { page: currentPage, limit: productsPerPage },
  });
  
  const { data: catalogData, refetch: refetchCatalog, isLoading: catalogLoading } = useGetData("catalog", `/catalogues/${catalogId}`);
  const { mutate: editCatalog, isPending: isEditing, error: editError } = usePutData("editCatalog", `/catalogues/update/${catalogId}`);

  useEffect(() => {
    if (catalogData) {
      setCatalogName(catalogData?.name || "");
      setDescription(catalogData?.description || "");
      setSelectedProducts(catalogData?.productIds?.map(product => product._id) || []);
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

  const handleSaveCatalog = () => {
    editCatalog({
      name: catalogName,
      description,
      catType: "manual",
      productIds: selectedProducts,
      customParams: [],
    }, {
      onSuccess: () => {
        navigate(`/product/catalog`);
      },
      onError: (error) => {
        console.error('Error updating catalog:', error);
      }
    });
  };

  if (productLoading || catalogLoading) {
    return <LoadingScreen />;
  }

  const totalPages = Math.ceil((productData?.pagination?.totalCount || 0) / productsPerPage);
  const currentProducts = productData?.products || [];

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEditTitle = () => {
    setIsEditingTitle(!isEditingTitle); // Toggle edit mode
  };

  return (
    <div className="flex min-h-screen text-text-color">
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative flex items-center">
            {isEditingTitle ? (
              <input
                ref={titleInputRef} // Attach the ref to the input field
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
            {/* <FaPlusSquare className="mr-2" /> */}
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

        {/* Content Area */}
        <div className="flex space-x-8">
          {/* Catalog Preview */}
          <div className="w-1/3 border-b border-border secondary-card p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Catalog Preview</h2>
            <ul className="space-y-4">
              {selectedProducts.map((productId) => {
                const product = productData?.products.find((p) => p._id === productId);
                return (
                  <li key={productId} className="flex items-center justify-between p-2 bg-secondary-card rounded">
                     {/* Image Section on the Left */}
                      <div className="w-1/3 mr-2">
                        <img
                          src={product.images?.[0]?.url || `/placeholder.png`} // Display product image or placeholder
                          alt={product.name}
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
          </div>

          {/* Product Catalog */}
          <div className="flex-1 border-b border-border secondary-card p-4 rounded-lg">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Product</h2>
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

            {/* Products with Image Holders */}
            <div className="grid grid-cols-3 gap-4">
  {currentProducts.map((product) => (
    <div key={product._id} className="p-4 bg-secondary-card rounded flex items-start">
      {/* Image Section on the Left */}
      <div className="w-1/3 mr-4">
        <img
          src={product.images?.[0]?.url || '/placeholder.png'} // Display product image or placeholder
          alt={product.name}
          className="w-full h-10 object-cover rounded"
        />
      </div>
      
      {/* Product Details on the Right */}
      <div className="w-2/3">
        <p className="font-semibold">{product.name}</p>
        <p className="text-sm text-gray-400">{product.description}</p>
        {selectedProducts.includes(product._id) ? (
          <div className="flex flex-wrap justify-end">
          <button className="mt-2 text-text-color px-4 py-2 rounded flex items-center bg-gray-500" disabled>
            <FaCheck />
          </button>
          </div>
        ) : (
          <div className="flex flex-wrap justify-end">
          <button
            className="mt-2 bg-primary-button-color text-btn-text-color px-4 py-2 rounded flex items-center"
            onClick={() => handleAddProduct(product._id)}
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
