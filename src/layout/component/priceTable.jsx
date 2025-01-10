import React, { useEffect, useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData, usePutData } from "../../common/api";
import PopUpModal from "../ui/modal/modal";
import LoadingScreen from "../ui/loading/loading";
import { ToastContainer, toast } from 'react-toastify';
import PriceForm from "./priceForm";

function PriceTable() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  const { data, isLoading, error, refetch } = useGetData("pricing", "/pricing/", {});
  const { mutate: deactivatePrice } = usePutData("deactivatePrice", `/pricing/deactivate/${selectedPrice?._id}`);
  const { mutate: activatePrice } = usePutData("activatePrice", `/pricing/activate/${selectedPrice?._id}`);

  const navigate = useNavigate();

    // Simulate loading for 10 seconds before showing content
    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000); // 10 seconds delay
  
      return () => clearTimeout(timer); // Cleanup timeout on unmount
    }, []);

  const openModal = (Price) => {
    setSelectedPrice(Price);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPrice(null);
    setModalOpen(false);
  };

  const handleDeactivatePrice = (Price) => {
    setSelectedPrice(Price);
    setApiLoading(true);
    deactivatePrice(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`Price deactivated successfully!`, { toastId: `deactivate-${Price._id}` });
          setApiLoading(false);
          closeModal();
        },
        onError: (error) => {
          console.error("Error deactivating Price:", error);
          toast.error(`Error deactivating Price `, { toastId: `deactivate-${Price._id}` });
          setApiLoading(false);
          closeModal();
        },
      }
    );
  };

  const handleActivatePrice = (Price) => {
    setSelectedPrice(Price);
    setApiLoading(true);
    activatePrice(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`Price  activated successfully!`, { toastId: `activate-${Price._id}` });
          setApiLoading(false);
          closeModal();
        },
        onError: (error) => {
          console.error("Error activating Price:", error);
          toast.error(`Error activating Price `, { toastId: `activate-${Price._id}` });
          setApiLoading(false);
          closeModal();
        },
      }
    );
  };

  if ( isLoading || loading ) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-secondary-card text-text-color">
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Product</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Variant</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Amount</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Currency</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Discount</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Status</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-secondary-card text-text-color">Action</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {data.map((price) => (
            <Table.Row key={price._id} className="border-gray-700 bg-secondary-card">
              <Table.Cell className="whitespace-nowrap font-medium text-text-color">
                {price?.productId?.name || "N/A"}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap text-text-color">
                {price?.variantId?.name || 'N/A'}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap text-text-color">
                {price?.pricing?.[0]?.amount || 'N/A'}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap text-text-color">
                {price?.pricing?.[0]?.currency || 'N/A'}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap text-text-color">
                {price?.pricing?.[0]?.discount || 'N/A'}
              </Table.Cell>
              <Table.Cell className={`whitespace-nowrap ${price?.active ? "text-green-500" : "text-red-500"}`}>
                {price?.active ? "Active" : "Inactive"}
              </Table.Cell>
              <Table.Cell className="text-text-color">
                <Dropdown label="Actions" inline className="bg-secondary-card text-text-color border-black">
                  <Dropdown.Item
                    className="text-text-color hover:!bg-orange-600"
                    onClick={() => openModal(price)}
                  >
                    Edit Price
                  </Dropdown.Item>
                  {price?.active ? (
                    <Dropdown.Item
                      className="text-text-color hover:!bg-orange-600"
                      onClick={() => handleDeactivatePrice(price)}
                    >
                      Deactivate Price
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item
                      className="text-text-color hover:!bg-orange-600"
                      onClick={() => handleActivatePrice(price)}
                    >
                      Activate Price
                    </Dropdown.Item>
                  )}
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <PopUpModal isOpen={isModalOpen} onClose={closeModal} title={"Edit Price"}>
        <PriceForm priceId={selectedPrice?._id} closeModal={closeModal} />
      </PopUpModal>

      {isApiLoading && <LoadingScreen />}
      <ToastContainer />
    </div>
  );
}

export default PriceTable;
