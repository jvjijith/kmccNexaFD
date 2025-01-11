import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Table } from "flowbite-react";
import { useGetData, usePutData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import PopUpModal from "../ui/modal/modal";
import { ToastContainer } from "react-toastify";
import PriceForm from "./priceForm";

const ProductTable = () => {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust as per your API response limit
  
  const { data: productData, refetch: refetchProducts, isLoading } = useGetData("products", `/product?page=${currentPage}&limit=${itemsPerPage}`);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const { mutate: deactivateProduct } = usePutData(
    "deactivateProduct",
    `/product/deactivate/${selectedProduct?._id}`,
    {
      onSuccess: () => refetchProducts(),
    }
  );
  
  const { mutate: activateProduct } = usePutData(
    "activateProduct",
    `/product/activate/${selectedProduct?._id}`,
    {
      onSuccess: () => refetchProducts(),
    }
  );

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleDeactivateProduct = (product) => {
    setSelectedProduct(product);
    deactivateProduct();
  };

  const handleActivateProduct = (product) => {
    setSelectedProduct(product);
    activateProduct();
  };

  const handleAddVariants = (product) => {
    navigate(`/variant/add`, { state: { product } });
  };

  const handleShowVariants = (product) => {
    navigate(`/variant/list`, { state: { product } });
  };

  const handleViewDetails = (product) => {
    navigate(`/product/profile/${product._id}/productdetails`, { state: { product } });
  };

   // Pagination handler
   const handlePageChange = (page) => {
    setCurrentPage(page);  // Update the current page state
  };

  // Fetch new data when currentPage changes
  useEffect(() => {
    refetchProducts();  // Refetch data after currentPage is updated
  }, [currentPage, refetchProducts]);  // Refetch when currentPage changes


  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  const totalProducts = productData?.pagination?.totalCount || 0;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Name</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Category</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Brand</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Stock</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Sub Brand</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Status</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Action</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {productData?.products.map((product) => (
            <Table.Row key={product._id} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                {product.name}
              </Table.Cell>
              <Table.Cell className="border-borderwhitespace-nowrap text-text-color">
                {product.category?.categoryName}
              </Table.Cell>
              <Table.Cell className="border-borderwhitespace-nowrap text-text-color">
                {product.brand?.name}
              </Table.Cell>
              <Table.Cell className="border-borderwhitespace-nowrap text-text-color">
                {product.stock}
              </Table.Cell>
              <Table.Cell className="border-borderwhitespace-nowrap text-text-color">
                {product.subBrand?.subBrandName}
              </Table.Cell>
              <Table.Cell className={`whitespace-nowrap ${product.active ? "text-green-500" : "text-red-500"}`}>
                {product.active ? "Active" : "Inactive"}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => handleViewDetails(product)}
                  >
                    Details
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => navigate(`/product/edit`, { state: { product } })}
                  >
                    Edit Product
                  </Dropdown.Item>
                  {product.active ? (
                    <Dropdown.Item
                      className="text-text-color hover:!bg-orange-600"
                      onClick={() => handleDeactivateProduct(product)}
                    >
                      Deactivate Product
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item
                      className="text-text-color hover:!bg-orange-600"
                      onClick={() => handleActivateProduct(product)}
                    >
                      Activate Product
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => handleShowVariants(product)}
                  >
                    Show Variants
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => openModal(product)}
                  >
                    Add Price
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => handleAddVariants(product)}
                  >
                    Add Variants
                  </Dropdown.Item>
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

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

      <PopUpModal isOpen={isModalOpen} onClose={closeModal} title={"Add Price"}>
        <PriceForm closeModal={closeModal} productId={selectedProduct?._id} />
      </PopUpModal>

      {isApiLoading && <LoadingScreen />}
      <ToastContainer />
    </div>
  );
};

export default ProductTable;
