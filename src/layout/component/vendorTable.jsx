import { useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData, usePutData } from "../../common/api";
import { toast } from "react-toastify";
import LoadingScreen from "../ui/loading/loading";

function VendorTable() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);

  const { data: vendorData, isLoading, error, refetch } = useGetData("VendorData", "/vendor", {});
  const { mutate: deactivateVendor } = usePutData("deactivateVendor", `/vendor/deactivate/${selectedVendor?._id}`);
  const { mutate: activateVendor } = usePutData("activateVendor", `/vendor/activate/${selectedVendor?._id}`);

  const navigate = useNavigate();

  const openModal = (vendor) => {
    setSelectedVendor(vendor);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedVendor(null);
    setModalOpen(false);
  };

  const handleDeactivateVendor = (vendor) => {
    setSelectedVendor(vendor);
    setApiLoading(true);
    deactivateVendor(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`Vendor ${vendor.name} deactivated successfully!`, { toastId: `deactivate-${vendor._id}` });
          setApiLoading(false);
          closeModal();
        },
        onError: (error) => {
          console.error("Error deactivating vendor:", error);
          toast.error(`Error deactivating vendor ${vendor.name}`, { toastId: `deactivate-${vendor._id}` });
          setApiLoading(false);
          closeModal();
        },
      }
    );
  };

  const handleActivateVendor = (vendor) => {
    setSelectedVendor(vendor);
    setApiLoading(true);
    activateVendor(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`Vendor ${vendor.name} activated successfully!`, { toastId: `activate-${vendor._id}` });
          setApiLoading(false);
          closeModal();
        },
        onError: (error) => {
          console.error("Error activating vendor:", error);
          toast.error(`Error activating vendor ${vendor.name}`, { toastId: `activate-${vendor._id}` });
          setApiLoading(false);
          closeModal();
        },
      }
    );
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="overflow-x-auto min-h-96">
      <Table theme={{ dark: true }}>
        <Table.Head className="border-gray-700 bg-black text-white">
          <Table.HeadCell className="border-gray-700 bg-black text-white">Vendor name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Country</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Category</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">State</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Location</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Number of Contacts</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {vendorData && vendorData.customers.map((vendor, index) => (
            <Table.Row key={index} className="border-gray-700 bg-zinc-950">
              <Table.Cell className="whitespace-nowrap font-medium text-white">{vendor.name}</Table.Cell>
              <Table.Cell className="text-gray-300">{vendor.country}</Table.Cell>
              <Table.Cell className="text-gray-300">{vendor.category}</Table.Cell>
              <Table.Cell className="text-gray-300">{vendor.state}</Table.Cell>
              <Table.Cell className="text-gray-300">{vendor.location}</Table.Cell>
              <Table.Cell className="text-gray-300">{vendor.identificationNumbers ? vendor.identificationNumbers.length : 0}</Table.Cell>
              <Table.Cell className="text-gray-300">
                <Dropdown label="Actions" inline className="bg-black text-white border-black">
                  <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() => navigate(`/vendor/edit`, { state: { vendor } })}>
                    Edit vendor
                  </Dropdown.Item>
                  {/* <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() => navigate(`/deletevendor/${vendor.vendorUserId}`, { state: { vendor } })}>
                    Delete Vendor
                  </Dropdown.Item> */}
                  <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() => navigate(`/addContacts/${vendor.vendorUserId}`, { state: { vendor } })}>
                    Add Contacts
                  </Dropdown.Item>
                  {vendor.active ? (
                    <Dropdown.Item
                      className="text-gray-300 hover:!bg-orange-600"
                      onClick={() => handleDeactivateVendor(vendor)}
                    >
                      Deactivate Vendor
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item
                      className="text-gray-300 hover:!bg-orange-600"
                      onClick={() => handleActivateVendor(vendor)}
                    >
                      Activate Vendor
                    </Dropdown.Item>
                  )}
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}

export default VendorTable;
