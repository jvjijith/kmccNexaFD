import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Table } from "flowbite-react";
import { useGetData, usePutData } from "../../common/api";
import LoadingScreen from "../ui/loading/loading";
import PopUpModal from "../ui/modal/modal";
import { ToastContainer } from "react-toastify";

const VarientTable = ({ productId }) => {
  const navigate = useNavigate();
  
  const [selectedVarient, setSelectedVarient] = useState(null);

  const { data: varientData, refetch: refetchVarients, isLoading } = useGetData("varients", `/variant/product/${productId}`);

  const { mutate: deactivateProduct } = usePutData(
    "deactivateVariants",
    `/variant/deactivate/${selectedVarient?._id}`,
    {
      onSuccess: () => refetchVarients(),
    }
  );
  
  const { mutate: activateProduct } = usePutData(
    "activateVariants",
    `/variant/activate/${selectedVarient?._id}`,
    {
      onSuccess: () => refetchVarients(),
    }
  );


  const handleDeactivateProduct = (variant) => {
    setSelectedVarient(variant);
    deactivateProduct();
  };

  const handleActivateProduct = (variant) => {
    setSelectedVarient(variant);
    activateProduct();
  };

  const handleAddVariants = (productId) => {
    navigate(`/variant/add`, { state: { productId } });
  };

  const handleShowVariants = (productId) => {
    navigate(`/variant/list`, { state: { productId } });
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white">Name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Color</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Size</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Model</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Status</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Action</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {varientData?.map((variant) => (
            <Table.Row key={variant._id} className="border-gray-700 bg-zinc-950">
              <Table.Cell className="whitespace-nowrap font-medium text-white">
                {variant.name}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap text-white">
                {variant.color}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap text-white">
                {variant.size}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap text-white">
                {variant.model}
              </Table.Cell>
              <Table.Cell className={`whitespace-nowrap ${variant.active ? "text-green-500" : "text-red-500"}`}>
                {variant.active ? "Active" : "Inactive"}
              </Table.Cell>
              <Table.Cell className="text-gray-300">
                <Dropdown label="Actions" inline className="bg-black text-white border-black">
                  <Dropdown.Item
                    className="text-gray-300 hover:!bg-orange-600"
                    onClick={() => navigate(`/variant/add`, { state: { variant, productId }})}
                  >
                    Edit Variant
                  </Dropdown.Item>
                  {variant.active ? (
                    <Dropdown.Item
                      className="text-gray-300 hover:!bg-orange-600"
                      onClick={() => handleDeactivateProduct(variant)}
                    >
                      Deactivate Variant
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item
                      className="text-gray-300 hover:!bg-orange-600"
                      onClick={() => handleActivateProduct(variant)}
                    >
                      Activate Variant
                    </Dropdown.Item>
                  )}
                  {/* <Dropdown.Item
                    className="text-gray-300 hover:!bg-orange-600"
                    onClick={() => handleShowVariants(variant.productId)}
                  >
                    Show Variants
                  </Dropdown.Item> */}
                  {/* <Dropdown.Item
                    className="text-gray-300 hover:!bg-orange-600"
                    onClick={() => handleAddVariants(variant.productId)}
                  >
                    Add Variants
                  </Dropdown.Item> */}
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <ToastContainer />
    </div>
  );
};

export default VarientTable;
