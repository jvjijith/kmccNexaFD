import React, { useState, useEffect } from "react";
import { FaSignOutAlt, FaList, FaPlay, FaSearch, FaPlusSquare, FaTimes, FaCheck } from "react-icons/fa"; // Icons for UI
import { useGetData, usePutData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import { useNavigate } from "react-router";

function Catalog({ catalogId }) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [catalogName, setCatalogName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6; // Adjust the number of products per page here

  // Fetch product and catalog data
  const { data: productData, refetch: refetchProducts, isLoading: productLoading } = useGetData("products", "/product", {
    params: { page: currentPage, limit: productsPerPage }, // Pass pagination params here
  });
  
  const { data: catalogData, refetch: refetchCatalog, isLoading: catalogLoading } = useGetData("catalog", `/catalogues/${catalogId}`);

  // Edit catalog mutation
  const { mutate: editCatalog, isPending: isEditing, error: editError } = usePutData("editCatalog", `/catalogues/update/${catalogId}`);

  useEffect(() => {
    if (catalogData) {
      setCatalogName(catalogData?.name || "");
      setDescription(catalogData?.description || "");
      setSelectedProducts(catalogData?.productIds?.map(product => product._id) || []);
    }
  }, [catalogData]);

  // Handle adding/removing products to/from catalog
  const handleAddProduct = (productId) => {
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((id) => id !== productId));
  };

  // Save catalog details
  const handleSaveCatalog = () => {
    editCatalog({
      name: catalogName,
      description,
      catType: "manual",
      productIds: selectedProducts,
      customParams: [],
    }, {
      onSuccess: (response) => {
        console.log('Catalog updated successfully:', response);
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

  // Pagination data from the API response
  const { limit, totalCount } = productData?.pagination || { limit: 6, totalCount: 0 };
  const totalPages = Math.ceil(totalCount / limit);

  // Render products for the current page
  const currentProducts = productData?.products || [];

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex min-h-screen text-white">
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            className="text-3xl font-bold bg-transparent border-none focus:ring-0"
            value={catalogName}
            onChange={(e) => setCatalogName(e.target.value)}
            placeholder="Catalog Name"
          />
          <button className="bg-nexa-orange text-white px-4 py-2 rounded flex items-center" onClick={handleSaveCatalog}>
            <FaPlusSquare className="mr-2" />
            Save Catalog
          </button>
        </div>

        {/* Description */}
        <textarea
          className="w-full p-2 mb-4 bg-black border-none rounded focus:ring-2 focus:ring-green-400 text-white"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Catalog Description"
        />

        {/* Search and Tabs */}
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <FaSearch className="absolute top-2 left-2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded border-b border-nexa-gray bg-black border-none focus:ring-2 focus:ring-green-400 text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex space-x-8">
          {/* Catalog Preview */}
          <div className="w-1/3 border-b border-nexa-gray bg-black p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Catalog Preview</h2>
            <ul className="space-y-4">
              {selectedProducts.map((productId) => {
                const product = productData?.products.find((p) => p._id === productId);
                return (
                  <li key={productId} className="flex items-center justify-between p-2 bg-sidebar-card-top rounded">
                    <div>
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
          <div className="flex-1 border-b border-nexa-gray bg-black p-4 rounded-lg">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Product</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {currentProducts.map((product) => (
                <div key={product._id} className="p-4 bg-sidebar-card-top rounded">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-400">{product.description}</p>
                  {selectedProducts.includes(product._id) ? (
                    <button className="mt-2 text-white px-4 py-2 rounded flex items-center bg-gray-500" disabled>
                      <FaCheck className="mr-2" /> Added
                    </button>
                  ) : (
                    <button
                      className="mt-2 bg-nexa-orange text-white px-4 py-2 rounded flex items-center"
                      onClick={() => handleAddProduct(product._id)}
                    >
                      <FaPlusSquare className="mr-2" /> Add
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? "bg-nexa-orange" : "bg-gray-700"} text-white`}
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
