import { useState } from "react";
import { Dropdown, Table } from "flowbite-react";
import { useNavigate } from "react-router";
import { useGetData, usePutData } from "../../common/api";
import { toast } from "react-toastify";
import LoadingScreen from "../ui/loading/loading";

function CustomerTable() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isApiLoading, setApiLoading] = useState(false);

  const { data: customerData, isLoading, error, refetch } = useGetData("CustomerData", "/customer", {});
  const { mutate: deactivateCustomer } = usePutData("deactivateCustomer", `/customer/deactivate/${selectedCustomer?._id}`);
  const { mutate: activateCustomer } = usePutData("activateCustomer", `/customer/activate/${selectedCustomer?._id}`);

  const navigate = useNavigate();

  const openModal = (customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setModalOpen(false);
  };

  const handleDeactivateCustomer = (customer) => {
    setSelectedCustomer(customer);
    setApiLoading(true);
    deactivateCustomer(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`Customer ${customer.name} deactivated successfully!`, { toastId: `deactivate-${customer._id}` });
          setApiLoading(false);
          closeModal();
        },
        onError: (error) => {
          console.error("Error deactivating customer:", error);
          toast.error(`Error deactivating customer ${customer.name}`, { toastId: `deactivate-${customer._id}` });
          setApiLoading(false);
          closeModal();
        },
      }
    );
  };

  const handleActivateCustomer = (customer) => {
    setSelectedCustomer(customer);
    setApiLoading(true);
    activateCustomer(
      {},
      {
        onSuccess: () => {
          refetch();
          toast.success(`Customer ${customer.name} activated successfully!`, { toastId: `activate-${customer._id}` });
          setApiLoading(false);
          closeModal();
        },
        onError: (error) => {
          console.error("Error activating customer:", error);
          toast.error(`Error activating customer ${customer.name}`, { toastId: `activate-${customer._id}` });
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
          <Table.HeadCell className="border-gray-700 bg-black text-white">Customer name</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Country</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Category</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">State</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Location</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Number of Contacts</Table.HeadCell>
          <Table.HeadCell className="border-gray-700 bg-black text-white">Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {customerData && customerData.customers.map((customer, index) => (
            <Table.Row key={index} className="border-gray-700 bg-zinc-950">
              <Table.Cell className="whitespace-nowrap font-medium text-white">{customer.name}</Table.Cell>
              <Table.Cell className="text-gray-300">{customer.country}</Table.Cell>
              <Table.Cell className="text-gray-300">{customer.category}</Table.Cell>
              <Table.Cell className="text-gray-300">{customer.state}</Table.Cell>
              <Table.Cell className="text-gray-300">{customer.location}</Table.Cell>
              <Table.Cell className="text-gray-300">{customer.identificationNumbers ? customer.identificationNumbers.length : 0}</Table.Cell>
              <Table.Cell className="text-gray-300">
                <Dropdown label="Actions" inline className="bg-black text-white border-black">
                  <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() => navigate(`/customer/edit/${customer._id}`)}>
                    Edit Customer
                  </Dropdown.Item>
                  <Dropdown.Item className="text-gray-300 hover:!bg-orange-600" onClick={() => navigate(`/customer/addContact`, { state: { customer } })}>
                    Add Contacts
                  </Dropdown.Item>
                  {customer.active ? (
                    <Dropdown.Item
                      className="text-gray-300 hover:!bg-orange-600"
                      onClick={() => handleDeactivateCustomer(customer)}
                    >
                      Deactivate Customer
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item
                      className="text-gray-300 hover:!bg-orange-600"
                      onClick={() => handleActivateCustomer(customer)}
                    >
                      Activate Customer
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

export default CustomerTable;
