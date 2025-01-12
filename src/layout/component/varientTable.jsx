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
      <Table theme={{ dark: true }}
      className="border border-border rounded-lg">
        <Table.Head className=" bg-secondary-card text-text-color">
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Name</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Color</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Size</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Model</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Status</Table.HeadCell>
          <Table.HeadCell className="border-border bg-table-heading text-text-color">Action</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-border">
          {varientData?.map((variant) => (
            <Table.Row key={variant._id} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="border-borderwhitespace-nowrap font-medium text-text-color">
                {variant.name}
              </Table.Cell>
              <Table.Cell className="border-borderwhitespace-nowrap text-text-color">
                {variant.color}
              </Table.Cell>
              <Table.Cell className="border-borderwhitespace-nowrap text-text-color">
                {variant.size}
              </Table.Cell>
              <Table.Cell className="border-borderwhitespace-nowrap text-text-color">
                {variant.model}
              </Table.Cell>
              <Table.Cell className={`whitespace-nowrap ${variant.active ? "text-green-500" : "text-red-500"}`}>
                {variant.active ? "Active" : "Inactive"}
              </Table.Cell>
              <Table.Cell className="border-bordertext-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => navigate(`/variant/add`, { state: { variant, productId }})}
                  >
                    Edit Variant
                  </Dropdown.Item>
                  {variant.active ? (
                    <Dropdown.Item
                      className="text-text-color hover:!bg-orange-600"
                      onClick={() => handleDeactivateProduct(variant)}
                    >
                      Deactivate Variant
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item
                      className="text-text-color hover:!bg-orange-600"
                      onClick={() => handleActivateProduct(variant)}
                    >
                      Activate Variant
                    </Dropdown.Item>
                  )}
                  {/* <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => handleShowVariants(variant.productId)}
                  >
                    Show Variants
                  </Dropdown.Item> */}
                  {/* <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
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
