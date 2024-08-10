import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Table } from "flowbite-react";
import { useGetData, usePutData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import PopUpModal from "../ui/modal/modal";
import { ToastContainer } from "react-toastify";

const ProductTable = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isApiLoading, setIsApiLoading] = useState(false);

  const { data: productData, refetch: refetchProducts } = useGetData("products", "/product");



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
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDeactivateProduct = (product) => {
    setSelectedProduct(product);
    deactivateProduct();
  };

  const handleActivateProduct = (product) => {
    setSelectedProduct(product);
    activateProduct();
  };

  const handleAddVariants = (productId) => {
    navigate(`/variant/add`, { state: { productId } });
  };

  const handleShowVariants = (productId) => {
    navigate(`/variant/list`, { state: { productId } });
  };

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white">Name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Category</Table.HeadCell>
          {/* <Table.HeadCell className="border-gray-700 bg-black text-white">Sub Category</Table.HeadCell> */}
          <Table.HeadCell className="border-gray-700 bg-black text-white">Brand</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Stock</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Sub Brand</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Status</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Action</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {productData?.products.map((product) => (
            <Table.Row key={product._id} className="border-gray-700 bg-zinc-950">
              <Table.Cell className="whitespace-nowrap font-medium text-white">
                {product.name}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap text-white">
                {product.category?.categoryName}
              </Table.Cell>
              {/* <Table.Cell className="whitespace-nowrap text-white">
                {product.category?.categoryType}
              </Table.Cell> */}
              <Table.Cell className="whitespace-nowrap text-white">
                {product.brand?.name}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap text-white">
                {product.stock}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap text-white">
                {product.subBrand?.subBrandName}
              </Table.Cell>
              <Table.Cell className={`whitespace-nowrap ${product.active ? "text-green-500" : "text-red-500"}`}>
                {product.active ? "Active" : "Inactive"}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                <Dropdown label="Actions" inline className="bg-black text-white border-black">
                  <Dropdown.Item
                    className="text-gray-300 hover:!bg-orange-600"
                    onClick={() => openModal(product)}
                  >
                    Edit Product
                  </Dropdown.Item>
                  {product.active ? (
                    <Dropdown.Item
                      className="text-gray-300 hover:!bg-orange-600"
                      onClick={() => handleDeactivateProduct(product)}
                    >
                      Deactivate Product
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item
                      className="text-gray-300 hover:!bg-orange-600"
                      onClick={() => handleActivateProduct(product)}
                    >
                      Activate Product
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item
                    className="text-gray-300 hover:!bg-orange-600"
                    onClick={() => handleShowVariants(product._id)}
                  >
                    Show Variants
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="text-gray-300 hover:!bg-orange-600"
                    onClick={() => handleAddVariants(product._id)}
                  >
                    Add Variants
                  </Dropdown.Item>
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <PopUpModal isOpen={isModalOpen} onClose={closeModal} title={"Edit product"}>
        <productForm id={selectedProduct?.productId} name={selectedProduct?.name} closeModal={closeModal} />
      </PopUpModal>

      {isApiLoading && <LoadingScreen />}
      <ToastContainer />
    </div>
  );
};

export default ProductTable;
